import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const signerAddress = "0x0000000000000000000000000000000000000001"; // 先占位，部署后再用 setSigner 或直接传 constructor
  const soulbound = true; // 是否禁转

  const factory = await ethers.getContractFactory("CreditScoreBadge");
  const contract = await factory.deploy(
    "CreditScoreBadge", // name
    "CSB",               // symbol
    deployer.address,     // owner
    signerAddress,        // signer
    soulbound             // soulbound
  );
  await contract.waitForDeployment();
  console.log("Contract:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });