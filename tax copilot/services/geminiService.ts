import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants.ts";

// Use process.env.API_KEY directly as per guidelines
export const getTaxAdvice = async (history: { role: 'user' | 'model', content: string }[], message: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })), { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey();
      return "Your API key session expired or is invalid. Please select a valid API key from the popup.";
    }
    return "An error occurred while connecting to the AI expert. Please ensure your API key is valid.";
  }
};

// Use process.env.API_KEY directly as per guidelines
export const analyzeDocument = async (fileBase64: string, mimeType: string, fileName: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          { text: `Analyze this Indian tax document: ${fileName}. 
          1. Identify the document type (Form 16, AIS, Bank Statement, etc.).
          2. Extract key financial figures (Gross Income, TDS, Deductions).
          3. Explain its relevance to the user's tax filing in plain English.
          4. Suggest the next action for the user.
          Format the response as a JSON object with properties: docType, summary, extractedData (as a string), recommendations.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            docType: { type: Type.STRING },
            summary: { type: Type.STRING },
            extractedData: { type: Type.STRING },
            recommendations: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Document Analysis Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey();
    }
    return null;
  }
};

// Use process.env.API_KEY directly as per guidelines
export const getTaxAnalysis = async (taxData: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{
          text: `Acting as a Chartered Accountant, analyze the following tax data for FY 2024-25:
          - Gross Income: ₹${taxData.grossIncome}
          - 80C Investments: ₹${taxData.investments80C}
          - 80D Insurance: ₹${taxData.healthIns80D}
          - HRA Exemption: ₹${taxData.hraExemption}
          - Best Regime identified by calculator: ${taxData.bestRegime}
          - Potential Savings: ₹${taxData.savings}
          
          Provide:
          1. A concise summary of the tax position.
          2. Specific optimization tips to reduce tax further (e.g., NPS, 80G, Home Loan).
          3. A warning about any compliance risks based on this profile.
          Keep it professional and helpful.`
        }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Tax Analysis Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey();
    }
    return "Could not generate AI analysis at this time.";
  }
};