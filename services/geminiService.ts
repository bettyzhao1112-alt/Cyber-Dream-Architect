
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AdviceResponse, UserProfile } from "../types";
import { BASE_PROMPT } from "../constants";

export async function fetchCyberAdvice(name: string, userProfile: UserProfile, description?: string): Promise<AdviceResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  let context = "";
  if (description) {
    context = `Follow your specific philosophy: ${description}`;
  } else {
    context = `Fully adopt the persona, speaking style, and known philosophy of ${name}. Infer their likely advice based on their public history and achievements regarding ${userProfile.dream}.`;
  }

  const ageNum = parseInt(userProfile.age) || 13;

  const prompt = BASE_PROMPT
    .replace("{PERSONA_NAME}", name)
    .replace(/{USER_AGE}/g, userProfile.age)
    .replace("{USER_GENDER}", userProfile.gender)
    .replace(/{USER_DREAM}/g, userProfile.dream)
    .replace("{USER_AGE_PLUS_1}", (ageNum + 1).toString())
    .replace("{USER_AGE_PLUS_2}", (ageNum + 2).toString())
    .replace("{USER_AGE_PLUS_3}", (ageNum + 3).toString())
    .replace("{USER_AGE_PLUS_4}", (ageNum + 4).toString())
    .replace("{USER_AGE_PLUS_5}", (ageNum + 5).toString())
    .replace("{PERSONA_CONTEXT}", context);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "No response received.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      expertName: name,
      content: text,
      sources: sources,
    };
  } catch (error) {
    console.error("Error fetching advice:", error);
    throw error;
  }
}
