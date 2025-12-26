
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { createShopifyChat, generateSpeech, stopSpeech } from '../services/geminiService.ts';
import { ChatBubbleIcon, PaperAirplaneIcon, XIcon, SparklesIcon, GlobeIcon, SpeakerIcon, SpeakerWaveIcon, MicrophoneIcon } from './Icons.tsx';

interface Message {
    role: 'user' | 'model';
    text: string;
    sources?: any[];
}

interface ChatWidgetProps {
    onNavigate?: (action: string, target?: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hi! I am your Aether Moor Architect. I can help with real-time research, maps grounding, or navigating your store setups. Ask me anything!' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = 'en-US';
                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInputValue(transcript);
                    handleSendMessage(undefined, transcript);
                    setIsListening(false);
                };
                recognition.onerror = () => setIsListening(false);
                recognition.onend = () => setIsListening(false);
                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleVoice = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
        e?.preventDefault();
        const userMsg = directText || inputValue;
        if (!userMsg.trim() || isLoading) return;

        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);
        stopSpeech();
        setIsSpeaking(false);

        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = createShopifyChat();
            }
            const result = await chatSessionRef.current.sendMessage({ message: userMsg });
            
            // Handle Function Calls (Navigation)
            if (result.functionCalls) {
              for (const fc of result.functionCalls) {
                if (fc.name === 'navigateApp' && onNavigate) {
                  const { action, target } = fc.args as any;
                  onNavigate(action, target);
                  
                  // Feed result back to model
                  await chatSessionRef.current.sendMessage({
                    message: `Internal Navigation to ${target || action} successful.`
                  });
                }
              }
            }

            const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: result.text || "Action completed.",
                sources: sources
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Strategic communication breakdown. Check logs." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeech = async (text: string) => {
        if (isSpeaking) {
            stopSpeech();
            setIsSpeaking(false);
            return;
        }
        setIsSpeaking(true);
        try {
            await generateSpeech(text);
        } catch (err) {
            console.error("Speech error", err);
        } finally {
            setIsSpeaking(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-[calc(100vw-32px)] sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-green-500" />
                            <h3 className="font-bold text-sm">App Architect AI</h3>
                        </div>
                        <button onClick={() => { setIsOpen(false); stopSpeech(); setIsSpeaking(false); }} className="p-1 hover:bg-white/10 rounded-lg"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm relative group ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border text-gray-800 shadow-sm'}`}>
                                    {msg.text}
                                    
                                    {msg.role === 'model' && (
                                        <button 
                                            onClick={() => handleSpeech(msg.text)} 
                                            className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-green-600 transition-all"
                                        >
                                            <SpeakerIcon className="w-4 h-4" />
                                        </button>
                                    )}

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                                            {msg.sources.map((src, sIdx) => {
                                                if (src.web) {
                                                  return (
                                                    <a key={sIdx} href={src.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                                                        <GlobeIcon className="w-3 h-3" />
                                                        {src.web.title?.substring(0, 15) || 'Ref'}...
                                                    </a>
                                                  );
                                                }
                                                if (src.maps) {
                                                  return (
                                                    <a key={sIdx} href={src.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors">
                                                        <GlobeIcon className="w-3 h-3" />
                                                        View on Maps
                                                    </a>
                                                  );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl px-4 py-2 shadow-sm animate-pulse flex items-center gap-2">
                                    <GlobeIcon className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Archiving Knowledge...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 bg-white">
                        <button type="button" onClick={toggleVoice} className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:text-green-600'}`}>
                          <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Strategize here..." className="flex-1 bg-gray-100 rounded-full py-2 px-4 outline-none text-sm focus:bg-gray-200 transition-all" />
                        <button type="submit" className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md active:scale-90"><PaperAirplaneIcon className="w-5 h-5" /></button>
                    </form>
                </div>
            )}
            <button onClick={() => { setIsOpen(!isOpen); if (isOpen) { stopSpeech(); setIsSpeaking(false); } }} className={`p-4 rounded-full shadow-lg ${isOpen ? 'bg-gray-700' : 'bg-green-600'} text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center`}>
                {isSpeaking ? <SpeakerWaveIcon className="animate-pulse" /> : (isOpen ? <XIcon /> : <ChatBubbleIcon />)}
            </button>
        </div>
    );
};
