# -*- coding: utf-8 -*-
"""
Scan Ethereum via public RPC (NO API key, NO address list).
- Aggregates per-address stats over a block range.
- Optional --trace to count internal ETH transfers received (if RPC supports trace).
- Exports scan_stats.csv / scan_stats.json in an AI-friendly flat schema.

Usage examples:
  python scan_eth_public_rpc.py --rpc https://ethereum.publicnode.com --last-blocks 2000
  python scan_eth_public_rpc.py --rpc https://ethereum.publicnode.com --start 20600000 --end 20601000
  python scan_eth_public_rpc.py --rpc https://ethereum.publicnode.com --last-blocks 2000 --trace
  python scan_eth_public_rpc.py --rpc https://ethereum.publicnode.com --rpc-fallback https://eth-mainnet.public.blastapi.io https://rpc.ankr.com/eth --last-blocks 3000 --trace
"""

import argparse
import time
from typing import Dict, Iterable, Set, Tuple, Any, List

import pandas as pd
from tqdm import tqdm
from web3 import Web3
from web3.types import BlockData, TxData

from requests.exceptions import SSLError, ConnectionError as ReqConnErr
from urllib3.exceptions import ProtocolError, SSLError as URLLibSSLError
from web3.exceptions import ContractLogicError

# -----------------------
# Helpers
# -----------------------

def get_latest_block_with_retries(w3: Web3, endpoints: list[str], max_retry: int = 6):
    """
    可靠地获取最新块号；遇到 SSL/连接错误时，指数退避并尝试重连/切换备用 RPC。
    """
    delay = 1.5
    for attempt in range(1, max_retry + 1):
        try:
            return w3.eth.block_number
        except (ReqSSLError, URLSSLError, ProtocolError, ReqConnErr, TimeoutError) as e:
            print(f"[warn] get block_number failed (network): attempt {attempt}/{max_retry}: {e}")
            time.sleep(min(delay, 10))
            delay *= 1.7
            # 重新建立连接（会自动轮询备用 RPC）
            w3 = connect_any(endpoints)
        except Exception as e:
            print(f"[warn] get block_number failed (unexpected): attempt {attempt}/{max_retry}: {e}")
            time.sleep(min(delay, 10))
            delay *= 1.7
    raise RuntimeError("max retries exceeded when fetching latest block_number")

def get_block_with_retries(
    w3: Web3,
    bn: int,
    endpoints: list[str],
    max_retry: int = 6,
    base_sleep: float = 1.5,
):
    """
    取区块（含交易）时遇到 SSL/连接错误会自动重试与重连，必要时切换到备用 RPC。
    """
    attempt = 0
    while True:
        attempt += 1
        try:
            return w3.eth.get_block(bn, full_transactions=True)
        except (SSLError, URLLibSSLError, ProtocolError, ReqConnErr, TimeoutError) as e:
            # 典型网络/SSL断连：指数退避 + 重新连接
            sleep = base_sleep * (2 ** (attempt - 1))
            print(f"[warn] network/SSL error on block {bn}, retry {attempt}/{max_retry} after {sleep:.1f}s: {e}")
            time.sleep(min(sleep, 15))
            try:
                # 重新连当前端点；失败则切到备份端点
                w3 = connect_any(endpoints)
            except SystemExit:
                # 如果所有端点都挂了，仍再试（也许短暂恢复）
                pass
        except (ValueError, ContractLogicError) as e:
            # 节点偶发返回无效响应，短暂停顿后重试
            if attempt <= max_retry:
                time.sleep(1.0 * attempt)
                continue
            raise
        except Exception as e:
            if attempt <= max_retry:
                print(f"[warn] unexpected error on block {bn}, retry {attempt}/{max_retry}: {e}")
                time.sleep(1.0 * attempt)
                continue
            raise
        if attempt >= max_retry:
            raise RuntimeError(f"max retries exceeded for block {bn}")

def iter_blocks(w3: Web3, start: int, end: int):
    """Yield block objects (with full txs) from start..end inclusive."""
    for bn in range(start, end + 1):
        # full_transactions=True returns full tx objects
        yield w3.eth.get_block(bn, full_transactions=True)

def is_contract(w3: Web3, addr: str, cache: Dict[str, bool]) -> bool:
    """Use eth_getCode to check if address is a contract; cache results."""
    if not addr:
        return False
    al = Web3.to_checksum_address(addr)
    if al.lower() in cache:
        return cache[al.lower()]
    code = w3.eth.get_code(al)
    # code is HexBytes; empty contract code == b'' (len 0)
    ok = bool(code and len(code) > 0)
    cache[al.lower()] = ok
    return ok

def get_balances(w3: Web3, addrs: Iterable[str], tag: str = "latest") -> Dict[str, float]:
    """Fetch balances sequentially (simple & robust)."""
    out: Dict[str, float] = {}
    for a in tqdm(addrs, desc="Fetching balances"):
        try:
            wei = w3.eth.get_balance(Web3.to_checksum_address(a), block_identifier=tag)
            out[a] = wei / 1e18
        except Exception:
            out[a] = None
        # light throttle to avoid public RPC rejection
        time.sleep(0.002)
    return out

def get_tx_status(w3: Web3, tx_hash_hex: str) -> int:
    """Return 1 for success, 0 for failed/unknown."""
    try:
        r = w3.eth.get_transaction_receipt(tx_hash_hex)
        return 1 if r.status == 1 else 0
    except Exception:
        return 0

# -----------------------
# Trace helpers (optional)
# -----------------------

def try_trace_block(w3: Web3, block_number: int) -> Tuple[str, Any]:
    """
    Try different trace methods in order:
      1) trace_block (OE/Nethermind/Erigon)
      2) debug_traceBlockByNumber with callTracer (Geth family)
    Returns (method_name, payload) or (None, None) if unsupported.
    """
    # 1) trace_block
    try:
        res = w3.provider.make_request("trace_block", [hex(block_number)])
        if isinstance(res, dict) and isinstance(res.get("result"), list):
            return ("trace_block", res["result"])
    except Exception:
        pass

    # 2) debug_traceBlockByNumber (callTracer, light config)
    try:
        params = [hex(block_number), {"tracer": "callTracer", "timeout": "20s"}]
        res = w3.provider.make_request("debug_traceBlockByNumber", params)
        if isinstance(res, dict) and "result" in res:
            return ("debug_trace", res["result"])
    except Exception:
        pass

    return (None, None)

def count_internal_receives(trace_method: str, trace_payload: Any, target_addr: str) -> int:
    """
    Count internal ETH transfers (value > 0) received by target_addr in a traced block.
    Supports:
      - trace_block: list of traces with 'action' {to, value, ...}
      - debug_trace (callTracer): nested call tree per tx
    """
    target = target_addr.lower()
    cnt = 0

    if trace_method == "trace_block":
        # payload: list of traces
        for t in trace_payload:
            try:
                typ = t.get("type")
                if typ not in ("call", "create", "suicide"):
                    continue
                action = t.get("action", {}) or {}
                to = str(action.get("to", "")).lower()
                # value may be int or str decimal/hex depending on node; normalize
                val = action.get("value", 0)
                if isinstance(val, str):
                    if val.startswith("0x"):
                        val = int(val, 16)
                    else:
                        val = int(val or 0)
                if to == target and val > 0:
                    cnt += 1
            except Exception:
                continue

    elif trace_method == "debug_trace":
        # callTracer payload: dict keyed by txHash OR list of per-tx results
        def dfs(node: Dict[str, Any]):
            nonlocal cnt
            try:
                to = str(node.get("to", "")).lower()
                v = node.get("value", "0x0")
                if isinstance(v, str) and v.startswith("0x"):
                    val = int(v, 16)
                else:
                    val = int(v or 0)
                if to == target and val > 0:
                    cnt += 1
                for c in node.get("calls", []) or []:
                    dfs(c)
            except Exception:
                return

        if isinstance(trace_payload, dict):
            # common: { txHash: {result: <call tree>} }
            for v in trace_payload.values():
                root = v.get("result") or v
                if isinstance(root, dict):
                    dfs(root)
        elif isinstance(trace_payload, list):
            # sometimes a list of {result: <call tree>}
            for item in trace_payload:
                root = item.get("result") or item
                if isinstance(root, dict):
                    dfs(root)

    return cnt

# -----------------------
# Main scanning logic
# -----------------------

def scan_range(
    w3: Web3,
    start_block: int,
    end_block: int,
    check_success: bool = False,
    with_balances: bool = True,
    balance_limit: int = 0,  # 0 = all
    trace_enabled: bool = False,
    endpoints: list[str] | None = None
) -> pd.DataFrame:
    """
    Scan [start_block, end_block], aggregate per-address stats.
    Returns a DataFrame with AI-friendly columns.
    """

    sent_txs: Dict[str, int] = {}
    received_txs: Dict[str, int] = {}
    sent_to_contract_txs: Dict[str, int] = {}
    internal_recv_from_contract_txs: Dict[str, int] = {}

    seen_addrs: Set[str] = set()
    contract_cache: Dict[str, bool] = {}

    def add(d: Dict[str, int], k: str, inc: int = 1):
        d[k] = d.get(k, 0) + inc

    def tx_success(h_hex: str) -> bool:
        if not check_success:
            return True
        return get_tx_status(w3, h_hex) == 1

    total_blocks = end_block - start_block + 1
    for bn in tqdm(range(start_block, end_block + 1), total=total_blocks, desc="Scanning blocks"):
        block: BlockData = get_block_with_retries(w3, bn, endpoints)
        txs: List[TxData] = block.transactions or []

        # 1) Aggregate external txs
        for tx in txs:
            try:
                frm = str(tx.get("from", "")).lower()
                to = str(tx.get("to") or "").lower()
                h_hex = tx["hash"].hex()
            except Exception:
                # some providers may differ subtly; best effort
                frm = str(tx.get("from", "")).lower()
                to = str(tx.get("to", "") or "").lower()
                h = tx.get("hash")
                h_hex = h.hex() if hasattr(h, "hex") else str(h or "")

            if check_success and not tx_success(h_hex):
                continue

            if frm:
                seen_addrs.add(frm)
                add(sent_txs, frm, 1)
            if to:
                seen_addrs.add(to)
                add(received_txs, to, 1)
                # sent to contract?
                try:
                    if to and is_contract(w3, to, contract_cache):
                        add(sent_to_contract_txs, frm, 1)
                except Exception:
                    # ignore occasional RPC hiccups
                    pass

        # 2) Internal transfers (trace) — best-effort per block, only if supported
        if trace_enabled:
            method, payload = try_trace_block(w3, bn)
            if method and payload:
                # consider only addresses that appeared in this block for internal receive counting
                addrs_in_block: Set[str] = set()
                for tx in txs:
                    if tx.get("from"):
                        addrs_in_block.add(str(tx["from"]).lower())
                    if tx.get("to"):
                        addrs_in_block.add(str(tx["to"]).lower())
                for addr in addrs_in_block:
                    try:
                        c = count_internal_receives(method, payload, addr)
                        if c:
                            add(internal_recv_from_contract_txs, addr, c)
                            seen_addrs.add(addr)
                    except Exception:
                        # ignore per-block trace parse errors
                        pass
            # if unsupported, payload is None and we gracefully skip

    # 3) Balances
    addr_list = sorted(seen_addrs)
    if balance_limit > 0:
        addr_list = addr_list[:balance_limit]
    balances = get_balances(w3, addr_list) if with_balances else {}

    # 4) Build rows (AI-friendly flat fields)
    rows = []
    for a in addr_list:
        ext_sent = sent_txs.get(a, 0)
        ext_recv = received_txs.get(a, 0)
        ext_to_contract = sent_to_contract_txs.get(a, 0)
        internal_recv = internal_recv_from_contract_txs.get(a, 0)

        rows.append({
            "address": a,
            "eth_balance": balances.get(a, None),
            "total_txs": int(ext_sent + ext_recv + internal_recv),
            "sent_txs": int(ext_sent),
            "received_txs": int(ext_recv),
            "sent_to_contract_txs": int(ext_to_contract),
            "received_from_contract_txs": int(internal_recv),
            "external_txs": int(ext_sent + ext_recv),
            "internal_txs": int(internal_recv),
        })
    return pd.DataFrame(rows)

# -----------------------
# CLI
# -----------------------

def connect_any(endpoints: list[str]) -> Web3:
    """
    轮询 endpoints 直至连接成功。
    - 强制关闭 keep-alive（Connection: close），避免长连被对端或中间设备提前掐断
    - 禁用系统代理（某些公司/安全软件会中间人拦截 TLS）
    """
    last_err = None
    for ep in endpoints:
        try:
            w3 = Web3(Web3.HTTPProvider(
                ep,
                request_kwargs={
                    "timeout": 120,
                    "headers": {"Connection": "close"},
                    "proxies": {"http": None, "https": None},  # 不走系统代理
                },
            ))
            # 仅靠 is_connected 不够，顺带取一次 net_version 试探连通性
            if w3.is_connected():
                try:
                    _ = w3.net.version  # 触发一次 RPC
                    print(f"Connected to {ep}")
                    return w3
                except Exception as e:
                    last_err = e
                    continue
        except Exception as e:
            last_err = e
    raise SystemExit(f"无法连接到任何 RPC（最后错误：{last_err}）")

def main():
    ap = argparse.ArgumentParser(description="Public-RPC Ethereum scanner with optional trace.")
    ap.add_argument("--rpc", required=True, help="Primary RPC endpoint, e.g. https://ethereum.publicnode.com")
    ap.add_argument("--rpc-fallback", nargs="*", default=[], help="Fallback RPC endpoints (optional)")
    grp = ap.add_mutually_exclusive_group(required=True)
    grp.add_argument("--last-blocks", type=int, help="Scan last N blocks")
    grp.add_argument("--start", type=int, help="Start block (inclusive)")
    ap.add_argument("--end", type=int, help="End block (inclusive), required if --start is used")
    ap.add_argument("--check-success", action="store_true", help="Only count successful txs (slower; pulls receipts)")
    ap.add_argument("--no-balance", action="store_true", help="Skip fetching balances")
    ap.add_argument("--balance-limit", type=int, default=0, help="Max addresses to fetch balances for (0=all)")
    ap.add_argument("--trace", action="store_true", help="Try to use trace APIs if available")
    args = ap.parse_args()

    endpoints = [args.rpc] + list(args.rpc_fallback)
    w3 = connect_any(endpoints)

    latest = get_latest_block_with_retries(w3, endpoints)
    if args.last_blocks is not None:
        start_block = max(0, latest - args.last_blocks + 1)
        end_block = latest
    else:
        if args.end is None:
            raise SystemExit("--start 模式需要 --end")
        if args.end < args.start:
            raise SystemExit("--end 必须 >= --start")
        start_block, end_block = args.start, args.end

    print(f"Scanning blocks [{start_block}, {end_block}] (latest={latest})")
    df = scan_range(
        w3,
        start_block,
        end_block,
        check_success=args.check_success,
        with_balances=not args.no_balance,
        balance_limit=args.balance_limit,
        trace_enabled=args.trace,
        endpoints=endpoints,  # 这里传入主 RPC 和备用 RPC 列表
        endpoints=endpoints,  # 关键：把主+备用RPC传进去，scan里取块可断线重连
    )
    df.to_csv("scan_stats.csv", index=False)
    df.to_json("scan_stats.json", orient="records")
    print("Exported: scan_stats.csv, scan_stats.json")
    print("Rows:", len(df))

if __name__ == "__main__":
    main()
