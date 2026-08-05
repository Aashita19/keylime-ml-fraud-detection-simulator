# Dataset has already been cleaned. Scaling is not required for random forest models.
# TRAINING = 70%, VALIDATION = 15%, TESTING = 15%
import os
import pandas as pd
from sklearn.model_selection import train_test_split


def split_save(raw_csv_path, split_data_destination):
    raw_df = pd.read_csv(raw_csv_path)
    train_df, val_df, test_df = split_data(raw_df)

    train_df.to_csv(os.path.join(split_data_destination, "train.csv"), index=False)
    print(f"\nTraining dataset saved to {split_data_destination}/train.csv")

    val_df.to_csv(os.path.join(split_data_destination, "val.csv"), index=False)
    print(f"\nValidation dataset saved to {split_data_destination}/val.csv")

    test_df.to_csv(os.path.join(split_data_destination, "test.csv"), index=False)
    print(f"\nTesting dataset saved to {split_data_destination}/test.csv\n")


def split_data(df):
    
    temp_df, test_df = train_test_split(df, test_size=0.15, random_state=42, stratify=df['fraud'])

    train_df, val_df = train_test_split(temp_df, test_size=0.17647, random_state=42, stratify=temp_df['fraud'])   
    # 15/85 = 0.17647, so that the final split is 70% train, 15% validation, 15% test

    print(f"Train rows: {len(train_df)} | Val rows: {len(val_df)} | Test rows: {len(test_df)}")
    return train_df, val_df, test_df

# Run the function to split and save the data to the specified destination path.
split_save("data/raw/card_transdata.csv", "data/processed/")









