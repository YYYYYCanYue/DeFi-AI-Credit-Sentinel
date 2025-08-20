import { motion } from 'framer-motion';

interface CreditScoreCardProps {
  score: number;
}

export default function CreditScoreCard({ score }: CreditScoreCardProps) {
  // 根据分数确定信用等级和颜色
  const getCreditInfo = (score: number) => {
    if (score >= 700) {
      return { 
        level: '优质信用', 
        description: '您有资格获得最低抵押率80%',
        color: 'from-green-500 to-green-600',
        progressColor: 'bg-green-500'
      };
    } else if (score >= 600) {
      return { 
        level: '良好信用', 
        description: '您有资格获得抵押率100%',
        color: 'from-blue-500 to-blue-600',
        progressColor: 'bg-blue-500'
      };
    } else if (score >= 500) {
      return { 
        level: '中等信用', 
        description: '您有资格获得抵押率120%',
        color: 'from-purple-500 to-purple-600',
        progressColor: 'bg-purple-500'
      };
    } else if (score >= 400) {
      return { 
        level: '一般信用', 
        description: '您有资格获得抵押率135%',
        color: 'from-yellow-500 to-yellow-600',
        progressColor: 'bg-yellow-500'
      };
    } else {
      return { 
        level: '低信用', 
        description: '您需要提升信用以获得更好的抵押率',
        color: 'from-orange-500 to-orange-600',
        progressColor: 'bg-orange-500'
      };
    }
  };
  
  const creditInfo = getCreditInfo(score);
  const maxScore = 800;
  const scorePercentage = (score / maxScore) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-blue-600/10 transition-shadow"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">您的信用评分</h3>
          <p className="text-gray-400 text-sm">基于您的链上行为分析</p>
        </div>
        <button 
          className="text-gray-400 hover:text-white transition-colors" 
          type="button"
          aria-label="刷新信用评分"
          title="刷新信用评分"
        >
          <i className="fa-solid fa-refresh"></i>
        </button>
      </div>
      
      {/* 评分显示 */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-baseline">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-bold"
            >
              {score}
            </motion.span>
            <span className="ml-2 text-gray-400 mb-1">/800</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`mt-1 font-medium ${creditInfo.color.split(' ')[1]}`}
          >
            {creditInfo.level}
          </motion.div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-xl border border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br {creditInfo.color} flex items-center justify-center">
            <i className="fa-solid fa-shield text-white text-2xl"></i>
          </div>
        </div>
      </div>
      
      {/* 评分进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">信用评分</span>
          <span className="font-medium">{scorePercentage.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${creditInfo.progressColor} transition-all duration-1000`}
          ></motion.div>
        </div>
      </div>
      
      {/* 信用描述 */}
      <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700">
        <p className="text-sm text-gray-300 italic">
          <i className="fa-solid fa-info-circle text-blue-400 mr-2"></i>
          {creditInfo.description}
        </p>
      </div>
      
      {/* 操作按钮 */}
      <div className="mt-6">
        <button className="w-full bg-gradient-to-r {creditInfo.color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-colors" type="button">
          <i className="fa-solid fa-chart-line mr-2"></i>查看详细评估报告
        </button>
      </div>
    </motion.div>
  );
}