import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function API() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">API文档</h1>
        <p className="text-xl text-gray-400 mb-8">集成DeFi-AI信用哨兵到您的应用</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧导航 */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 sticky top-24">
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('overview')}
                    type="button"
                  >
                    概述
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'authentication' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('authentication')}
                    type="button"
                  >
                    认证
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'endpoints' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('endpoints')}
                    type="button"
                  >
                    API端点
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'examples' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('examples')}
                    type="button"
                  >
                    示例代码
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'sdks' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('sdks')}
                    type="button"
                  >
                    SDK
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 右侧内容 */}
          <div className="flex-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">API概述</h2>
                  <p className="text-gray-300 mb-4">
                    DeFi-AI信用哨兵API允许开发者将我们的信用评分系统集成到他们自己的应用中。通过我们的API，您可以：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-6">
                    <li>获取用户的链上信用评分</li>
                    <li>验证用户的NFT信用凭证</li>
                    <li>根据信用评分调整抵押率</li>
                    <li>获取用户的信用历史数据</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-3">基本URL</h3>
                  <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-6">
                    https://api.defi-ai-sentinel.com/v1
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">响应格式</h3>
                  <p className="text-gray-300 mb-3">
                    所有API响应均为JSON格式，包含以下基本结构：
                  </p>
                  <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-6 overflow-x-auto">
                    {`{
  "success": true,
  "data": { ... },  // 成功时返回的数据
  "error": null     // 失败时返回的错误信息
}`}
                  </div>
                </div>
              )}
              
              {activeTab === 'authentication' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">认证</h2>
                  <p className="text-gray-300 mb-4">
                    所有API请求都需要使用API密钥进行认证。您可以在开发者控制台中创建和管理您的API密钥。
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3">认证方式</h3>
                  <p className="text-gray-300 mb-3">
                    在每个请求的Header中添加您的API密钥：
                  </p>
                  <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-6">
                    X-API-Key: your_api_key_here
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <p className="text-yellow-200 flex items-start">
                      <i className="fa-solid fa-triangle-exclamation mt-1 mr-2"></i>
                      <span>请妥善保管您的API密钥，不要在客户端代码中暴露它。所有API调用应该从您的服务器端发起。</span>
                    </p>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">速率限制</h3>
                  <p className="text-gray-300 mb-3">
                    API请求有以下速率限制：
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>免费计划：每分钟10次请求</li>
                    <li>基础计划：每分钟50次请求</li>
                    <li>专业计划：每分钟200次请求</li>
                    <li>企业计划：自定义限制</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'endpoints' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">API端点</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center mb-3">
                        <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium mr-2">POST</span>
                        <h3 className="text-xl font-semibold">/analyze</h3>
                      </div>
                      <p className="text-gray-300 mb-3">
                        分析用户的链上行为并生成信用评分。
                      </p>
                      <h4 className="text-lg font-medium mb-2">请求参数</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        {`{
  "address": "0x1234567890123456789012345678901234567890"  // 用户的以太坊地址
}`}
                      </div>
                      <h4 className="text-lg font-medium mb-2">响应</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                        {`{
  "address": "0x1234567890123456789012345678901234567890",
  "score": 710,
  "tierId": 2,
  "claimData": {
    "value": {
      "to": "0x1234567890123456789012345678901234567890",
      "score": "710",
      "tierId": 2,
      "nonce": "1629384756",
      "deadline": "1629385356"
    },
    "signature": "0x..."
  }
}`}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium mr-2">GET</span>
                        <h3 className="text-xl font-semibold">/score/{'{address}'}</h3>
                      </div>
                      <p className="text-gray-300 mb-3">
                        获取用户的当前信用评分。
                      </p>
                      <h4 className="text-lg font-medium mb-2">路径参数</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        address: 用户的以太坊地址
                      </div>
                      <h4 className="text-lg font-medium mb-2">响应</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                        {`{
  "address": "0x1234567890123456789012345678901234567890",
  "score": 710,
  "tierId": 2,
  "lastUpdated": "2023-08-15T12:34:56Z"
}`}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium mr-2">GET</span>
                        <h3 className="text-xl font-semibold">/history/{'{address}'}</h3>
                      </div>
                      <p className="text-gray-300 mb-3">
                        获取用户的信用评分历史。
                      </p>
                      <h4 className="text-lg font-medium mb-2">路径参数</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        address: 用户的以太坊地址
                      </div>
                      <h4 className="text-lg font-medium mb-2">查询参数</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        limit: 返回的记录数量（默认10，最大100）
                        from: 开始时间戳
                        to: 结束时间戳
                      </div>
                      <h4 className="text-lg font-medium mb-2">响应</h4>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                        {`{
  "address": "0x1234567890123456789012345678901234567890",
  "history": [
    { "score": 710, "timestamp": "2023-08-15T12:34:56Z" },
    { "score": 695, "timestamp": "2023-07-15T10:24:36Z" },
    { "score": 680, "timestamp": "2023-06-15T08:14:26Z" }
  ]
}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'examples' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">示例代码</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">JavaScript</h3>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        {`// 使用fetch API获取用户信用评分
async function getUserCreditScore(address) {
  const response = await fetch('https://api.defi-ai-sentinel.com/v1/score/' + address, {
    headers: {
      'X-API-Key': 'your_api_key_here'
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error);
  }
}

// 分析用户链上行为
async function analyzeUserBehavior(address) {
  const response = await fetch('https://api.defi-ai-sentinel.com/v1/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your_api_key_here'
    },
    body: JSON.stringify({ address })
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error);
  }
}`}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Python</h3>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        {`import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.defi-ai-sentinel.com/v1"

def get_user_credit_score(address):
    headers = {
        "X-API-Key": API_KEY
    }
    
    response = requests.get(f"{BASE_URL}/score/{address}", headers=headers)
    data = response.json()
    
    if response.status_code == 200:
        return data
    else:
        raise Exception(f"Error: {data.get('error')}")

def analyze_user_behavior(address):
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "address": address
    }
    
    response = requests.post(f"{BASE_URL}/analyze", headers=headers, json=payload)
    data = response.json()
    
    if response.status_code == 200:
        return data
    else:
        raise Exception(f"Error: {data.get('error')}")
`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'sdks' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">SDK</h2>
                  <p className="text-gray-300 mb-6">
                    我们提供多种语言的SDK，以简化与我们API的集成。
                  </p>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">JavaScript SDK</h3>
                      <p className="text-gray-300 mb-3">
                        通过npm安装：
                      </p>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4">
                        npm install defi-ai-sentinel-sdk
                      </div>
                      <p className="text-gray-300 mb-3">
                        使用示例：
                      </p>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        {`import { CreditSentinelSDK } from 'defi-ai-sentinel-sdk';

const sdk = new CreditSentinelSDK('your_api_key_here');

// 获取用户信用评分
async function getUserScore(address) {
  const score = await sdk.getScore(address);
  console.log(\`用户信用评分: \${score}\`);
  return score;
}

// 分析用户行为
async function analyzeUser(address) {
  const result = await sdk.analyze(address);
  console.log(\`分析结果: \${JSON.stringify(result)}\`);
  return result;
}`}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Python SDK</h3>
                      <p className="text-gray-300 mb-3">
                        通过pip安装：
                      </p>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4">
                        pip install defi-ai-sentinel
                      </div>
                      <p className="text-gray-300 mb-3">
                        使用示例：
                      </p>
                      <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
                        {`from defi_ai_sentinel import CreditSentinelSDK

sdk = CreditSentinelSDK("your_api_key_here")

# 获取用户信用评分
def get_user_score(address):
    score = sdk.get_score(address)
    print(f"用户信用评分: {score}")
    return score

# 分析用户行为
def analyze_user(address):
    result = sdk.analyze(address)
    print(f"分析结果: {result}")
    return result`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 flex items-start">
                      <i className="fa-solid fa-info-circle mt-1 mr-2"></i>
                      <span>更多SDK和详细文档请访问我们的<a href="#" className="text-blue-400 underline">开发者门户</a>。</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 