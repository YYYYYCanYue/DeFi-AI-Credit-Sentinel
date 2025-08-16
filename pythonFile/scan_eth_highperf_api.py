# -*- coding: utf-8 -*-
"""
High-performance Ethereum scanner using API-key RPC (Alchemy/Infura/QuickNode...).
- Async + batched JSON-RPC for blocks/balances/codes
- Optional `--trace` for internal transfers (if RPC supports)
- Checkpoint resume, robust retries, multiple fallbacks
- Exports CSV/JSON (+ optional Parquet)

Examples:
  python scan_eth_highperf_api.py --rpc https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY --last-blocks 2000
  python scan_eth_highperf_api.py --rpc https://mainnet.infura.io/v3/YOUR_KEY --start 23100000 --end 23101000 --concurrency 32
  python scan_eth_highperf_api.py --rpc https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY --last-blocks 1500 --trace
  python scan_eth_highperf_api.py --rpc https://... --rpc-fallback https://... --resume --follow --batch-size 500
"""

import asyncio
import aiohttp
import argparse
import json
import os
import math
import time
from typing import Dict, List, Set, Tuple, Any

import pandas as pd

# ---------------------------
# Utils
# ---------------------------

def now_ms() -> int:
    return int(time.time() * 1000)

class RPCClient:
    """Async JSON-RPC client with retries, batch & fallback endpoints."""
    def __init__(self, endpoints: List[str], timeout: int = 60, max_retries: int = 5, backoff_base: float = 0.75):
        assert endpoints, "At least one RPC endpoint is required"
        self.endpoints = endpoints
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_base = backoff_base
        self._endpoint_idx = 0
        self._id = 0
        self._session = None

    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        connector = aiohttp.TCPConnector(limit=0, ssl=False)  # ssl=False 有助于绕过某些系统中间件问题；如需严格校验证书，设为 True
        self._session = aiohttp.ClientSession(timeout=timeout, connector=connector, trust_env=False, headers={"Connection": "close"})
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if self._session:
            await self._session.close()

    def _next_id(self) -> int:
        self._id += 1
        return self._id

    def _cur_endpoint(self) -> str:
        return self.endpoints[self._endpoint_idx % len(self.endpoints)]

    def _rotate_endpoint(self):
        self._endpoint_idx = (self._endpoint_idx + 1) % len(self.endpoints)

    async def _post(self, payload: Any) -> Any:
        """POST with retries & endpoint rotation."""
        for attempt in range(1, self.max_retries + 1):
            url = self._cur_endpoint()
            try:
                async with self._session.post(url, json=payload, ssl=False) as resp:
                    resp.raise_for_status()
                    return await resp.json(content_type=None)
            except Exception as e:
                sleep = min(8.0, self.backoff_base * (2 ** (attempt - 1)))
                print(f"[rpc warn] POST failed on {url} attempt {attempt}/{self.max_retries}: {e} -> sleep {sleep:.2f}s")
                await asyncio.sleep(sleep)
                # rotate endpoint after second failure
                if attempt >= 2 and len(self.endpoints) > 1:
                    self._rotate_endpoint()
        raise RuntimeError("RPC POST failed after retries across endpoints")

    # ------------- single call -------------
    async def call(self, method: str, params: List[Any]) -> Any:
        payload = {"jsonrpc": "2.0", "id": self._next_id(), "method": method, "params": params}
        res = await self._post(payload)
        if isinstance(res, dict) and "error" in res:
            raise RuntimeError(f"RPC error: {res['error']}")
        return res.get("result")

    # ------------- batched call -------------
    async def batch(self, calls: List[Tuple[str, List[Any]]]) -> List[Any]:
        if not calls:
            return []
        req = [{"jsonrpc": "2.0", "id": self._next_id(), "method": m, "params": p} for (m, p) in calls]
        res = await self._post(req)
        if not isinstance(res, list):
            # Some providers may return a dict in error case
            if isinstance(res, dict) and "error" in res:
                raise RuntimeError(f"Batch RPC error: {res['error']}")
            raise RuntimeError("Unexpected batch response format")
        # map id -> result
        by_id = {item.get("id"): item for item in res}
        out = []
        for r in req:
            item = by_id.get(r["id"], {})
            if "error" in item:
                out.append({"error": item["error"]})
            else:
                out.append(item.get("result"))
        return out

# ---------------------------
# Trace helpers
# ---------------------------

async def trace_block(client: RPCClient, bn_hex: str):
    # OpenEthereum/Erigon/Nethermind
    res = await client.call("trace_block", [bn_hex])
    return ("trace_block", res)

async def debug_trace_block(client: RPCClient, bn_hex: str):
    # Geth: callTracer
    params = [bn_hex, {"tracer": "callTracer", "timeout": "20s"}]
    res = await client.call("debug_traceBlockByNumber", params)
    return ("debug_trace", res)

def count_internal_receives(trace_method: str, payload: Any, target: str) -> int:
    target = target.lower()
    cnt = 0
    if trace_method == "trace_block":
        # payload: list of traces
        if isinstance(payload, list):
            for t in payload:
                try:
                    typ = t.get("type")
                    if typ not in ("call", "create", "suicide"):
                        continue
                    action = t.get("action", {}) or {}
                    to = str(action.get("to", "")).lower()
                    v = action.get("value", 0)
                    if isinstance(v, str):
                        v = int(v, 16) if v.startswith("0x") else int(v or 0)
                    if to == target and v > 0:
                        cnt += 1
                except Exception:
                    continue
    elif trace_method == "debug_trace":
        # payload: dict keyed by txHash or list of results
        def dfs(node: Dict[str, Any]):
            nonlocal cnt
            try:
                to = str(node.get("to", "")).lower()
                v = node.get("value", "0x0")
                val = int(v, 16) if isinstance(v, str) and v.startswith("0x") else int(v or 0)
                if to == target and val > 0:
                    cnt += 1
                for c in node.get("calls", []) or []:
                    dfs(c)
            except Exception:
                return

        if isinstance(payload, dict):
            for v in payload.values():
                root = v.get("result") or v
                if isinstance(root, dict):
                    dfs(root)
        elif isinstance(payload, list):
            for item in payload:
                root = item.get("result") or item
                if isinstance(root, dict):
                    dfs(root)
    return cnt

# ---------------------------
# Scanner
# ---------------------------

async def get_latest_block(client: RPCClient) -> int:
    latest_hex = await client.call("eth_blockNumber", [])
    return int(latest_hex, 16)

async def fetch_blocks(client: RPCClient, block_numbers: List[int], concurrency: int) -> List[Dict[str, Any]]:
    """Fetch blocks (full txs) concurrently using batch windows."""
    blocks: List[Dict[str, Any]] = [None] * len(block_numbers)

    # batch window size: tune by provider. 20 is safe for most paid plans.
    window = 20
    sem = asyncio.Semaphore(concurrency)

    async def fetch_window(start_idx: int):
        async with sem:
            slice_nums = block_numbers[start_idx:start_idx+window]
            calls = [("eth_getBlockByNumber", [hex(n), True]) for n in slice_nums]
            res = await client.batch(calls)
            for i, r in enumerate(res):
                idx = start_idx + i
                blocks[idx] = r

    tasks = [fetch_window(i) for i in range(0, len(block_numbers), window)]
    await asyncio.gather(*tasks)
    return blocks

async def batch_get_code(client: RPCClient, addrs: List[str], block_tag: str = "latest", batch_size: int = 100) -> Dict[str, bool]:
    """Return {addr_lower: is_contract} by eth_getCode in batches."""
    out: Dict[str, bool] = {}
    for i in range(0, len(addrs), batch_size):
        calls = [("eth_getCode", [a, block_tag]) for a in addrs[i:i+batch_size]]
        res = await client.batch(calls)
        for addr, code in zip(addrs[i:i+batch_size], res):
            is_ctr = bool(code and isinstance(code, str) and code != "0x")
            out[addr.lower()] = is_ctr
    return out

async def batch_get_balance(client: RPCClient, addrs: List[str], block_tag: str = "latest", batch_size: int = 100) -> Dict[str, float]:
    out: Dict[str, float] = {}
    for i in range(0, len(addrs), batch_size):
        calls = [("eth_getBalance", [a, block_tag]) for a in addrs[i:i+batch_size]]
        res = await client.batch(calls)
        for addr, bal_hex in zip(addrs[i:i+batch_size], res):
            try:
                wei = int(bal_hex, 16)
                out[addr.lower()] = wei / 1e18
            except Exception:
                out[addr.lower()] = None
    return out

async def try_trace_one_block(client: RPCClient, bn: int):
    bn_hex = hex(bn)
    try:
        return await trace_block(client, bn_hex)
    except Exception:
        pass
    try:
        return await debug_trace_block(client, bn_hex)
    except Exception:
        pass
    return (None, None)

async def scan_range(
    client: RPCClient,
    start_block: int,
    end_block: int,
    concurrency: int = 32,
    check_success: bool = False,   # 若需要仅成功交易，可额外拉 receipts（此脚本默认不拉）
    with_balances: bool = True,
    balance_limit: int = 0,
    trace_enabled: bool = False,
) -> pd.DataFrame:
    # 1) 并发抓区块
    block_numbers = list(range(start_block, end_block + 1))
    blocks = await fetch_blocks(client, block_numbers, concurrency=concurrency)

    # 2) 扫描外部交易，先只记录 (from,to,txhash)，合约判断与余额后批量处理
    sent_txs: Dict[str, int] = {}
    received_txs: Dict[str, int] = {}
    sent_to_contract_txs: Dict[str, int] = {}
    internal_recv_from_contract_txs: Dict[str, int] = {}

    seen_addrs:_
