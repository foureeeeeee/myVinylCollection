import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey });

export const getAIRecommendations = async (
  query: string, 
  userCollectionContext: string
): Promise<RecommendationResponse[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a vinyl record expert.
    User Query: "${query}"
    
    Context (User's current top vinyls): ${userCollectionContext}
    
    Recommend 3-5 vinyl albums based on the query and context. 
    If the query is generic (like "recommend me something"), use the context to find similar vibes or contrasting gems.
    If the query asks for "highest rated", provide generally critically acclaimed albums.
    
    Return pure JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              album: { type: Type.STRING },
              artist: { type: Type.STRING },
              year: { type: Type.STRING },
              genre: { type: Type.STRING },
              reason: { type: Type.STRING, description: "Why this fits the request" },
            },
            required: ["album", "artist", "year", "genre", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as RecommendationResponse[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
