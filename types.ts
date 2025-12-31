export interface StockRecommendation {
  code: string;
  name: string;
  price: string; // Keep as string to handle "Approx. 120" or exact numbers from LLM
  sector: string;
  reason: string;
  technicalSignal: string; // e.g., "MACD Golden Cross"
  chipSignal: string; // e.g., "Foreign Institutional Buying"
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface AnalysisReport {
  date: string;
  marketSentiment: string;
  stocks: StockRecommendation[];
  sources: string[]; // URLs from grounding
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}
