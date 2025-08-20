import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';

export default function Navigation() {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useAuth();
  
  // 格式化地址显示
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-shield text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              DeFi-AI信用哨兵
            </span>
          </div>
          
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">首页</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">关于</Link>
              <Link to="/documentation" className="text-gray-300 hover:text-white transition-colors">文档</Link>
              <Link to="/api" className="text-gray-300 hover:text-white transition-colors">API</Link>
            </nav>
          
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <motion.button
                onClick={() => connectWallet()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-full transition-all duration-300 shadow-lg shadow-blue-600/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>连接中...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wallet mr-2"></i>连接钱包
                  </>
                )}
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-800 rounded-full py-1 px-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                    {formatAddress(address)}
                  </div>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="断开钱包连接"
                  title="断开钱包连接"
                  type="button"
                >
                  <i className="fa-solid fa-sign-out-alt"></i>
                </button>
              </div>
            )}
            
            <button 
              className="md:hidden text-gray-300 hover:text-white"
              aria-label="打开菜单"
              title="打开菜单"
              type="button"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}