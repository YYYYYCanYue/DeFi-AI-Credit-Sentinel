from eth_account import Account
from eth_account.messages import encode_typed_data
import time, os
from web3 import Web3

PRIVATE_KEY = os.environ["PRIVATE_KEY"]
CONTRACT = os.environ["CONTRACT_ADDRESS"]
CHAIN_ID = int(os.environ.get("CHAIN_ID", "1"))
TTL = int(os.environ.get("SIGN_TTL_SECONDS", "600"))

acct = Account.from_key(PRIVATE_KEY)

def sign_claim_py(to: str, score: int, tier_id: int, nonce: int | None = None):
    deadline = int(time.time()) + TTL
    if nonce is None:
        nonce = int(time.time_ns())  # 简易

    domain = {
        "name": "CreditScoreBadge",
        "version": "1",
        "chainId": CHAIN_ID,
        "verifyingContract": Web3.to_checksum_address(CONTRACT),
    }
    types = {
        "ClaimRequest": [
            {"name": "to", "type": "address"},
            {"name": "score", "type": "uint256"},
            {"name": "tierId", "type": "uint8"},
            {"name": "nonce", "type": "uint256"},
            {"name": "deadline", "type": "uint256"},
        ]
    }
    message = {
        "to": Web3.to_checksum_address(to),
        "score": int(score),
        "tierId": int(tier_id),
        "nonce": int(nonce),
        "deadline": int(deadline),
    }

    encoded = encode_typed_data(domain_data=domain, message_types={"ClaimRequest": types["ClaimRequest"]}, message_data=message, primary_type="ClaimRequest")
    signed = Account.sign_message(encoded, private_key=PRIVATE_KEY)
    return {"value": message, "signature": signed.signature.hex()}
