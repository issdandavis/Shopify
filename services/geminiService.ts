
import { GoogleGenAI, Type, Chat, Modality, FunctionDeclaration } from "@google/genai";
import { GeneratedPlanResponse, StepAdvice } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-3-flash-preview";
const proModelName = "gemini-3-pro-preview";
const mapsModelName = "gemini-2.5-flash";
const ttsModelName = "gemini-2.5-flash-preview-tts";

export const navigationFunctionDeclaration: FunctionDeclaration = {
  name: 'navigateApp',
  parameters: {
    type: Type.OBJECT,
    description: 'Navigate within the ShopGuide AI application or filter project steps.',
    properties: {
      action: {
        type: Type.STRING,
        description: 'The navigation action to perform.',
        enum: [
          'switch_project', 
          'filter_steps', 
          'open_sidebar', 
          'close_sidebar', 
          'create_new', 
          'show_dashboard', 
          'toggle_kindle_mode', 
          'aws_sync', 
          'show_analytics', 
          'show_mobile_preview', 
          'show_shipping_studio', 
          'show_integrations',
          'show_pricing',
          'show_wholesale'
        ],
      },
      target: {
        type: Type.STRING,
        description: 'The target project name, category name, or specific step title.',
      },
    },
    required: ['action'],
  },
};

export const generateProjectPlan = async (userGoal: string, language: string = 'English'): Promise<GeneratedPlanResponse> => {
  const schema: any = {
    type: Type.OBJECT,
    properties: {
      projectName: { type: Type.STRING },
      projectDescription: { type: Type.STRING },
      feasibilityScore: { type: Type.NUMBER },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            category: { type: Type.STRING },
            deepLink: { type: Type.STRING },
            externalLink: { type: Type.STRING }
          },
          required: ["title", "description", "estimatedTime", "category"],
        },
      },
    },
    required: ["projectName", "projectDescription", "steps", "feasibilityScore"],
  };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Language: ${language}. User Goal: "${userGoal}". 
    Personal context: The user is Issac Davis, architect of Aether Moor Games. 
    If the goal relates to gaming, suggest Aether Moor specific strategies (Twitch integration, Steam Workshop merch). 
    If general commerce, suggest standard enterprise scaling.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: `You are Issac Davis's Personal Business Architect. You manage the Aether Moor Gaming brand and AI Workflow Architect pipelines. Your tone is technical, strategic, and high-agency. Always prioritize privacy-first (Lumo) and developer-centric workflows.`,
    },
  });

  return JSON.parse(response.text) as GeneratedPlanResponse;
};

export const getStepDetails = async (stepTitle: string, context: string, language: string = 'English'): Promise<StepAdvice> => {
  const schema: any = {
    type: Type.OBJECT,
    properties: {
      detailedInstructions: { type: Type.STRING },
      whyItMatters: { type: Type.STRING },
      commonPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestedAdminPath: { type: Type.STRING },
      suggestedExternalTool: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['canva', 'figma', 'aliexpress', 'printful', 'stripe', 'paypal', 'klaviyo', 'mailchimp', 'instagram', 'tiktok', 'other'] }
        },
        required: ["name", "url", "type"]
      }
    },
    required: ["detailedInstructions", "whyItMatters", "commonPitfalls"],
  };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Detailed Instructions for: "${stepTitle}" in ${language}. Context: ${context}. 
               If the task involves gaming merch, mention Twitch/Discord pre-orders. 
               If it involves workflow, mention GitHub auto-issue generation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

   return { 
     stepId: "", 
     ...JSON.parse(response.text)
   } as StepAdvice;
};

/**
 * Enhanced Search Grounding
 */
export const getSearchGroundedInfo = async (query: string) => {
  return await ai.models.generateContent({
    model: modelName, // gemini-3-flash-preview for search
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
};

/**
 * Enhanced Maps Grounding
 */
export const getMapsGroundedInfo = async (query: string) => {
  return await ai.models.generateContent({
    model: mapsModelName, // gemini-2.5-flash for maps
    contents: query,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
    },
  });
};

export const createShopifyChat = (language: string = 'English'): Chat => {
    return ai.chats.create({
        model: proModelName, // Using Pro for complex chatbot tasks
        config: {
            tools: [{ functionDeclarations: [navigationFunctionDeclaration] }, { googleSearch: {} }],
            systemInstruction: `You are Issac Davis's Personal AI Architect. You are the digital double of the Fizzle's Engineering podcast creator. Assist with Aether Moor Games, GitHub workflow orchestration, and Lumo secure analytics. Respond to "Hey Issac" with immediate strategic assistance. You have access to Google Search for real-time information.`,
        }
    });
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let currentAudioSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;

export const generateSpeech = async (text: string): Promise<void> => {
    if (currentAudioSource) {
        currentAudioSource.stop();
        currentAudioSource = null;
    }
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const response = await ai.models.generateContent({
        model: ttsModelName,
        contents: [{ parts: [{ text: `Read this: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        const audioData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        currentAudioSource = source;
    }
};

export const stopSpeech = () => {
    if (currentAudioSource) {
        currentAudioSource.stop();
        currentAudioSource = null;
    }
};
