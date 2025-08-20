import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

export default function About() {
  // 模拟钱包连接状态
  const isWalletConnected = false;
  
  const connectWallet = () => {
    // 连接钱包的逻辑将在实际集成时实现
    console.log("连接钱包功能待实现");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation isWalletConnected={isWalletConnected} connectWallet={connectWallet} />
      
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
              关于 DeFi-AI 信用哨兵
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-5 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">我们的使命</h3>
                  <p className="text-gray-300 mb-4">
                    通过AI技术与区块链的融合，打破传统DeFi借贷的超额抵押壁垒，为用户提供更高效、更公平的金融服务。
                  </p>
                  <p className="text-gray-300">
                    让信用成为链上资产，让每一位用户的良好行为都能获得相应的价值回报。
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="md:col-span-3"
            >
              <img 
                src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=DeFi+AI+Credit+Sentinel+concept+illustration+with+blockchain+and+AI+elements&sign=8a78afe6b857d2caedd5e1d76fa596b3" 
                alt="DeFi-AI信用哨兵概念图" 
                className="rounded-xl shadow-2xl shadow-blue-600/20 w-full h-auto"
              />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">核心技术与创新</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-brain text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI信用评估模型</h3>
                <p className="text-gray-400">
                  多维度链上行为分析，综合评估用户交易历史、资产流动性、合约交互行为等数据，生成精准信用评分。
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-shield text-indigo-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">NFT信用凭证</h3>
                <p className="text-gray-400">
                  将信用评分结果以NFT形式上链，实现信用可视化与跨平台验证，为用户提供可流转、可验证的信用资产。
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-link text-purple-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">跨协议集成</h3>
                <p className="text-gray-400">
                  与主流DeFi协议无缝集成，通过智能合约实现信用评分与借贷权限的自动绑定，提供个性化抵押率方案。
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">解决的关键问题</h2>
            
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">打破超额抵押壁垒</h3>
                  <p className="text-gray-300 mb-4">
                    当前DeFi借贷普遍要求150%以上的超额抵押率，严重制约了资金使用效率。我们通过AI信用评估，为优质用户提供差异化抵押率方案。
                  </p>
                  <p className="text-gray-300 mb-6">
                    优质用户可享受低至80%的抵押率，大幅降低资金占用成本，提升链上资金效率。
                  </p>
                  
                  <div className="flex space-x-4">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-3xl font-bold text-green-400 mb-1">100+50%*80%</div>
                      <div className="text-gray-400 text-sm">优质用户超额部分抵押优惠率</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-3xl font-bold text-red-400 mb-1">150%</div>
                      <div className="text-gray-400 text-sm">传统DeFi抵押率</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20"></div>
                  <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <div className="w-full h-64 flex flex-col justify-center">
                      {/* 图表标题 */}
                      <div className="text-center mb-6">
                        <h4 className="text-lg font-semibold text-gray-200 mb-2">抵押率对比</h4>
                        <p className="text-sm text-gray-400">传统DeFi vs DeFi-AI信用哨兵</p>
                      </div>
                      
                      {/* 对比图表 */}
                      <div className="flex items-end justify-center space-x-8 h-32">
                        {/* 传统DeFi抵押率 */}
                        <div className="flex flex-col items-center">
                          <div className="w-16 bg-gradient-to-t from-red-500 to-red-600 rounded-t-lg relative">
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              150%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 text-center">传统DeFi</div>
                        </div>
                        
                        {/* 对比箭头 */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-2xl text-gray-500 mb-2">→</div>
                          <div className="text-xs text-gray-400">优化</div>
                        </div>
                        
                        {/* DeFi-AI抵押率 */}
                        <div className="flex flex-col items-center">
                          <div className="w-16 bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg relative" style={{ height: '40%' }}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              80%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 text-center">DeFi-AI</div>
                        </div>
                      </div>
                      
                      {/* 数据说明 */}
                      <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-gray-300 font-medium">传统DeFi</span>
                          </div>
                          <div className="text-gray-400">
                            <div>• 150% 超额抵押</div>
                            <div>• 资金利用率低</div>
                            <div>• 高门槛准入</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-300 font-medium">DeFi-AI</span>
                          </div>
                          <div className="text-gray-400">
                            <div>• 80% 超额抵押优惠</div>
                            <div>• 提升资金效率</div>
                            <div>• 普惠金融服务</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}