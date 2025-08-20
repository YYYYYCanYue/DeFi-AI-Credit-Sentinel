import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/authContext';

export default function HeroSection() {
  const { connectWallet, isLoading } = useAuth();

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          区块链上的信用哨兵
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
          基于AI的链上行为分析，为您的DeFi体验提供信用评分和优化抵押率
        </p>
        
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
          <motion.button
            onClick={() => connectWallet()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-600/30 text-lg transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>连接中...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wallet mr-2"></i>连接钱包开始
              </>
            )}
          </motion.button>
          
          <a href="#learn-more" className="text-gray-300 hover:text-white transition-colors flex items-center">
            <i className="fa-solid fa-circle-info mr-2"></i>了解更多
          </a>
        </div>
      </motion.div>
      
      {/* 特性卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full z-10"
      >
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
            <i className="fa-solid fa-chart-line text-blue-400 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">AI信用评分</h3>
          <p className="text-gray-400">基于您的链上行为数据，使用先进的AI模型生成客观的信用评分</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
            <i className="fa-solid fa-certificate text-indigo-400 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">NFT信用凭证</h3>
          <p className="text-gray-400">将您的信用评分铸造为NFT，在各DeFi协议中使用，享受差异化服务</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
            <i className="fa-solid fa-percent text-purple-400 text-xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">优化抵押率</h3>
          <p className="text-gray-400">高信用评分可在集成的DeFi协议中获得更低抵押率，提高资金效率</p>
        </div>
      </motion.div>
    </div>
  );
}