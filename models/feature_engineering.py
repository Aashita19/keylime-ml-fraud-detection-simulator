import pandas as pd

# Not much to engineer bc its already done. This won't improve 
# the model performance much since this dataset is synthetically generated
# from geometric patterns and easy to get high auc scores with random forests
# still included though so that it can be used for explainability if added later

# Add all features to the input DataFrameat once
def engineer_features(df):
    df = add_distance_ratio(df)
    df = add_security_flags(df)
    df = add_risky_combo(df)
    df = add_distance_buckets(df)
    return df

# Add a new feature that is the ratio of distance from last transaction to distance from home
def add_distance_ratio(df):
    df['distance_ratio'] = df['distance_from_last_transaction'] / (df['distance_from_home'] + 1e-6)  # Adding a small constant to avoid division by zero
    return df

# Add a new feature that counts the number of security flags for each transaction
def add_security_flags(df):
    df['security_flags'] = (
        (df['used_chip'] == 0).astype(int) +
        (df['used_pin_number'] == 0).astype(int) +
        (df['online_order'] == 1).astype(int)
    )
    return df

# Add a new feature that indicates if a transaction is a risky combination of online order and no PIN used
def add_risky_combo(df):
    df['risky_combo'] = ((df['online_order'] == 1) & (df['used_pin_number'] == 0)).astype(int)
    return df

# Add a new feature that categorizes the distance from home into buckets
def add_distance_buckets(df):
    df['distance_from_home_bucket'] = pd.cut(
        df['distance_from_home'],
        bins=[0, 10, 50, 200, float('inf')],
        labels=['local', 'nearby', 'regional', 'far']
    )
    return df