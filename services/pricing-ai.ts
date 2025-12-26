import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PricingRecommendation {
  suggestedPrice: number;
  margin: number;
  reasoning: string;
  competitorAvg: number;
  tieredPricing: { quantity: number; price: number }[];
}

export const getPricingRecommendation = async (
  productName: string, 
  cogs: number, 
  category: string
): Promise<PricingRecommendation> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      suggestedPrice: { type: Type.NUMBER },
      margin: { type: Type.NUMBER },
      reasoning: { type: Type.STRING },
      competitorAvg: { type: Type.NUMBER },
      tieredPricing: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            quantity: { type: Type.NUMBER },
            price: { type: Type.NUMBER }
          },
          required: ["quantity", "price"]
        }
      }
    },
    required: ["suggestedPrice", "margin", "reasoning", "competitorAvg", "tieredPricing"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recommend pricing for "${productName}" in the "${category}" category. 
               Cost of Goods (COGS) is $${cogs}. 
               Analyze market trends and suggest tiered wholesale pricing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text) as PricingRecommendation;
};