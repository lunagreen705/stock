import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, StockRecommendation } from "../types";

// Initialize Gemini Client
// Note: In a production app, never expose keys in client-side code without a proxy. 
// For this demo, we use the process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarket = async (): Promise<AnalysisReport> => {
  const modelId = "gemini-3-pro-preview";

  const systemInstruction = `
    You are an expert Taiwan Stock Market Analyst (AI Financial Assistant).
    Your goal is to identify 10 promising stocks based on technical analysis (moving averages, MACD, RSI) and chip analysis (institutional buying, insider moves) from the last 3 months.
    
    You MUST use the 'googleSearch' tool to find the most recent market data, news, and analyst reports for the Taiwan Stock Exchange (TWSE/TPEX).
    
    Strictly Output JSON format.
    Do not provide investment advice; provide educational analysis only.
    Use Traditional Chinese (繁體中文).
  `;

  const prompt = `
    請搜尋台灣股市最近三個月的熱門股票資訊。
    
    請幫我篩選出 10 檔「技術面強勢」（例如均線多頭排列、MACD 黃金交叉）或「籌碼面優良」（外資投信連續買超）的潛力上漲股票。
    
    對於每一檔股票，請提供：
    1. 股票代號 (Code)
    2. 股票名稱 (Name)
    3. 近期參考價格 (Price)
    4. 產業類別 (Sector)
    5. 看好理由 (Reason - 請詳細說明技術或籌碼面依據)
    6. 主要技術指標訊號 (Technical Signal)
    7. 主要籌碼訊號 (Chip Signal)
    8. 風險等級 (Risk Level - High/Medium/Low)

    同時，請總結一段目前的大盤市場情緒 (Market Sentiment)。
  `;

  try {
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
            marketSentiment: { type: Type.STRING, description: "Overview of current market trend" },
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
                required: ["code", "name", "reason", "technicalSignal", "chipSignal"],
              },
            },
          },
          required: ["marketSentiment", "stocks"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini.");
    }

    const data = JSON.parse(response.text);
    
    // Extract sources from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: string[] = [];
    
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sources.push(chunk.web.uri);
      }
    });

    // De-duplicate sources
    const uniqueSources = Array.from(new Set(sources));

    return {
      date: new Date().toLocaleDateString('zh-TW'),
      marketSentiment: data.marketSentiment,
      stocks: data.stocks,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
