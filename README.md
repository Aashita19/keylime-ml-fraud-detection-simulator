# **🍋‍🟩 KeyLime: ML Fraud Detection Simulator**

An interactive simulator that streams synthetic credit card transactions through a live fraud-detection pipeline. Allows the user to pick XGBoost or LightGBM models and watch how each one performs. 

[Demo](assets/demo.gif) 
[SelectorLightMode](assets/selector_lightMode.png) 
[SelectorDarkMode](assets/selector_darkMode.png) 


## **Why I Built This**

I read an industry paper on building real-time fraud detection pipelines (\[Boggavarapu, 2025\] ([https\://doi.org/10.30574/wjaets.2025.15.3.0978](https://doi.org/10.30574/wjaets.2025.15.3.0978))) and wanted to understand how live data streaming actually works without using Apache Kafka. I built a small version myself, then took it in my own direction to create a custom simulator that allowed users to choose between tree-based machine learning models (XGBoost and LightGBM) and compare them. I designed the UI with a key lime color scheme because I liked the colors.

Dataset is from Kaggle: [https\://www\.kaggle.com/datasets/dhanushnarayananr/credit-card-fraud](https://www.kaggle.com/datasets/dhanushnarayananr/credit-card-fraud) 

## **What it Does**

- Replays synthetic transaction data a live stream  
- Scores each transaction with the model the user chooses (XGBoost or LightGBM)  
- Live dashboard with a risk gauge, transaction feed, fraud-rate charts, and feature importance  
- Model analytics page with ROC curve, AUC, F1, log loss, RMSE, MAE  
- Pause, resume, and restart controls  
- Light and Dark mode

## **How It Works**

[Architecture](assets/architecture.png)   
*Made on Canva*

| Layer in the Paper | Industry Tool | This Simulation |
| :---- | :---- | :---- |
| **Data Ingestion** | Kafka / Kinesis | Simulator replays test rows with random delays |
| **Stream Processing** | Flink / Spark | Async Python loop: prediction per event |
| **Real-time Delivery** | N/A | WebSocket pushes each result to the browser |
| **Storage** | Event stores | SQLite |
| **Model Serving** | ML model servers | FastAPI with swappable XGBoost/LightGBM |
| **Monitoring** | Observability stack | Model Analytics page |

I did not implement Kafka, Flink, graph databases, or feature stores. My goal was to recreate the core idea at a small scale.

## **Tech Stack**

* Python  
* FastAPI  
* WebSockets  
* SQLAlchemy/SQLite  
* XGBoost  
* LightGBM  
* React  
* TypeScript  
* Recharts  
* Vite

## **Findings: XGBoost VS LightGBM**

| Metric | XGBoost | LightGBM |
| :---- | :---- | :---- |
| **AUC** | 0.997 | 0.9967 |
| **F1** | 0.9905 | 0.9882 |
| **Log Loss** | 0.0577 | 0.0721 |

\**Very high results due to the nature of the synthetic dataset. Explained more under Limitations\**

## **What I learned** 

- Understanding end-to-end data pipelines from stream ingestion to real-time UI rendering  
- Observing how XBBoost and LightGBM work differently in speed and memory usage  
- Balancing theoretical enterprise design (Kafka/Flink) with lightweight implementation choices

## **Limitations & Future Plans**

- The simulator uses synthetic replay data. Real-world credit card data involves more complex patterns   
- While the models achieved high metrics, these results are due to the pre-engineered and highly deterministic nature of the synthetic dataset rather than a real world production capability. These values are typically considered “too good to be true”.   
- The SQLite database database and async Python loop are optimized for local demo purposes, not for multi-million event throughput  
- Planning to implement real feature stores or adding SHAP values directly to the dashboard

