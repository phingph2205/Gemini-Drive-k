import { GoogleGenAI } from "@google/genai";

export async function generateFileNotes(fileName: string, currentNotes: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate a short, helpful description or set of tags for a file named "${fileName}". ${currentNotes ? `Current notes: ${currentNotes}` : ''} Keep it under 50 words.`,
    });
    
    return response.text;
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}
