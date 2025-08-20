import { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

export default function Documentation() {
  // 模拟钱包连接状态
  const isWalletConnected = false;
  const [activeSection, setActiveSection] = useState('getting-started');
  
  const connectWallet = () => {
    // 连接钱包的逻辑将在实际集成时实现
    console.log("连接钱包功能待实现");
  };
  
  // 文档内容数据
  const documentationSections = [
    {
      id: 'getting-started',
      title: '快速开始',
      content: `
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">什么是DeFi-AI信用哨兵？</h3>
            <p class="text-gray-300">
              DeFi-AI信用哨兵是一个创新的链上信用评估系统，通过AI技术动态评估DeFi用户信用，并将评估结果以NFT形式上链，形成可视化的信用凭证。
            </p>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">核心功能</h3>
            <ul class="list-disc pl-6 text-gray-300 space-y-2">
              <li>AI驱动的多维度信用评估</li>
              <li>实时更新的动态信用评分</li>
              <li>NFT化的信用凭证上链与可视化</li>
              <li>跨平台的DeFi协议集成</li>
              <li>基于信用的差异化抵押率方案</li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">开始使用的步骤</h3>
            <ol class="list-decimal pl-6 text-gray-300 space-y-3">
              <li>连接您的加密货币钱包</li>
              <li>授权系统分析您的链上行为数据</li>
              <li>等待AI系统生成您的信用评分</li>
              <li>获取您的NFT信用凭证</li>
              <li>在合作DeFi协议中享受差异化服务</li>
            </ol>
          </div>
        </div>
      `
    },
    {
      id: 'credit-scoring',
      title: '信用评分机制',
      content: `
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">评分范围与等级</h3>
            <p class="text-gray-300 mb-4">
              我们的信用评分范围为100-800分，共分为5个等级：
            </p>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div class="text-sm font-medium text-green-400 mb-1">优质信用</div>
                <div class="text-lg font-bold">700-800</div>
              </div>
              <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div class="text-sm font-medium text-blue-400 mb-1">良好信用</div>
                <div class="text-lg font-bold">600-699</div>
              </div>
              <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div class="text-sm font-medium text-purple-400 mb-1">中等信用</div>
                <div class="text-lg font-bold">500-599</div>
              </div>
              <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div class="text-sm font-medium text-yellow-400 mb-1">一般信用</div>
                <div class="text-lg font-bold">300-499</div>
              </div>
              <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
                <div class="text-sm font-medium text-orange-400 mb-1">低信用</div>
                <div class="text-lg font-bold">100-299</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">评估维度</h3>
            <p class="text-gray-300 mb-4">我们的AI模型从三个核心维度评估用户信用：</p>
            
            <div class="space-y-4">
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 class="font-semibold text-blue-400 mb-2">还款能力</h4>
                <ul class="list-disc pl-6 text-gray-400 space-y-1">
                  <li>资产负债率：总负债与总资产的比值</li>
                  <li>流动性比率：流动资产与短期负债的比值</li>
                  <li>收入稳定性：月均收入波动率</li>
                </ul>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 class="font-semibold text-blue-400 mb-2">行为特征</h4>
                <ul class="list-disc pl-6 text-gray-400 space-y-1">
                  <li>交易频率：周均交易次数</li>
                  <li>资产多样性：持有资产类型数量</li>
                  <li>协议交互广度：使用DeFi协议数量</li>
                </ul>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 class="font-semibold text-blue-400 mb-2">风险特征</h4>
                <ul class="list-disc pl-6 text-gray-400 space-y-1">
                  <li>最大回撤率：历史最大资产跌幅</li>
                  <li>市场敏感度：资产组合与市场相关性</li>
                  <li>违约历史：历史逾期或违约次数</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'nft-credit',
      title: 'NFT信用凭证',
      content: `
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">NFT信用凭证概述</h3>
            <p class="text-gray-300">
              NFT信用凭证是基于ERC-721标准的非同质化代币，它将您的信用评分和等级信息永久记录在区块链上，作为您链上信用的可视化证明。
            </p>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">NFT信用凭证的特点</h3>
            <ul class="list-disc pl-6 text-gray-300 space-y-2">
              <li><span class="text-blue-400 font-medium">唯一性</span>：每个NFT信用凭证都是独一无二的，与您的钱包地址绑定</li>
              <li><span class="text-blue-400 font-medium">不可篡改性</span>：基于区块链技术，信用信息一旦上链无法被篡改</li>
              <li><span class="text-blue-400 font-medium">实时更新</span>：当您的信用评分发生变化时，NFT元数据会自动更新</li>
              <li><span class="text-blue-400 font-medium">跨平台使用</span>：可在所有集成了我们系统的DeFi协议中使用</li>
              <li><span class="text-blue-400 font-medium">可视化信用</span>：不同信用等级对应不同的NFT外观设计</li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">如何获取NFT信用凭证</h3>
            <ol class="list-decimal pl-6 text-gray-300 space-y-2">
              <li>连接钱包并完成身份验证</li>
              <li>授权系统分析您的链上行为数据</li>
              <li>AI系统生成您的初始信用评分</li>
              <li>系统自动铸造对应等级的NFT信用凭证</li>
              <li>在您的钱包中查看和管理您的NFT信用凭证</li>
            </ol>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">NFT信用凭证与借贷权限</h3>
            <p class="text-gray-300 mb-4">
              NFT信用凭证直接与您的借贷权限绑定，不同等级的NFT对应不同的抵押率优惠：
            </p>
            
            <div class="overflow-x-auto">
              <table class="w-full bg-gray-800 rounded-lg border border-gray-700">
                <thead>
                  <tr class="border-b border-gray-700">
                    <th class="px-4 py-3 text-left text-gray-300">信用等级</th>
                    <th class="px-4 py-3 text-left text-gray-300">评分范围</th>
                    <th class="px-4 py-3 text-left text-gray-300">超额部分抵押优惠率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-4 py-3 text-green-400">优质信用</td>
                    <td class="px-4 py-3 text-gray-300">700-800</td>
                    <td class="px-4 py-3 text-gray-300">80%</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-4 py-3 text-blue-400">良好信用</td>
                    <td class="px-4 py-3 text-gray-300">600-699</td>
                    <td class="px-4 py-3 text-gray-300">60%</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-4 py-3 text-purple-400">中等信用</td>
                    <td class="px-4 py-3 text-gray-300">500-599</td>
                    <td class="px-4 py-3 text-gray-300">40%</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-4 py-3 text-yellow-400">一般信用</td>
                    <td class="px-4 py-3 text-gray-300">300-499</td>
                    <td class="px-4 py-3 text-gray-300">0%（标准抵押率）</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-orange-400">低信用</td>
                    <td class="px-4 py-3 text-gray-300">100-299</td>
                    <td class="px-4 py-3 text-gray-300">额外抵押10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'protocol-integration',
      title: '协议集成指南',
      content: `
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">集成概述</h3>
            <p class="text-gray-300">
              DeFi-AI信用哨兵提供了一套完整的API和智能合约接口，使DeFi协议能够轻松集成我们的信用评分系统，为不同信用等级的用户提供差异化服务。
            </p>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">支持的协议类型</h3>
            <ul class="list-disc pl-6 text-gray-300 space-y-2">
              <li>借贷协议（如Aave、Compound类似协议）</li>
              <li>稳定币发行协议</li>
              <li>去中心化交易所</li>
              <li>合成资产协议</li>
              <li>保险协议</li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">集成步骤</h3>
            
            <div class="space-y-4 mb-6">
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 class="font-semibold text-blue-400 mb-2">1. 智能合约集成</h4>
                <p class="text-gray-400 mb-2">
                  导入我们的信用评分接口合约，并在您的借贷逻辑中添加信用评分检查：
                </p>
                <div class="bg-gray-900 rounded p-3 text-sm text-gray-300 font-mono overflow-x-auto">
                  // 导入信用评分接口<br/>
                  import ICreditScore from "./ICreditScore.sol";<br/><br/>
                  
                  contract YourLendingProtocol {<br/>
                  &nbsp;&nbsp;// 信用评分合约地址<br/>
                  &nbsp;&nbsp;ICreditScore public creditScoreContract;<br/><br/>
                  
                  &nbsp;&nbsp;// 构造函数中初始化<br/>
                  &nbsp;&nbsp;constructor(address _creditScoreContract) {<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;creditScoreContract = ICreditScore(_creditScoreContract);<br/>
                  &nbsp;&nbsp;}<br/><br/>
                  
                  &nbsp;&nbsp;// 在借贷函数中检查信用评分<br/>
                  &nbsp;&nbsp;function borrow(uint256 amount) public {<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;// 获取用户信用评分<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;uint256 score = creditScoreContract.getScore(msg.sender);<br/><br/>
                  
                  &nbsp;&nbsp;&nbsp;&nbsp;// 根据信用评分确定抵押率<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;uint256 collateralRate = determineCollateralRate(score);<br/><br/>
                  
                  &nbsp;&nbsp;&nbsp;&nbsp;// 执行借贷逻辑...<br/>
                  &nbsp;&nbsp;}<br/>
                  }
                </div>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 class="font-semibold text-blue-400 mb-2">2. 前端集成</h4>
                <p class="text-gray-400 mb-2">
                  在您的前端界面中显示用户信用评分和对应的抵押率信息：
                </p>
                <div class="bg-gray-900 rounded p-3 text-sm text-gray-300 font-mono overflow-x-auto">
                  // 使用我们的SDK获取用户信用评分<br/>
                  import { CreditSentinelSDK } from 'credit-sentinel-sdk';<br/><br/>
                  
                  const sdk = new CreditSentinelSDK();<br/><br/>
                  
                  // 获取用户信用评分<br/>
                  const score = await sdk.getCreditScore(userAddress);<br/>
                  const creditLevel = await sdk.getCreditLevel(userAddress);<br/>
                  const collateralRate = await sdk.getCollateralRate(userAddress);<br/><br/>
                  
                  // 在UI中显示<br/>
                  console.log(\`用户信用评分: \${score}, 等级: \${creditLevel}, 抵押率: \${collateralRate}%\`);
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-400">集成支持</h3>
            <p class="text-gray-300 mb-4">
              我们提供全面的集成支持，包括技术文档、SDK、示例代码和专门的技术支持团队。如需集成，请联系我们的商务合作团队。
            </p>
          </div>
        </div>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
            文档中心
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            全面了解DeFi-AI信用哨兵的功能、使用方法和集成指南
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
        </motion.div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 侧边导航 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 sticky top-24">
              <nav className="p-4">
                <ul className="space-y-1">
                  {documentationSections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          activeSection === section.id 
                            ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                        type="button"
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
          
          {/* 文档内容 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 min-h-[600px]">
              {documentationSections.map((section) => (
                <div 
                  key={section.id} 
                  className={activeSection === section.id ? 'block' : 'hidden'}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}