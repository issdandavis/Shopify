import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface LogisticsAdvice {
  optimalCarrier: 'USPS' | 'FedEx' | 'UPS' | 'DHL';
  estimatedCost: number;
  estimatedDays: string;
  customsRequirements?: string;
  pros: string[];
  cons: string[];
}

export const getLogisticsAdvice = async (
  destination: string, 
  weightOz: number, 
  isInternational: boolean
): Promise<LogisticsAdvice> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      optimalCarrier: { type: Type.STRING, enum: ['USPS', 'FedEx', 'UPS', 'DHL'] },
      estimatedCost: { type: Type.NUMBER },
      estimatedDays: { type: Type.STRING },
      customsRequirements: { type: Type.STRING },
      pros: { type: Type.ARRAY, items: { type: Type.STRING } },
      cons: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["optimalCarrier", "estimatedCost", "estimatedDays", "pros", "cons"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Destination: ${destination}. Weight: ${weightOz}oz. International: ${isInternational}. 
               Compare USPS, FedEx, UPS, and DHL. Provide optimal choice for a merchant.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text) as LogisticsAdvice;
};