import { motion } from 'framer-motion';

// DeFi协议数据
const protocols = [
  {
    id: 1,
    name: 'Aave',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Aave%20logo%2C%20DeFi%20protocol%2C%20blue%20color&sign=3b2620f4f63cb47e8dae44db44e47a7f',
    description: '去中心化借贷协议',
    collateralRate: '80%',
    isIntegrated: true
  },
  {
    id: 2,
    name: 'Compound',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Compound%20logo%2C%20DeFi%20protocol%2C%20purple%20color&sign=cc9adebb402a1918c244866b97e9d4fb',
    description: '算法货币市场协议',
    collateralRate: '80%',
    isIntegrated: true
  },
  {
    id: 3,
    name: 'MakerDAO',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=MakerDAO%20logo%2C%20DeFi%20protocol%2C%20green%20color&sign=1f909126fdeb75b10d580a3665031121',
    description: '稳定币发行协议',
    collateralRate: '85%',
    isIntegrated: true
  },
  {
    id: 4,
    name: 'Curve',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Curve%20logo%2C%20DeFi%20protocol%2C%20yellow%20color&sign=99e44ede64cd64879a63cd74939b01dc',
    description: '稳定币兑换协议',
    collateralRate: '90%',
    isIntegrated: false
  },
  {
    id: 5,
    name: 'Uniswap',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Uniswap%20logo%2C%20DeFi%20protocol%2C%20teal%20color&sign=17217d6ff475b6b829f2a0022604a67b',
    description: '去中心化交易所',
    collateralRate: '90%',
    isIntegrated: false
  },
  {
    id: 6,
    name: 'SushiSwap',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=SushiSwap%20logo%2C%20DeFi%20protocol%2C%20pink%20color&sign=a735cb6059903f08088b6158fce2d494',
    description: '社区驱动的DeFi平台',
    collateralRate: '95%',
    isIntegrated: false
  }
];

export default function ProtocolIntegration() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">DeFi协议集成</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          通过您的NFT信用凭证，在各DeFi协议享受个性化抵押率优惠
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: protocol.id * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
              protocol.isIntegrated 
                ? 'border-blue-500/50 hover:shadow-blue-600/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center mr-4 overflow-hidden">
                  <img 
                    src={protocol.logo} 
                    alt={`${protocol.name} logo`} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{protocol.name}</h3>
                  <p className="text-gray-400 text-sm">{protocol.description}</p>
                </div>
              </div>
              {protocol.isIntegrated && (
                <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  已集成
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">特别抵押率</span>
                <span className="font-medium text-blue-400">{protocol.collateralRate}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: protocol.collateralRate }}
                ></div>
              </div>
            </div>
            
            <button 
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                protocol.isIntegrated 
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              type="button"
            >
              {protocol.isIntegrated ? (
                <>
                  <i className="fa-solid fa-link mr-2"></i>进入协议
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plug mr-2"></i>集成协议
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}