import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { TrendingUp, TrendingDown, Search, Mail, Copy, Loader2, AlertCircle } from 'lucide-react';

// --- Types ---
interface StockRecommendation {
  code: string;
  name: string;
  price: string;
  sector: string;
  reason: string;
  technicalSignal: string;
  chipSignal: string;
  riskLevel: 'High' | 'Medium' | 'Low';
}

interface AnalysisReport {
  date: string;
  marketSentiment: string;
  stocks: StockRecommendation[];
  sources: string[];
}

// --- API Client ---
// Ensure API Key is available
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Styles (Inline for simplicity) ---
const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center' as const, marginBottom: '40px' },
  title: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px' },
  subtitle: { color: '#64748b' },
  buttonPrimary: {
    backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
    margin: '0 auto', transition: 'background 0.3s'
  },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' },
  badge: (risk: string) => ({
    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
    backgroundColor: risk === 'High' ? '#fee2e2' : risk === 'Medium' ? '#fef3c7' : '#dcfce7',
    color: risk === 'High' ? '#991b1b' : risk === 'Medium' ? '#92400e' : '#166534'
  }),
  sectionTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#334155', marginBottom: '15px', borderLeft: '5px solid #2563eb', paddingLeft: '10px' },
  sourceLink: { display: 'block', color: '#2563eb', textDecoration: 'none', marginBottom: '5px', fontSize: '0.9rem', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const },
  toolbar: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '40px' },
  secondaryBtn: {
    backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 20px',
    borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
  }
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const analyzeMarket = async () => {
    if (!ai) {
      setError("API Key 尚未設定。請在 Render 環境變數中設定 API_KEY。");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const modelId = "gemini-3-pro-preview"; // Using Pro for better reasoning
      const systemInstruction = `
        You are an expert Taiwan Stock Market Analyst.
        Identify 10 promising stocks based on technical (moving averages, MACD) and chip analysis (institutional buying) from the last 3 months.
        You MUST use the 'googleSearch' tool to find the most recent market data.
        Strictly Output JSON.
        Use Traditional Chinese.
      `;

      const prompt = `
        請搜尋台灣股市最近三個月的熱門股票資訊。
        請幫我篩選出 10 檔「技術面強勢」或「籌碼面優良」的潛力上漲股票。
        
        對於每一檔股票，請提供：
        1. code (股票代號)
        2. name (股票名稱)
        3. price (近期參考價格)
        4. sector (產業類別)
        5. reason (看好理由 - 詳細說明技術或籌碼面依據)
        6. technicalSignal (主要技術指標訊號)
        7. chipSignal (主要籌碼訊號)
        8. riskLevel (High/Medium/Low)

        同時，請總結一段目前的大盤市場情緒 (marketSentiment)。
      `;

      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketSentiment: { type: Type.STRING },
              stocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING },
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    sector: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    technicalSignal: { type: Type.STRING },
                    chipSignal: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  },
                  required: ["code", "name", "price", "reason", "technicalSignal", "chipSignal"],
                },
              },
            },
            required: ["marketSentiment", "stocks"],
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        
        // Extract sources from grounding metadata
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: string[] = [];
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) sources.push(chunk.web.uri);
        });

        setReport({
          date: new Date().toLocaleDateString('zh-TW'),
          marketSentiment: data.marketSentiment,
          stocks: data.stocks,
          sources: Array.from(new Set(sources)),
        });
      } else {
        throw new Error("No analysis generated.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically run analysis on mount
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      analyzeMarket();
    }
  }, []);

  const generateEmailDraft = () => {
    if (!report) return;
    const subject = encodeURIComponent(`[AI日報] 台股趨勢分析 - ${report.date}`);
    
    // Simple plain text body for mailto
    const bodyText = `
日期: ${report.date}
市場情緒: ${report.marketSentiment}

【精選個股】
${report.stocks.map(s => `
${s.code} ${s.name} (${s.price})
訊號: ${s.technicalSignal} | ${s.chipSignal}
理由: ${s.reason}
風險: ${s.riskLevel}
`).join('-------------------')}

來源: Gemini AI Search
    `.trim();

    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyToClipboard = () => {
    if (!report) return;
    const htmlContent = `
      <h2>台股分析報告 (${report.date})</h2>
      <p><strong>市場情緒：</strong>${report.marketSentiment}</p>
      <hr/>
      ${report.stocks.map(s => `
        <p><strong>${s.code} ${s.name}</strong> - ${s.price}</p>
        <p>理由：${s.reason}</p>
        <p>訊號：${s.technicalSignal} / ${s.chipSignal}</p>
      `).join('<br/>')}
    `;
    
    // Copy plain text actually works better for most chats, but let's try to be smart
    const textContent = `【台股 AI 日報 ${report.date}】\n\n${report.marketSentiment}\n\n` + 
      report.stocks.map(s => `🔹 ${s.code} ${s.name} $${s.price}\n   訊號：${s.technicalSignal}\n   分析：${s.reason}`).join('\n\n');

    navigator.clipboard.writeText(textContent).then(() => alert("報告已複製到剪貼簿！"));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>TWStock AI Trend Scout</h1>
        <p style={styles.subtitle}>Web Edition • Powered by Gemini 3 Pro & Google Search</p>
      </header>

      {!report && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
             <p style={{ color: '#64748b' }}>準備開始自動分析...</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#2563eb', margin: '0 auto 20px' }} size={48} />
          <p style={{ color: '#64748b', fontSize: '1.2rem' }}>正在掃描全台股市場數據...</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>分析技術指標、計算籌碼集中度、搜尋最新新聞...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertCircle />
             <strong>分析發生錯誤</strong>
          </div>
          <div>{error}</div>
          <button onClick={analyzeMarket} style={{ ...styles.buttonPrimary, marginTop: '10px' }}>
             重試
          </button>
        </div>
      )}

      {report && (
        <div>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📊 市場情緒總結</h2>
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{report.marketSentiment}</p>
          </div>

          <div style={styles.grid}>
            {report.stocks.map((stock) => (
              <div key={stock.code} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{stock.name} <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{stock.code}</span></h3>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{stock.sector}</span>
                  </div>
                  <span style={styles.badge(stock.riskLevel)}>{stock.riskLevel} Risk</span>
                </div>
                
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '15px' }}>
                  {stock.price}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>
                    <TrendingUp size={16} />
                    {stock.technicalSignal}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <TrendingDown size={16} /> {/* Using TrendingDown icon just as a placeholder for chips */}
                    {stock.chipSignal}
                  </div>
                </div>

                <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5' }}>{stock.reason}</p>
              </div>
            ))}
          </div>

          <div style={styles.toolbar}>
            <button onClick={generateEmailDraft} style={styles.secondaryBtn}>
              <Mail size={18} />
              開啟 Gmail 草稿
            </button>
            <button onClick={copyToClipboard} style={styles.secondaryBtn}>
              <Copy size={18} />
              複製文字報告
            </button>
             <button onClick={analyzeMarket} style={styles.secondaryBtn}>
              <Search size={18} />
              重新分析
            </button>
          </div>

          <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#64748b' }}>資料來源 (AI Grounding)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {report.sources.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                  [{i + 1}] {new URL(src).hostname}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}