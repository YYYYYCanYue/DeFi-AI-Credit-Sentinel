import { ethers } from "hardhat";

async function main() {
  const addr = process.env.CONTRACT_ADDRESS!;
  const contract = await ethers.getContractAt("CreditScoreBadge", addr);

  // 配置 4 个阶段示例（600/700/750/800）
  const tiers = [
    { id: 1, min: 600, uri: "ipfs://tier1.json" },
    { id: 2, min: 700, uri: "ipfs://tier2.json" },
    { id: 3, min: 750, uri: "ipfs://tier3.json" },
    { id: 4, min: 800, uri: "ipfs://tier4.json" }
  ];

  for (const t of tiers) {
    const tx = await contract.setTier(t.id as any, t.min, t.uri);
    await tx.wait();
    console.log("Set tier", t);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });