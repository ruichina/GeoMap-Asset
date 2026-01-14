
import { GoogleGenAI, Type } from "@google/genai";

// API key is obtained directly from process.env.API_KEY as per guidelines
export const getGeminiResponse = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI.";
  }
};

export const analyzeMetadata = async (imageUrl: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this image (URL: ${imageUrl}) and provide metadata in JSON: Title, Category (Oil/Gas/Engineering), Professional Field, Key Objects identified. Use Simplified Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            profession: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "category", "profession"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Metadata Analysis Error:", error);
    return null;
  }
};

export const analyzeImageDeeply = async (imageUrl: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: "作为石油天然气工程图件专家，对该工业图纸进行深度语义分析。请务必使用【简体中文】提供详细的 JSON 响应。" },
          { text: `分析位于 ${imageUrl} 的技术图件。重点是为识别出的对象提供丰富的语境和技术描述。
          
          要求的 JSON 结构:
          {
            "summary": "图件用途和内容的高级技术摘要。",
            "recognitionResults": [
              { 
                "label": "实体名称 (如：图件类型、所属区域、关键实体)", 
                "value": "识别出的具体值", 
                "confidence": 0.95, 
                "context": "这与整体工程项目的关系", 
                "description": "识别出的对象/区域的详细技术说明。" 
              }
            ],
            "structuralElements": [
              { "name": "元素名称 (如：标题栏、图例)", "bounds": "在图中的位置", "detected": true, "details": "合规性或质量说明" }
            ]
          }` }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return null;
  }
};
