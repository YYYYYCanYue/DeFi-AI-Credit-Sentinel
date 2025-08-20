import { ReactNode, useState } from 'react';
import { AuthContext, AuthContextType } from './authContext';
import { switchToAvalancheNetwork } from '@/lib/web3';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 连接钱包
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 检查是否有以太坊提供者
      if (window.ethereum) {
        try {
          // 请求账户访问
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts.length > 0) {
            // 连接后立即切到 Fuji
            await switchToAvalancheNetwork('fuji');
            setAddress(accounts[0]);
            setIsConnected(true);
            console.log('钱包连接成功:', accounts[0]);
          } else {
            throw new Error('未获取到账户');
          }
        } catch (err: any) {
          console.error('连接钱包失败:', err);
          setError(err.message || '连接钱包失败');
        }
      } else {
        setError('请安装MetaMask或其他以太坊钱包');
        console.error('未检测到以太坊提供者');
      }
    } catch (err: any) {
      setError(err.message || '连接钱包时发生错误');
      console.error('连接钱包错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  // 监听账户变化
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        // 用户断开了连接
        disconnectWallet();
      } else {
        // 账户已更改
        setAddress(accounts[0]);
      }
    });
  }

  const contextValue: AuthContextType = {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 