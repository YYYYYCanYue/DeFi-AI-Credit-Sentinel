import { ethers } from 'ethers';

// 合约ABI（简化版，仅包含我们需要的方法）
const CreditScoreBadgeABI = [
  // 使用与合约一致的函数签名：claimOrUpgrade(ClaimRequest, bytes)
  "function claimOrUpgrade((address to,uint256 score,uint8 tierId,uint256 nonce,uint256 deadline), bytes) external",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)"
];

// 网络配置
const NETWORKS = {
  fuji: {
    name: 'Avalanche Fuji Testnet',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  mainnet: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  }
};

// 合约地址 - 根据网络动态获取
const getContractAddress = (chainId: number) => {
  // 这里可以根据不同网络返回不同的合约地址
  if (chainId === 43113) { // Fuji测试网
    return '0x570825c2ba2Db0dF9Ae689D0a19092d48a8c6bbF'; // 测试网合约地址
  } else if (chainId === 43114) { // 主网
    return '0x570825c2ba2Db0dF9Ae689D0a19092d48a8c6bbF'; // 主网合约地址（如不同请替换）
  }
  throw new Error('当前网络不受支持，请切换到 Avalanche 网络');
};

/**
 * 切换到雪崩网络
 */
export async function switchToAvalancheNetwork(networkType: 'fuji' | 'mainnet' = 'fuji') {
  if (!window.ethereum) {
    throw new Error('未检测到以太坊提供者');
  }

  const network = NETWORKS[networkType];
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${network.chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorer]
          }],
        });
      } catch (addError) {
        throw new Error('无法添加雪崩网络到钱包');
      }
    } else {
      throw new Error('无法切换到雪崩网络');
    }
  }
}

/**
 * 获取当前网络信息
 */
export async function getCurrentNetwork() {
  if (!window.ethereum) {
    throw new Error('未检测到以太坊提供者');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  
  return {
    chainId: network.chainId,
    name: network.name,
    isAvalanche: network.chainId === 43113n || network.chainId === 43114n
  };
}

/**
 * 确保当前在 Avalanche Fuji 网络
 */
export async function ensureFuji() {
  if (!window.ethereum) {
    throw new Error('未检测到以太坊提供者');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 43113) {
    await switchToAvalancheNetwork('fuji');
  }
}

/**
 * 铸造/升级 NFT 信用凭证
 * @param claimData 后端签名数据
 */
export async function mintCreditBadge(claimData: any) {
  try {
    if (!window.ethereum) {
      throw new Error('未检测到以太坊提供者');
    }

    // 强制切到 Fuji
    await ensureFuji();

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 获取当前网络与合约地址
    const network = await provider.getNetwork();
    const contractAddress = getContractAddress(Number(network.chainId));

    const contract = new ethers.Contract(
      contractAddress,
      CreditScoreBadgeABI,
      signer
    );

    // 解构并转换参数类型
    const { value, signature } = claimData;
    if (!value || !signature) {
      throw new Error('签名数据不完整');
    }

    const walletAddress = await signer.getAddress();
    if (value.to && walletAddress.toLowerCase() !== String(value.to).toLowerCase()) {
      throw new Error('当前钱包地址与签名 to 地址不一致');
    }

    // 将字符串数值转换为 BigInt，tierId 转换为 Number
    const req = {
      to: walletAddress,
      score: BigInt(value.score),
      tierId: Number(value.tierId),
      nonce: BigInt(value.nonce),
      deadline: BigInt(value.deadline)
    };

    // 调用合约的 claimOrUpgrade(ClaimRequest, bytes)
    const tx = await contract.claimOrUpgrade(req, signature);
    const receipt = await tx.wait();

    return {
      success: true,
      hash: receipt.hash,
      tokenId: null
    };
  } catch (error: any) {
    console.error('铸造NFT失败:', error);
    return {
      success: false,
      error: error.message || '铸造NFT失败'
    };
  }
}

/**
 * 获取用户拥有的NFT信用凭证
 * @param address 用户地址
 * @returns NFT信息
 */
export async function getUserCreditBadge(address: string) {
  try {
    if (!window.ethereum) {
      throw new Error('未检测到以太坊提供者');
    }

    // 只在 Fuji 查询
    await ensureFuji();

    const provider = new ethers.BrowserProvider(window.ethereum);

    const network = await provider.getNetwork();
    const contractAddress = getContractAddress(Number(network.chainId));

    const contract = new ethers.Contract(
      contractAddress,
      CreditScoreBadgeABI,
      provider
    );

    const balance = await contract.balanceOf(address);

    if (balance > 0) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, 0);
      const tokenURI = await contract.tokenURI(tokenId);
      return {
        hasNFT: true,
        tokenId: tokenId.toString(),
        tokenURI
      };
    }

    return { hasNFT: false };
  } catch (error) {
    console.error('获取NFT信息失败:', error);
    return { hasNFT: false, error };
  }
} 