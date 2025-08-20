import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, Cell } from 'recharts';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CreditScoreCard from '@/components/CreditScoreCard';
import NFTCertificate from '@/components/NFTCertificate';
import { useAuth } from '@/contexts/authContext';
import ProtocolIntegration from '@/components/ProtocolIntegration';
import Footer from '@/components/Footer';
import { mintCreditBadge, getUserCreditBadge } from '@/lib/web3';

// 模拟信用评分历史数据
const scoreHistoryData = [
  { month: 'Jan', score: 620 },
  { month: 'Feb', score: 635 },
  { month: 'Mar', score: 650 },
  { month: 'Apr', score: 645 },
  { month: 'May', score: 660 },
  { month: 'Jun', score: 680 },
  { month: 'Jul', score: 710 },
];

// 模拟信用评估因子数据
const creditFactorsData = [
  { subject: '资产负债率', A: 80, fullMark: 100 },
  { subject: '流动性比率', A: 75, fullMark: 100 },
  { subject: '收入稳定性', A: 85, fullMark: 100 },
  { subject: '交易频率', A: 65, fullMark: 100 },
  { subject: '资产多样性', A: 70, fullMark: 100 },
  { subject: '协议交互广度', A: 90, fullMark: 100 },
  { subject: '最大回撤率', A: 60, fullMark: 100 },
  { subject: '市场敏感度', A: 75, fullMark: 100 },
  { subject: '违约历史', A: 95, fullMark: 100 },
];

// 抵押率数据
const collateralRateData = [
  { name: '传统DeFi', rate: 150 },
  { name: '信用哨兵 (700+)', rate: 80 },
  { name: '信用哨兵 (600-700)', rate: 100 },
  { name: '信用哨兵 (500-600)', rate: 120 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Home() {
  const { isConnected, address } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [creditScore, setCreditScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [claimData, setClaimData] = useState<any>(null);
  const [nftMinted, setNftMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>(null);
  const [mintError, setMintError] = useState('');
  
  // 添加API调用函数
  const fetchCreditScore = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setCreditScore(data.score);
        setClaimData(data.claimData);
      } else {
        setError(data.error || '获取信用分数失败');
        console.error('获取信用分数失败:', data.error);
      }
    } catch (error) {
      setError('API请求失败');
      console.error('API请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 临界刷新签名（剩余<=60秒则重新获取签名）
  const refreshClaimIfNeeded = async () => {
    if (!address || !claimData) return null;
    const deadline = Number(claimData.value?.deadline ?? 0);
    const secondsLeft = deadline - Math.floor(Date.now() / 1000);
    if (Number.isFinite(secondsLeft) && secondsLeft <= 60) {
      try {
        const resp = await fetch('http://localhost:3002/sign-claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: address, score: creditScore })
        });
        if (resp.ok) {
          const fresh = await resp.json();
          setClaimData(fresh);
          return fresh;
        }
      } catch (e) {
        console.error('刷新签名失败:', e);
      }
    }
    return claimData;
  };

  // 铸造NFT 信用凭证
  const mintNFT = async () => {
    if (!address || !claimData) return;
    
    setIsMinting(true);
    setMintError('');
    try {
      // 在铸造前，如果签名临近过期则刷新
      const payload = await refreshClaimIfNeeded();
      // 调用合约铸造NFT
      const result = await mintCreditBadge(payload || claimData);
      
      if (result.success) {
        setNftMinted(true);
        console.log('NFT铸造成功，交易哈希:', result.hash);
        
        // 获取NFT信息
        setTimeout(async () => {
          const badgeInfo = await getUserCreditBadge(address);
          setNftInfo(badgeInfo);
        }, 2000); // 等待交易确认
      } else {
        setMintError(result.error || '铸造NFT失败');
        console.error('铸造NFT失败:', result.error);
      }
    } catch (error: any) {
      setMintError(error.message || '铸造NFT过程中发生错误');
      console.error('铸造NFT错误:', error);
    } finally {
      setIsMinting(false);
    }
  };
  
  // 检查用户是否已经拥有NFT
  const checkUserNFT = async (address: string) => {
    if (!address) return;
    
    try {
      const badgeInfo = await getUserCreditBadge(address);
      if (badgeInfo.hasNFT) {
        setNftInfo(badgeInfo);
        setNftMinted(true);
      }
    } catch (error) {
      console.error('检查NFT状态失败:', error);
    }
  };
  
  // 当钱包地址变化时获取信用评分
  useEffect(() => {
    if (isConnected && address) {
      fetchCreditScore(address);
      checkUserNFT(address);
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation />
      
      {!isConnected ? (
        <HeroSection />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* 加载状态 */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">正在分析您的链上数据...</p>
              </div>
            </div>
          )}
          
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
              <p className="flex items-center">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </p>
            </div>
          )}
          
          {/* 标签导航 */}
          {!isLoading && !error && (
            <>
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                信用仪表盘
              </button>
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'nft' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('nft')}
              >
                NFT信用凭证
              </button>
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'protocols' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('protocols')}
              >
                协议集成
              </button>
            </div>
          </div>
          
          {/* 仪表盘内容 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreditScoreCard score={creditScore || 710} />
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <i className="fa-solid fa-chart-line mr-2 text-blue-400"></i>
                    信用评分趋势
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[500, 800]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            borderColor: '#374151',
                            borderRadius: '12px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#1E40AF' }}
                          activeDot={{ r: 8, fill: '#60A5FA', strokeWidth: 2, stroke: '#3B82F6' }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="fa-solid fa-radar mr-2 text-blue-400"></i>
                  信用评估维度
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={creditFactorsData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
                      <Radar
                        name="信用评分"
                        dataKey="A"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                        animationDuration={1500}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="fa-solid fa-percent mr-2 text-blue-400"></i>
                  抵押率对比
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collateralRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          borderColor: '#374151',
                          borderRadius: '12px'
                        }} 
                        formatter={(value) => [`${value}%`, '抵押率']}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {collateralRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
              {/* NFT信用凭证 */}
          {activeTab === 'nft' && (
                <div className="flex flex-col items-center py-8">
                  <NFTCertificate score={creditScore || 710} />
                  
                  <div className="mt-16">
                    {nftMinted ? (
                      <div className="bg-green-500/20 border border-green-500 text-green-100 px-6 py-4 rounded-lg flex items-center">
                        <i className="fa-solid fa-circle-check text-2xl mr-4"></i>
                        <div>
                          <h4 className="font-semibold text-lg">NFT铸造成功！</h4>
                          <p className="text-sm opacity-80">您的信用凭证已成功铸造，可在钱包中查看</p>
                          {nftInfo && nftInfo.tokenId && (
                            <p className="text-xs mt-1">Token ID: {nftInfo.tokenId}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {mintError && (
                          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
                            <p className="flex items-center">
                              <i className="fa-solid fa-circle-exclamation mr-2"></i>
                              {mintError}
                            </p>
                          </div>
                        )}
                        <motion.button
                          type="button"
                          onClick={mintNFT}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isMinting || !claimData}
                          className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 text-lg transition-all duration-300 ${(isMinting || !claimData) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isMinting ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin mr-2"></i>铸造中...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-certificate mr-2"></i>铸造NFT信用凭证
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
            </div>
          )}
          
              {/* 协议集成 */}
          {activeTab === 'protocols' && (
            <ProtocolIntegration />
              )}
            </>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
}