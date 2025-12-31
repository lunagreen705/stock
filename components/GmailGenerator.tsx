import React, { useState } from 'react';
import { AnalysisReport } from '../types';

interface GmailGeneratorProps {
  report: AnalysisReport;
}

const GmailGenerator: React.FC<GmailGeneratorProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const generateEmailBody = () => {
    let body = `【每日台股 AI 趨勢快報】 ${report.date}\n\n`;
    body += `市場情緒概況：\n${report.marketSentiment}\n\n`;
    body += `----------------------------------------\n`;
    body += `今日精選 10 檔潛力股：\n\n`;

    report.stocks.forEach((stock, idx) => {
      body += `${idx + 1}. ${stock.name} (${stock.code}) - ${stock.price}\n`;
      body += `   理由: ${stock.reason}\n`;
      body += `   訊號: Tech[${stock.technicalSignal}] / Chip[${stock.chipSignal}]\n\n`;
    });

    body += `----------------------------------------\n`;
    body += `資料來源 (Gemini Search Grounding)：\n`;
    report.sources.forEach(source => {
      body += `- ${source}\n`;
    });
    
    body += `\n*本信件由 AI 生成，僅供研究參考，非投資建議。*\n`;
    return body;
  };

  const handleSendGmail = () => {
    const subject = encodeURIComponent(`台股 AI 每日分析報告 - ${report.date}`);
    const body = encodeURIComponent(generateEmailBody());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailBody()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
           <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        Gmail 報告生成器
      </h3>
      
      <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-slate-400 whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-700 mb-4">
        {generateEmailBody()}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSendGmail}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          啟動 Gmail 撰寫
        </button>
        <button 
          onClick={handleCopy}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {copied ? '已複製！' : '複製內容'}
        </button>
      </div>
      <p className="text-slate-500 text-xs mt-3 text-center">
        注意：Web 應用程式無法直接背景發送郵件。請點擊上方按鈕開啟您的郵件軟體。
      </p>
    </div>
  );
};

export default GmailGenerator;
