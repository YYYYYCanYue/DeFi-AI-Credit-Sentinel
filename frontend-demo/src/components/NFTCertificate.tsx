import { motion } from 'framer-motion';

interface NFTCertificateProps {
  score: number;
}

export default function NFTCertificate({ score }: NFTCertificateProps) {
  // 根据分数确定信用等级
  const getCreditLevel = (score: number): { name: string; color: string } => {
    if (score >= 700) return { name: 'AAA', color: 'text-green-400' };
    if (score >= 600) return { name: 'AA', color: 'text-blue-400' };
    if (score >= 500) return { name: 'A', color: 'text-purple-400' };
    if (score >= 400) return { name: 'BBB', color: 'text-yellow-400' };
    return { name: 'BB', color: 'text-orange-400' };
  };
  
  const creditLevel = getCreditLevel(score);
  
  return (
    <motion.div
      initial={{ rotate: -5, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      className="relative w-full max-w-md"
    >
      {/* NFT证书主体 */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-4 border-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/20 transform transition-all duration-500 hover:scale-[1.02]">
        {/* 顶部装饰 */}
        <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {/* 证书头部 */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-1">
            DeFi-AI 信用哨兵
          </h2>
          <p className="text-gray-400 text-sm">链上信用凭证 NFT</p>
        </div>
        
        {/* 分隔线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>
        
        {/* 证书内容 */}
        <div className="p-8">
          <div className="flex flex-col items-center">
            {/* 评分显示 */}
            <div className="relative w-40 h-40 mb-6">
              {/* 外环 */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - score / 800)}
                  strokeLinecap="round"
                  className="transition-all duration-1500 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* 分数 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score}</span>
                <span className={`text-sm font-medium ${creditLevel.color}`}>{creditLevel.name}</span>
              </div>
            </div>
            
            {/* 信用信息 */}
            <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">信用等级</span>
                <span className={`font-medium ${creditLevel.color}`}>{creditLevel.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm">抵押率优惠</span>
                <span className="text-green-400 font-medium">80%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">最后更新</span>
                <span className="text-gray-300 text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 证书底部 */}
        <div className="p-4 bg-gray-900/80 border-t border-gray-800">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>ERC-721 #12345</div>
            <div>DeFi-AI Credit Sentinel</div>
          </div>
        </div>
      </div>
      
      {/* 装饰元素 */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-500 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
    </motion.div>
  );
}