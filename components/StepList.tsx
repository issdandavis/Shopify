
import React, { useState, useRef, useEffect } from 'react';
import { Project, Step, StepAdvice } from '../types.ts';
import { 
  CheckCircleIcon, ChevronRightIcon, InfoIcon, SparklesIcon, GlobeIcon, 
  SpeakerIcon, SpeakerWaveIcon, SettingsIcon, TruckIcon, BoxIcon, 
  TagIcon, MegaphoneIcon, XIcon, TrashIcon, CreditCardIcon, ChartBarIcon, 
  EnvelopeIcon, BoltIcon, BeakerIcon, GamepadIcon, 
  GithubIcon, DiscordIcon 
} from './Icons.tsx';
import { getStepDetails, generateSpeech, stopSpeech } from '../services/geminiService.ts';

interface StepListProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  filterCategory?: string | null;
  isEInkMode?: boolean;
}

export const StepList: React.FC<StepListProps> = ({ project, onUpdateProject, filterCategory, isEInkMode }) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [loadingAdviceId, setLoadingAdviceId] = useState<string | null>(null);
  const [adviceCache, setAdviceCache] = useState<Record<string, StepAdvice>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const toggleStep = (stepId: string) => {
    const updatedSteps = project.steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const completedCount = updatedSteps.filter(s => s.isCompleted).length;
    const progress = Math.round((completedCount / updatedSteps.length) * 100);
    onUpdateProject({ ...project, steps: updatedSteps, progress });
  };

  const handleGetAdvice = async (step: Step) => {
    if (selectedStepId === step.id) {
      setSelectedStepId(null);
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setSelectedStepId(step.id);
    if (adviceCache[step.id]) return;
    setLoadingAdviceId(step.id);
    try {
      const advice = await getStepDetails(step.title, project.description, project.language);
      setAdviceCache(prev => ({ ...prev, [step.id]: advice }));
    } catch (error) {
      console.error("Failed to get advice", error);
    } finally {
      setLoadingAdviceId(null);
    }
  };

  const handleSpeech = async (text: string) => {
      if (isSpeaking) { stopSpeech(); setIsSpeaking(false); return; }
      setIsSpeaking(true);
      try { await generateSpeech(text); } catch (err) { console.error("Speech error", err); } 
      finally { setIsSpeaking(false); }
  };

  const getCategoryIcon = (category: string) => {
      switch(category) {
          case 'gaming': return <GamepadIcon className="w-4 h-4" />;
          case 'workflow': return <GithubIcon className="w-4 h-4" />;
          case 'products': return <BoxIcon className="w-4 h-4" />;
          case 'marketing': return <DiscordIcon className="w-4 h-4" />;
          case 'design': return <SparklesIcon className="w-4 h-4" />;
          case 'shipping': return <TruckIcon className="w-4 h-4" />;
          case 'payments': return <CreditCardIcon className="w-4 h-4" />;
          case 'analytics': return <ChartBarIcon className="w-4 h-4" />;
          case 'automation': return <BoltIcon className="w-4 h-4" />;
          default: return <TagIcon className="w-4 h-4" />;
      }
  };

  const filteredSteps = filterCategory 
    ? project.steps.filter(s => s.category === filterCategory || s.title.toLowerCase().includes(filterCategory.toLowerCase()))
    : project.steps;

  const currentAdvice = selectedStepId ? adviceCache[selectedStepId] : null;
  const isGaming = project.ventureType === 'gaming';

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden relative">
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${selectedStepId ? 'hidden lg:block' : ''}`}>
        
        {/* Project Header */}
        <section className="mb-10 bg-[#0F0F10] rounded-[2.5rem] border border-[#1F1F21] overflow-hidden">
            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isGaming ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/20' : 'bg-green-900/40 text-green-400 border border-green-500/20'}`}>
                                {isGaming ? 'Aether Moor Games' : 'Enterprise Merchant'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-gray-900 text-gray-500 border border-gray-800">
                                Lumo Security Active
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">{project.name}</h2>
                        <p className="text-gray-500 mt-3 max-w-xl font-medium leading-relaxed italic">"{project.description}"</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 text-xs font-black px-6 py-3 rounded-2xl bg-[#1F1F21] text-gray-400 border border-[#27272A] hover:text-white transition-all">
                        <SettingsIcon className="w-4 h-4" /> CONFIGURE VENTURE
                    </button>
                </div>

                <div className="pt-8 border-t border-[#1F1F21]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Venture Deployment Progress</span>
                        <span className="text-sm font-black text-[#008060]">{project.progress}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden p-1 border border-[#1F1F21]">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isGaming ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-[#008060] shadow-[0_0_15px_rgba(0,128,96,0.4)]'}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>

        {/* Action Items */}
        <div className="space-y-4 max-w-4xl pb-24">
          <div className="flex items-center justify-between px-2 mb-6">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Strategic Action List</h3>
            <span className="text-[10px] font-bold text-gray-500">{filteredSteps.length} Items Pending</span>
          </div>
          
          {filteredSteps.map((step) => (
            <article 
              key={step.id} 
              className={`group rounded-3xl border transition-all duration-500 ${selectedStepId === step.id ? 'bg-[#161618] border-[#008060]' : 'bg-[#0F0F10] border-[#1F1F21] hover:border-[#27272A]'}`}
            >
              <div className="p-6 flex items-center gap-6">
                <button 
                    onClick={() => toggleStep(step.id)} 
                    className={`flex-shrink-0 transition-all ${step.isCompleted ? 'text-[#008060]' : 'text-gray-800 hover:text-gray-700'}`}
                >
                  <CheckCircleIcon className="w-12 h-12" checked={step.isCompleted} />
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleGetAdvice(step)}>
                  <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-black text-gray-500 border border-gray-900">
                          {getCategoryIcon(step.category)}
                          {step.category}
                      </span>
                      {step.estimatedTime && <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{step.estimatedTime}</span>}
                  </div>
                  <h3 className={`font-black text-lg ${step.isCompleted ? 'text-gray-700 line-through' : 'text-white'}`}>{step.title}</h3>
                </div>
                <button 
                  onClick={() => handleGetAdvice(step)} 
                  className={`p-3 rounded-2xl transition-all ${selectedStepId === step.id ? 'bg-[#008060] text-white' : 'text-gray-600 hover:bg-[#1F1F21] hover:text-white'}`}
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Advice Panel - Personalized Architect Style */}
      {selectedStepId && (
        <aside className="w-full lg:w-[550px] bg-[#0F0F10] border-l border-[#1F1F21] absolute inset-0 lg:static z-40 flex flex-col animate-slide-in-right">
            <div className="p-8 border-b border-[#1F1F21] flex items-center justify-between sticky top-0 bg-[#0F0F10]/90 backdrop-blur-xl z-10">
                <div>
                    <span className="text-[10px] font-black text-[#008060] uppercase tracking-widest">Architect Guidance</span>
                    <h3 className="font-black text-2xl text-white tracking-tighter">Strategic Intelligence</h3>
                </div>
                <div className="flex items-center gap-2">
                    {currentAdvice && (
                        <button 
                            onClick={() => handleSpeech(currentAdvice.detailedInstructions)}
                            className={`p-3 rounded-2xl transition-all ${isSpeaking ? 'bg-green-900/40 text-[#008060]' : 'text-gray-500 hover:bg-[#1F1F21]'}`}
                        >
                            {isSpeaking ? <SpeakerWaveIcon className="w-6 h-6 animate-pulse" /> : <SpeakerIcon className="w-6 h-6" />}
                        </button>
                    )}
                    <button onClick={() => { setSelectedStepId(null); stopSpeech(); setIsSpeaking(false); }} className="p-3 text-gray-500 hover:bg-[#1F1F21] rounded-2xl transition-all"><XIcon className="w-6 h-6" /></button>
                </div>
            </div>
            
            <div className="p-10 overflow-y-auto">
                {loadingAdviceId === selectedStepId ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-6">
                        <div className="w-16 h-16 border-4 border-gray-900 border-t-[#008060] rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Processing Intelligence...</p>
                    </div>
                ) : currentAdvice ? (
                    <div className="space-y-12 pb-12">
                        <div className="p-8 rounded-[2rem] bg-indigo-950/20 border border-indigo-500/20 shadow-2xl shadow-indigo-900/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-indigo-400">Personal Architect's Analysis</h4>
                            <p className="text-base leading-relaxed font-bold text-indigo-100">{currentAdvice.whyItMatters}</p>
                        </div>
                        
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-white flex items-center gap-4 tracking-tighter">
                              <div className="w-3 h-3 bg-[#008060] rounded-full shadow-[0_0_10px_#008060]"></div>
                              Implementation Protocol
                            </h4>
                            <div className="text-gray-400 text-sm leading-relaxed space-y-6 font-medium" dangerouslySetInnerHTML={{ __html: currentAdvice.detailedInstructions.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>').replace(/\n/g, '<br />') }} />
                        </div>

                        {currentAdvice.suggestedExternalTool && (
                            <div className="p-8 rounded-[2.5rem] bg-white text-black shadow-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                                        <BoltIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Orchestration Action</span>
                                </div>
                                <h5 className="font-black text-xl mb-3 tracking-tighter">Launch {currentAdvice.suggestedExternalTool.name}</h5>
                                <p className="text-sm text-gray-600 mb-8 font-medium">Continue this phase of the workflow via the official {currentAdvice.suggestedExternalTool.type} interface.</p>
                                <a href={currentAdvice.suggestedExternalTool.url} target="_blank" rel="noopener noreferrer" className="block w-full py-5 text-center font-black text-sm bg-black text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                                    INITIALIZE HANDOFF
                                </a>
                            </div>
                        )}

                        <div className="pt-12 border-t border-[#1F1F21]">
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6">Critical Risk Factors</h4>
                          <div className="space-y-4">
                            {currentAdvice.commonPitfalls.map((p, idx) => (
                              <div key={idx} className="flex gap-4 text-sm text-gray-500 font-bold">
                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-red-500">!</div>
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
      )}
    </div>
  );
};
