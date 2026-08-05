# Streams rows from a CSV through the (shared) PredictionService and
# broadcasts each prediction over the WebSocket.
import sys
from pathlib import Path

main_dir = Path(__file__).resolve().parent.parent.parent
if str(main_dir) not in sys.path:
    sys.path.insert(0, str(main_dir))

from backend.database_models import TransactionRecord
from backend.database import SessionLocal
from repositories.transaction_repo import TransactionRepository
import asyncio
import pandas as pd
import random


class TransactionSimulator:
    # Supports:
    #   - pause() / resume(): freezes/unfreezes in place, mid-stream.
    #   - restart(): clears all stored transactions and rewinds to row 0.

    # `start()` runs forever in a background task (kicked off once in
    # app.py's lifespan). After it streams through the whole CSV once, it
    # idles until restart() is called, then streams again from row 0 — this
    # is what lets the "Restart" button in the UI work without needing to
    # kill and recreate the asyncio task.

    def __init__(self, websocket_manager, prediction_service, data_path: str,
                 min_wait: float, max_wait: float):
        self.websocket_manager = websocket_manager
        self.prediction_service = prediction_service
        self.data_path = data_path
        self.data = pd.read_csv(data_path)
        self._row_dicts = self.data.to_dict(orient="records")
        self.min_wait = min_wait
        self.max_wait = max_wait

        self._current_index = 0
        self._is_running = False
        self._is_complete = False

        # Cleared (paused) = _stream_rows() blocks here until set again.
        self._resume_event = asyncio.Event()
        self._resume_event.set()  # starts unpaused

        # Signals the outer start() loop to begin a fresh pass after the
        # simulation has completed and is idling.
        self._restart_event = asyncio.Event()

    @property
    def status(self):
        return {
            "is_running": self._is_running,
            "is_paused": not self._resume_event.is_set(),
            "is_complete": self._is_complete,
            "current_index": self._current_index,
            "total_rows": len(self._row_dicts),
        }

    def pause(self):
        self._resume_event.clear()

    def resume(self):
        self._resume_event.set()

    async def restart(self):
        # Clears stored transactions and rewinds to row 0.
        # NOTE: if called mid-stream (simulation not yet complete), the
        # currently-running _stream_rows() loop notices _current_index==0
        # on its next iteration and naturally starts over from the top —
        # no need to cancel/recreate the task.
        db = SessionLocal()
        try:
            TransactionRepository.delete_all(db)
        finally:
            db.close()

        self._current_index = 0
        self._is_complete = False
        self._resume_event.set()
        self._restart_event.set()
        await self.websocket_manager.broadcast({"type": "simulation_restarted"})

    async def start(self):
        self._is_running = True
        while True:
            await self._stream_rows()

            self._is_complete = True
            await self.websocket_manager.broadcast({"type": "simulation_complete"})

            await self._restart_event.wait()
            self._restart_event.clear()

    async def _stream_rows(self):
        while self._current_index < len(self._row_dicts):
            # Blocks here while paused; unblocks as soon as resume() sets
            # the event again.
            await self._resume_event.wait()

            i = self._current_index
            row_dict = dict(self._row_dicts[i])
            actual_fraud = row_dict.pop("fraud", None)
            prediction = self.prediction_service.predict_transaction(row_dict)

            db = SessionLocal()
            try:
                record = TransactionRecord(**row_dict, **prediction)
                TransactionRepository.save(db, record)
            finally:
                db.close()

            # every row, table updates
            await self.websocket_manager.broadcast(
                {"type": "transaction", **row_dict, **prediction, "actual_fraud": actual_fraud}
            )

            # every N rows, SHAP updates
            if (i + 1) % self.prediction_service.shap_batch_size == 0:
                explanations = self.prediction_service.compute_batch_shap()
                await self.websocket_manager.broadcast({"type": "shap_update", "explanations": explanations})

            self._current_index += 1

            wait_time = random.uniform(self.min_wait, self.max_wait)
            await asyncio.sleep(wait_time)