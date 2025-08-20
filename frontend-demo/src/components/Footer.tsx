export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <i className="fa-solid fa-shield text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                DeFi-AI信用哨兵
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              用AI动态评估DeFi用户信用，并将评分结果通过NFT上链，实现链上信用可视化
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">产品</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">信用评估</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">NFT凭证</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">协议集成</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API文档</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">资源</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">白皮书</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">项目文档</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">常见问题</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">社区论坛</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <i className="fa-solid fa-envelope mr-2 text-gray-500"></i>
                <a href="mailto:contact@defi-ai-sentinel.com" className="hover:text-blue-400 transition-colors">
                  contact@defi-ai-sentinel.com
                </a>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-twitter mr-2 text-gray-500"></i>
                <a href="#" className="hover:text-blue-400 transition-colors">@DeFiAICredit</a>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-github mr-2 text-gray-500"></i>
                <a href="#" className="hover:text-blue-400 transition-colors">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 DeFi-AI Credit Sentinel. 保留所有权利。</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">隐私政策</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">服务条款</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
}