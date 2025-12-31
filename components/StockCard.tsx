import React from 'react';
import { StockRecommendation } from '../types';

interface StockCardProps {
  stock: StockRecommendation;
  index: number;
}

const StockCard: React.FC<StockCardProps> = ({ stock, index }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-primary-500 transition-all duration-300 shadow-lg group relative overflow-hidden">
      {/* Decorative Index Number */}
      <div className="absolute -right-4 -top-4 text-6xl font-black text-slate-700 opacity-20 group-hover:text-primary-500 group-hover:opacity-10 transition-colors">
        {index + 1}
      </div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-white">{stock.name}</h3>
            <span className="text-sm font-mono text-slate-400">{stock.code}</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-primary-400 mt-1 inline-block">
            {stock.sector}
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-bull">{stock.price}</div>
          <div className={`text-xs px-2 py-0.5 rounded mt-1 font-bold ${
            stock.riskLevel === 'High' ? 'bg-red-900/30 text-red-400' :
            stock.riskLevel === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
            'bg-green-900/30 text-green-400'
          }`}>
            {stock.riskLevel === 'High' ? '高風險' : stock.riskLevel === 'Medium' ? '中風險' : '低風險'}
          </div>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">{stock.reason}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-700/30 p-2 rounded">
            <span className="block text-slate-500 mb-1">技術面訊號</span>
            <span className="font-semibold text-primary-300">{stock.technicalSignal}</span>
          </div>
          <div className="bg-slate-700/30 p-2 rounded">
            <span className="block text-slate-500 mb-1">籌碼面訊號</span>
            <span className="font-semibold text-purple-300">{stock.chipSignal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
