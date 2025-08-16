import pandas as pd
import numpy as np
import joblib
import os
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.semi_supervised import LabelSpreading
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              matthews_corrcoef, roc_auc_score)
from imblearn.over_sampling import SMOTE

MODEL_DIR = 'prediction_models'
os.makedirs(MODEL_DIR, exist_ok=True)

#这里采用手动定义f2分数的情况
def f2_score(y_true, y_pred, zero_division=0):
    precision = precision_score(y_true, y_pred, zero_division=zero_division)
    recall = recall_score(y_true, y_pred, zero_division=zero_division)
    if precision == 0 and recall == 0:
        return 0.0
    return (5 * precision * recall) / (4 * precision + recall)


data = pd.read_csv('scan_stats.csv')
feature_columns = [
    'eth_balance', 'total_txs', 'sent_txs', 'received_txs',
    'sent_to_contract_txs', 'received_from_contract_txs',
    'external_txs','internal_txs'
]
X = data[feature_columns].copy()
user_addresses = data['address'].copy()

imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

stable_k = 5
cluster_size_history = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X_scaled)
    cluster_sizes = pd.Series(cluster_labels).value_counts()
    largest_size = cluster_sizes.max()
    cluster_size_history.append(largest_size)

    if len(cluster_size_history) >= 3:
        change1 = abs(cluster_size_history[-1] - cluster_size_history[-2]) / cluster_size_history[-2]
        change2 = abs(cluster_size_history[-2] - cluster_size_history[-3]) / cluster_size_history[-3]
        if change1 < 0.01 and change2 < 0.01:
            stable_k = k
            break

kmeans_final = KMeans(n_clusters=stable_k, random_state=42, n_init=10)
final_cluster_labels = kmeans_final.fit_predict(X_scaled)
cluster_sizes = pd.Series(final_cluster_labels).value_counts()
casual_cluster_label = cluster_sizes.idxmax()
is_casual = (final_cluster_labels == casual_cluster_label)

print(f"动态确定的最优k值: {stable_k}")
print(f"普通用户（最大簇）数量: {sum(is_casual)}")
print(f"潜在专业用户（其他簇）数量: {len(X) - sum(is_casual)}")

semi_labels = np.full(len(X_scaled), -1)
semi_labels[is_casual] = 0

tsvm_simulator = LabelSpreading(
    kernel='rbf',
    gamma=0.1,
    alpha=0.2,
    max_iter=500,
    n_jobs=-1
)
tsvm_simulator.fit(X_scaled, semi_labels)

semi_pred = tsvm_simulator.transduction_
semi_pred[semi_pred != 0] = 1

unique_classes = np.unique(semi_pred)
print(f"半监督预测的类别: {unique_classes}")

X_train = X_scaled
y_train = semi_pred

if len(unique_classes) < 2:
    print(f"警告：半监督预测仅产生{len(unique_classes)}个类别，手动调整标签")
    if 0 in unique_classes:
        y_train[:5] = 1
    else:
        y_train[:5] = 0
    X_train_resampled, y_train_resampled = X_train, y_train
else:
    smote = SMOTE(random_state=42, sampling_strategy=0.3)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    print(f"SMOTE过采样后 - 普通用户: {np.sum(y_train_resampled == 0)}, 专业用户: {np.sum(y_train_resampled == 1)}")

rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    class_weight={0: 1, 1: 20},
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train_resampled, y_train_resampled)


rf_pred_proba = rf.predict_proba(X_scaled)[:, 1]
final_pred = ((semi_pred == 1) & (rf_pred_proba > 0.4)).astype(int)

final_counts = pd.Series(final_pred).value_counts()
print(f"\n最终分类结果:")
print(f"普通用户: {final_counts.get(0, 0)}")
print(f"专业用户: {final_counts.get(1, 0)}")


pseudo_labels = np.where(is_casual, 0, 1)
print("\n评估指标:")
print(f"AUC-ROC: {roc_auc_score(pseudo_labels, rf_pred_proba):.4f}")
print(f"F2分数: {f2_score(pseudo_labels, final_pred):.4f}")
print(f"MCC: {matthews_corrcoef(pseudo_labels, final_pred):.4f}")
print(f"准确率: {accuracy_score(pseudo_labels, final_pred):.4f}")
print(f"召回率: {recall_score(pseudo_labels, final_pred):.4f}")


joblib.dump(rf, os.path.join(MODEL_DIR, 'random_forest_classifier.pkl'))

joblib.dump(imputer, os.path.join(MODEL_DIR, 'imputer.pkl'))

joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))

print(f"\n已保存预测必需的3个核心模型至 {MODEL_DIR} 目录")
print(f"保存的文件: {os.listdir(MODEL_DIR)}")


result = pd.DataFrame({
    'address': user_addresses,
    'user_type': np.where(final_pred == 1, 'professional', 'normal')
})
result = pd.concat([result, data[feature_columns]], axis=1)
result.to_csv('ethereum_professional_users_final.csv', index=False)
print("\n结果已保存至 'ethereum_professional_users_final.csv'")





