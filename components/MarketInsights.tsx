
import React, { useState } from 'react';
import { Project } from '../types.ts';
import { getSearchGroundedInfo } from '../services/geminiService.ts';
import { SparklesIcon, GlobeIcon, ChartBarIcon, BoltIcon, InfoIcon } from './Icons.tsx';

export const MarketInsights: React.FC<{ project: Project }> = ({ project }) => {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);
    const [sources, setSources] = useState<any[]>([]);

    const runResearch = async () => {
        setLoading(true);
        try {
            const query = `Latest trends, competitor pricing, and market demand for ${project.name}: ${project.description}. Provide actionable data for a new merchant.`;
            const result = await getSearchGroundedInfo(query);
            setInsights(result.text || "No insights found.");
            setSources(result.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 animate-fade-in space-y-10 h-full overflow-y-auto pb-24">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Market Intelligence</h2>
                <p className="text-gray-500 font-medium">Real-time competitive research powered by Google Search Grounding.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-1 p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] flex flex-col">
                    <div className="w-12 h-12 bg-[#008060]/10 rounded-2xl flex items-center justify-center text-[#008060] mb-6">
                        <GlobeIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-xl text-white mb-2">Live Reconnaissance</h3>
                    <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed">
                        Identify market saturation, trending price points, and logistics hurdles in the current global climate.
                    </p>
                    <button 
                        onClick={runResearch}
                        disabled={loading}
                        className="w-full mt-auto py-5 bg-[#008060] text-white font-black rounded-2xl hover:bg-[#006e52] transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-3"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><BoltIcon className="w-5 h-5" /> EXECUTE SEARCH</>}
                    </button>
                </section>

                <section className="lg:col-span-2 p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] min-h-[400px] flex flex-col">
                    {!insights && !loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                            <ChartBarIcon className="w-16 h-16 mb-4" />
                            <p className="font-black text-sm uppercase tracking-widest">Awaiting Analysis...</p>
                        </div>
                    ) : loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#008060] rounded-full animate-spin mb-6"></div>
                            <p className="text-[#008060] font-black text-xs uppercase tracking-[0.2em] animate-pulse">Scanning Global Marketplace...</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-6">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Strategic Briefing</h3>
                                <div className="px-3 py-1 bg-green-900/20 text-green-400 text-[10px] font-black rounded-full uppercase">Real-Time Data</div>
                            </div>
                            
                            <div className="prose prose-invert max-w-none text-gray-400 text-sm leading-relaxed">
                                {insights?.split('\n').map((para, i) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>

                            {sources.length > 0 && (
                                <div className="pt-6 border-t border-[#1F1F21]">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Verification Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sources.map((src, i) => src.web && (
                                            <a key={i} href={src.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-xl border border-[#1F1F21] text-[10px] font-bold text-gray-400 hover:text-white transition-colors">
                                                <GlobeIcon className="w-3 h-3" /> {src.web.title?.substring(0, 20)}...
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
