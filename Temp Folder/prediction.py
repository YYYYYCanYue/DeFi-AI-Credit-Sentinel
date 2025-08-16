import pandas as pd
import joblib
import os

feature_columns = [
    'eth_balance', 'total_txs', 'sent_txs', 'received_txs',
    'sent_to_contract_txs', 'received_from_contract_txs',
    'external_txs','internal_txs'
]

MODEL_DIR = 'prediction_models'


def predict_professional(user_features):
    """修复特征名称警告的预测函数"""
    clf = joblib.load(os.path.join(MODEL_DIR, 'random_forest_classifier.pkl'))
    imputer = joblib.load(os.path.join(MODEL_DIR, 'imputer.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))


    if isinstance(user_features, dict):

        features_df = pd.DataFrame([user_features])[feature_columns]
    elif isinstance(user_features, pd.Series):

        features_df = pd.DataFrame([user_features])[feature_columns]
    else:

        features_df = pd.DataFrame([user_features], columns=feature_columns)


    features_imputed = imputer.transform(features_df)
    features_scaled = scaler.transform(features_imputed)


    pro = clf.predict_proba(features_scaled)[0, 1]
    return float(pro)
