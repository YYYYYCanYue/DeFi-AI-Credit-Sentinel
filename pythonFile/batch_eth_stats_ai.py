import time
import json
import requests
import backoff
import pandas as pd
from typing import Dict, List

# -----------------------------
# 配置
# -----------------------------
API_KEY = "YOUR_ETHERSCAN_API_KEY"
BASE_URL = "https://api.etherscan.io/api"

RATE_LIMIT_PER_SEC = 5          # 基本限速（免费版常见阈值）
SLEEP_BETWEEN_CALLS = 1.0 / RATE_LIMIT_PER_SEC + 0.02
MAX_OFFSET = 10000              # etherscan 单页最大
USER_AGENT = "batch-eth-stats-ai/1.0"

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})

# -----------------------------
# 通用 GET + 速率控制
# -----------------------------
def _get(params: Dict) -> Dict:
    time.sleep(SLEEP_BETWEEN_CALLS)
    resp = session.get(BASE_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

# -----------------------------
# API 包装（带重试）
# -----------------------------
@backoff.on_exception(backoff.expo, (requests.RequestException,), max_time=90)
def get_eth_balance(address: str) -> float:
    params = {
        "module": "account", "action": "balance",
        "address": address, "tag": "latest", "apikey": API_KEY
    }
    data = _get(params)
    wei = int(data.get("result", "0"))
    return wei / 1e18

@backoff.on_exception(backoff.expo, (requests.RequestException,), max_time=90)
def is_contract(address: str, cache: Dict[str, bool]) -> bool:
    al = address.lower()
    if al in cache:
        return cache[al]
    params = {
        "module": "proxy", "action": "eth_getCode",
        "address": address, "tag": "latest", "apikey": API_KEY
    }
    data = _get(params)
    code = data.get("result", "0x")
    ok = (code is not None) and (code != "0x")
    cache[al] = ok
    return ok

@backoff.on_exception(backoff.expo, (requests.RequestException,), max_time=180)
def fetch_external_txs(address: str) -> List[Dict]:
    all_txs, page = [], 1
    while True:
        params = {
            "module": "account", "action": "txlist",
            "address": address, "startblock": 0, "endblock": 99999999,
            "page": page, "offset": MAX_OFFSET, "sort": "asc", "apikey": API_KEY
        }
        data = _get(params)
        result = data.get("result", [])
        if isinstance(result, str) and "No transactions found" in result:
            break
        if not isinstance(result, list) or not result:
            break
        all_txs.extend(result)
        if len(result) < MAX_OFFSET:
            break
        page += 1
    return all_txs

@backoff.on_exception(backoff.expo, (requests.RequestException,), max_time=180)
def fetch_internal_txs(address: str) -> List[Dict]:
    all_txs, page = [], 1
    while True:
        params = {
            "module": "account", "action": "txlistinternal",
            "address": address, "startblock": 0, "endblock": 99999999,
            "page": page, "offset": MAX_OFFSET, "sort": "asc", "apikey": API_KEY
        }
        data = _get(params)
        result = data.get("result", [])
        if isinstance(result, str) and "No transactions found" in result:
            break
        if not isinstance(result, list) or not result:
            break
        all_txs.extend(result)
        if len(result) < MAX_OFFSET:
            break
        page += 1
    return all_txs

# -----------------------------
# 统计并返回 AI 友好结构
# -----------------------------
def classify_for_address(address: str, contract_cache: Dict[str, bool]) -> Dict:
    addr = address.lower()

    # 余额
    balance_eth = get_eth_balance(address)

    # 外部 & 内部交易
    ext = fetch_external_txs(address)
    internal = fetch_internal_txs(address)

    sent_external = 0
    received_external = 0
    sent_to_contract = 0
    received_from_contract = 0

    # 外部交易分类（只统计成功交易）
    for tx in ext:
        if tx.get("isError") == "1":
            continue
        frm = (tx.get("from") or "").lower()
        to  = (tx.get("to") or "").lower()

        if frm == addr:
            # 发送：根据 to 是否为合约区分
            if to:
                if is_contract(to, contract_cache):
                    sent_to_contract += 1
                else:
                    sent_external += 1
        elif to == addr:
            # 接受：from 一般为 EOA；如为合约调用，仍归为“接受的交易”
            received_external += 1

    # 内部交易：合约执行产生的 value 转账（只统计成功 + 收到的）
    for itx in internal:
        if itx.get("isError") == "1":
            continue
        if (itx.get("to") or "").lower() == addr:
            received_from_contract += 1

    total_txs = len(ext) + len(internal)

    # —— AI 友好输出 ——（扁平、英文小写、数值化）
    return {
        "address": address,
        "eth_balance": round(balance_eth, 8),
        "total_txs": int(total_txs),
        "sent_txs": int(sent_external),
        "received_txs": int(received_external),
        "sent_to_contract_txs": int(sent_to_contract),
        "received_from_contract_txs": int(received_from_contract),
        "external_txs": int(len(ext)),
        "internal_txs": int(len(internal)),
    }

# -----------------------------
# IO
# -----------------------------
def load_addresses(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        raw = [x.strip() for x in f if x.strip()]
    # 去重保序（大小写不敏感）
    seen, out = set(), []
    for a in raw:
        al = a.lower()
        if al not in seen:
            seen.add(al)
            out.append(a)
    return out

def main():
    try:
        addresses = load_addresses("addresses.txt")
    except FileNotFoundError:
        print("未找到 addresses.txt，请在脚本同目录创建文件并每行放一个地址。")
        return

    if not addresses:
        print("addresses.txt 为空。")
        return

    contract_cache: Dict[str, bool] = {}
    results: List[Dict] = []

    for i, addr in enumerate(addresses, 1):
        try:
            print(f"[{i}/{len(addresses)}] processing {addr} ...")
            stats = classify_for_address(addr, contract_cache)
            results.append(stats)
        except Exception as e:
            print(f"address {addr} failed: {e}")

    # —— 导出（AI 友好格式）——
    with open("eth_stats.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)

    pd.DataFrame(results).to_csv("eth_stats.csv", index=False)

    print("\nDone. Exported:")
    print(" - eth_stats.json")
    print(" - eth_stats.csv")

if __name__ == "__main__":
    main()
