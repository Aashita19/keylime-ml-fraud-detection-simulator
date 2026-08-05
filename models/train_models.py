import pickle
import pandas as pd
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier


def load_train_save(training_data_path, validation_data_path, model_destination_path):
    X_train, y_train, X_val, y_val = load_data(training_data_path, validation_data_path)

    trained_xgb_model = train_xgboost(X_train, y_train, X_val, y_val, 
                                      1000, 0.05, 6, 0.8, 0.8, 'hist')

    trained_lgbm_model = train_lightgbm(X_train, y_train, X_val, y_val, 
                                        1000, 0.05, 60, -1, 0.8, 0.8)

    save_model(trained_xgb_model, model_destination_path + '/xgboost.pkl')
    save_model(trained_lgbm_model, model_destination_path + '/lightgbm.pkl')
    


def load_data(training_data_path, validation_data_path):
    training_df = pd.read_csv(training_data_path)
    validation_df = pd.read_csv(validation_data_path)

    X_train = training_df.drop(columns=['fraud'])
    y_train = training_df[['fraud']]

    X_val = validation_df.drop(columns=['fraud'])
    y_val = validation_df[['fraud']]

    return X_train, y_train, X_val, y_val


def train_xgboost(X_train, y_train, X_val, y_val, n_estimators, learning_rate, 
                  max_depth, subsample, colsample_bytree, tree_method):
    
    print('Training XGBoost model...')

    xgb_model = XGBClassifier(
        n_estimators = n_estimators,
        learning_rate = learning_rate,
        max_depth = max_depth,
        random_state = 42,
        scale_pos_weight = 11.5,
        subsample = subsample,
        colsample_bytree = colsample_bytree,
        tree_method = tree_method,
        eval_metric='auc'
    )

    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=100                     # prints AUC score every 100 trees
    )

    print('Finished training XGBoost model.')
    return xgb_model


def train_lightgbm(X_train, y_train, X_val, y_val, n_estimators, learning_rate, 
                   num_leaves, max_depth, bagging_fraction, feature_fraction):

    print('Training LightGBM model...')
    
    lgbm_model = LGBMClassifier(
        boosting_type = 'gbdt',
        n_estimators = n_estimators,
        learning_rate = learning_rate,
        max_depth = max_depth,
        num_leaves = num_leaves,
        is_unbalance = True,
        bagging_fraction = bagging_fraction,
        bagging_freq = 1,
        feature_fraction = feature_fraction,
        early_stopping_round = 50,
        random_state = 42
    )

    lgbm_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        eval_metric='auc'
    )

    print('Finished training LightGBM model.')
    return lgbm_model


def save_model(model, model_destination_path):
    with open(model_destination_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model successfully saved to {model_destination_path}")



load_train_save('data/processed/train.csv', 'data/processed/val.csv', 'models/saved')