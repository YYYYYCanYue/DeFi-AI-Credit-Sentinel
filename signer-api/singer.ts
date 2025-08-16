import 'dotenv/config';
import { ethers } from 'ethers';

const rpcUrl = process.env.RPC_URL!;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY!, provider);
const ttl = Number(process.env.SIGN_TTL_SECONDS || 600);

export async function signClaim(params: {
  contract: string;
  to: string;
  score: number | bigint;
  tierId: number;
  nonce?: bigint | number;
}) {
  const chainId = (await provider.getNetwork()).chainId;
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + ttl;
  const nonce = params.nonce ?? BigInt(Date.now());

  const domain = {
    name: 'CreditScoreBadge',
    version: '1',
    chainId,
    verifyingContract: params.contract,
  } as const;

  const types = {
    ClaimRequest: [
      { name: 'to', type: 'address' },
      { name: 'score', type: 'uint256' },
      { name: 'tierId', type: 'uint8' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const;

  const value = {
    to: ethers.getAddress(params.to),
    score: BigInt(params.score),
    tierId: Number(params.tierId),
    nonce: BigInt(nonce as any),
    deadline: BigInt(deadline),
  };

  const signature = await wallet.signTypedData(domain, types, value);
  return { value, signature };
}