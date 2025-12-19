import { GoogleGenAI } from "@google/genai";

const API_KEY = "YOUR_API_KEY_HERE";
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateText() {
  const prompt = "say hello world";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

generateText();