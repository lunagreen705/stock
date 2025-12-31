import React, { useState } from 'react';
import { analyzeMarket } from './services/geminiService';
import { AnalysisReport, AnalysisStatus } from './types';
import StockCard from './components/StockCard';
import GmailGenerator from './components/GmailGenerator';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAnalysis = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');
    try {
      const result = await analyzeMarket();
      setReport(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e: any) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(e.message || "分析過程中發生錯誤，請檢查 API Key 或稍後再試。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-20">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                TWStock AI 趨勢獵手
              </h1>
              <p className="text-xs text-slate-500">Gemini 3 Pro + Search Grounding</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {status === AnalysisStatus.COMPLETE && (
               <button 
                 onClick={() => { setStatus(AnalysisStatus.IDLE); setReport(null); }}
                 className="text-sm text-slate-400 hover:text-white transition-colors"
               >
                 清除結果
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro / Call to Action */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            AI 驅動的台股選股助理
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            利用 Gemini 的強大推論能力，結合即時網路搜尋，分析近期三個月的技術指標與籌碼動向，自動篩選 10 檔潛力股並生成日報。
          </p>
          
          {status === AnalysisStatus.IDLE && (
            <button
              onClick={handleAnalysis}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary-600 font-lg rounded-full hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-offset-slate-900"
            >
              <span className="mr-2">開始全市場分析</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          )}

          {status === AnalysisStatus.ANALYZING && (
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="text-primary-400 animate-pulse font-medium">正在掃描台股市場資訊 (Search Grounding)...</p>
              <p className="text-xs text-slate-500 mt-2">這可能需要 15-30 秒</p>
            </div>
          )}

          {status === AnalysisStatus.ERROR && (
             <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mt-4">
                <p className="font-bold">發生錯誤</p>
                <p className="text-sm">{errorMsg}</p>
                <button onClick={handleAnalysis} className="mt-3 bg-red-800 hover:bg-red-700 px-4 py-1 rounded text-sm transition-colors">重試</button>
             </div>
          )}
        </div>

        {/* Results */}
        {status === AnalysisStatus.COMPLETE && report && (
          <div className="animate-fade-in-up">
            
            {/* Market Sentiment Bar */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-10 backdrop-blur-sm">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">市場情緒總結</h3>
              <p className="text-xl text-white leading-relaxed font-light">
                {report.marketSentiment}
              </p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                 {report.sources.map((source, i) => (
                   <a key={i} href={source} target="_blank" rel="noreferrer" className="text-xs bg-slate-900 text-slate-500 px-3 py-1 rounded-full border border-slate-700 hover:text-primary-400 hover:border-primary-500 transition-colors truncate max-w-[200px]">
                     參考來源 {i+1}
                   </a>
                 ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {report.stocks.map((stock, index) => (
                <StockCard key={stock.code} stock={stock} index={index} />
              ))}
            </div>

            {/* Email Section */}
            <GmailGenerator report={report} />

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
