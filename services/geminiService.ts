import { GoogleGenAI, Type } from "@google/genai";
import { blobToBase64 } from "./audioUtils";
import { AIAnalysisResult } from "../types";

export const analyzeAudio = async (audioBlob: Blob): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Audio = await blobToBase64(audioBlob);

  const model = "gemini-2.5-flash"; // Efficient for audio analysis

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio,
            },
          },
          {
            text: "Analyze this audio. Provide a catchy, short title (max 10 words), a brief summary (max 30 words), and a full transcription. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            transcript: { type: Type.STRING },
          },
          required: ["title", "summary", "transcript"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Return a fallback if AI fails, so the app doesn't crash
    return {
      title: "Audio Recording",
      summary: "Could not analyze audio content at this time.",
      transcript: "Transcription unavailable.",
    };
  }
};