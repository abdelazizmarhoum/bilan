import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateText() {
  const prompt = "response with ONLY a json file that cointains some fake data of a student"

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawResponse = response.text;

    const jsonString = rawResponse.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();

    try {
      finalResponse = JSON.parse(jsonString);
      console.log("Successfully parsed JSON:");
      console.log(finalResponse);


    } catch (parseError) {
      console.error("Failed to parse JSON from the response.");
      console.error("Raw response from model:", rawResponse);
      console.error("Parsing Error:", parseError);
    }
  } catch (error) {
    console.error("Error during API call:", error);
  }
}

generateText();