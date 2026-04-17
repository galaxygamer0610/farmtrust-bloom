import pandas as pd
import numpy as np

def clean_data(input_path: str, output_path: str):
    print(f"Loading dataset from {input_path}...")
    df = pd.read_csv(input_path)
    
    # 0. Handle Missing Values (DropNA and FillNA)
    print("Handling missing values...")
    # Drop rows where target or key identifiers are missing
    df = df.dropna(subset=['Financial_Risk_Level', 'Enterprise_ID'])
    
    # Fill numeric variables with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    
    # Fill categorical variables with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        df[col] = df[col].fillna(df[col].mode()[0])
        
    # 1. Handle Negative Revenue Anomaly
    # Found some negative Revenue values which is impossible.
    # We will compute the absolute value, or cap at 0, or infer from Net_Profit+Expenses.
    # Let's infer from Net_Profit + Expenses if it makes mathematical sense, otherwise set to 0.
    imputed_revenue = df['Net_Profit'] + df['Expenses']
    
    # Replace negative explicitly
    neg_mask = df['Revenue'] < 0
    num_neg = neg_mask.sum()
    print(f"Fixed {num_neg} rows with negative Revenue.")
    df.loc[neg_mask, 'Revenue'] = imputed_revenue[neg_mask]
    
    # Ensure minimum revenue is at least 0 after imputation
    df['Revenue'] = np.clip(df['Revenue'], a_min=0, a_max=None)
    
    # 2. Rescale Policy Support Score
    # The dataset has Policy_Support_Score from 0 to 10.
    # Our SRS requires it to be an integer from 1 to 4.
    # Map: 0-2 -> 1, 3-5 -> 2, 6-8 -> 3, 9-10 -> 4
    bins = [-1, 2, 5, 8, 10]
    labels = [1, 2, 3, 4]
    df['Policy_Support_Score'] = pd.cut(df['Policy_Support_Score'], bins=bins, labels=labels).astype(int)
    print("Rescaled Policy_Support_Score from 0-10 scale to 1-4 scale.")
    
    # 3. Z-Score Outlier Handling (Clipping)
    # Using Z-score to clip extreme outliers (values beyond 3 standard deviations)
    fin_cols = ['Revenue', 'Expenses', 'Loan_Amount', 'Net_Profit']
    for col in fin_cols:
        mean_val = df[col].mean()
        std_val = df[col].std()
        
        # Calculate bounds for Z=3
        lower_bound = mean_val - (3 * std_val)
        upper_bound = mean_val + (3 * std_val)
        
        # Clip
        df[col] = np.clip(df[col], a_min=lower_bound, a_max=upper_bound)
    print("Capped extreme numeric outliers using Z-score (Z=3).")

    # Save cleaned dataset
    df.to_csv(output_path, index=False)
    print(f"Cleaned dataset saved to {output_path}")

if __name__ == "__main__":
    clean_data('AgriRiskFin_Dataset.csv', 'AgriRiskFin_Dataset_Cleaned.csv')
