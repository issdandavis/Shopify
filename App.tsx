
import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { generateProjectPlan } from './services/geminiService.ts';
import { Project, Step, VentureType } from './types.ts';
import { StepList } from './components/StepList.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { MobilePreview } from './components/MobilePreview.tsx';
import { ShippingStudio } from './components/ShippingStudio.tsx';
import { IntegrationsManager } from './components/IntegrationsManager.tsx';
import { PricingStudio } from './components/PricingStudio.tsx';
import { WholesaleManager } from './components/WholesaleManager.tsx';
import { PaymentWizard } from './components/PaymentWizard.tsx';
import { MarketingHub } from './components/MarketingHub.tsx';
import { AutomationCenter } from './components/AutomationCenter.tsx';
import { ProductBundler } from './components/ProductBundler.tsx';
import { MarketInsights } from './components/MarketInsights.tsx';

import { 
  PlusIcon, SparklesIcon, TrashIcon, GlobeIcon, TagIcon, MicrophoneIcon, 
  ChartBarIcon, LanguageIcon, BoltIcon, BoxIcon, MenuIcon, XIcon, 
  DevicePhoneIcon, InfoIcon, CheckCircleIcon, TruckIcon, LinkIcon, 
  CreditCardIcon, GithubIcon, GamepadIcon, TerminalIcon, LumoIcon,
  NotionIcon, DiscordIcon, MegaphoneIcon, InboxIcon, ShieldCheckIcon
} from './components/Icons.tsx';
import { ChatWidget } from './components/ChatWidget.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Toast, ToastMessage, ToastType } from './components/Toast.tsx';
import { loadProjects, saveProjects, loadPrefs, savePrefs } from './services/storageService.ts';

const generateId = () => Math.random().toString(36).substring(2, 9);

const AppContent = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isEInkMode, setIsEInkMode] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [view, setView] = useState<'roadmap' | 'analytics' | 'mobile_preview' | 'shipping' | 'integrations' | 'pricing' | 'wholesale' | 'payments' | 'marketing' | 'automations' | 'bundles' | 'insights'>('roadmap');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const storedProjects = loadProjects();
    const prefs = loadPrefs();
    setProjects(storedProjects);
    setIsEInkMode(prefs.isEInkMode);
    setSelectedLanguage(prefs.language);
    
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                if (transcript.includes('hey issac') || transcript.includes('hey isaac')) {
                    addToast("Architect is listening...", "info");
                }
            };
            recognition.start();
        }
    }

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    saveProjects(projects);
    savePrefs({
      language: selectedLanguage,
      isEInkMode: isEInkMode,
      onboardingCompleted: true
    });
  }, [projects, selectedLanguage, isEInkMode]);

  const addToast = (text: string, type: ToastType = 'info', onUndo?: () => void) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, text, type, onUndo }]);
  };

  const handleAiNavigation = (action: string, target?: string) => {
    switch (action) {
      case 'switch_project':
        if (target) {
          const fuse = new Fuse(projects, { keys: ['name'], threshold: 0.4 });
          const results = fuse.search(target);
          if (results.length > 0) setActiveProjectId(results[0].item.id);
        }
        break;
      case 'filter_steps': setFilterCategory(target || null); break;
      case 'show_analytics': setView('analytics'); break;
      case 'show_dashboard': setView('roadmap'); break;
      case 'show_mobile_preview': setView('mobile_preview'); break;
      case 'show_shipping_studio': setView('shipping'); break;
      case 'show_integrations': setView('integrations'); break;
      case 'show_pricing': setView('pricing'); break;
      case 'show_wholesale': setView('wholesale'); break;
      case 'show_payments': setView('payments'); break;
      case 'show_marketing': setView('marketing'); break;
      case 'show_automations': setView('automations'); break;
      case 'show_bundles': setView('bundles'); break;
      case 'show_insights': setView('insights'); break;
      case 'open_sidebar': setIsSidebarOpen(true); break;
      case 'close_sidebar': setIsSidebarOpen(false); break;
      case 'create_new': setActiveProjectId(null); setView('roadmap'); break;
      case 'toggle_kindle_mode': setIsEInkMode(!isEInkMode); break;
    }
  };

  const createProjectFromPrompt = async (prompt: string) => {
    if (!isOnline) { addToast("Connection lost", "error"); return; }
    setIsGenerating(true);
    setIsSidebarOpen(false);
    
    try {
      const plan = await generateProjectPlan(prompt, selectedLanguage);
      let vType: VentureType = 'commerce';
      const pLow = prompt.toLowerCase();
      if (pLow.includes('drop')) vType = 'dropshipping';
      else if (pLow.includes('stock') || pLow.includes('invent')) vType = 'inventory';
      else if (pLow.includes('game')) vType = 'gaming';

      const newProject: Project = {
        id: generateId(),
        name: plan.projectName,
        description: plan.projectDescription,
        ventureType: vType,
        createdAt: Date.now(),
        progress: 0,
        feasibilityScore: plan.feasibilityScore,
        language: selectedLanguage,
        steps: plan.steps.map(s => ({
          id: generateId(),
          title: s.title,
          description: s.description,
          category: s.category as any,
          estimatedTime: s.estimatedTime,
          isCompleted: false,
          deepLink: s.deepLink,
          externalLink: s.externalLink
        }))
      };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setView('roadmap');
      setUserInput('');
      addToast(`${vType.toUpperCase()} ARCHITECT LOADED`, "success");
    } catch (error) {
      console.error(error);
      addToast("Strategic failure. Reset and retry.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return;

    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);

    addToast(`Deleted "${projectToDelete.name}"`, "undo", () => {
      setProjects(prev => [projectToDelete, ...prev]);
      setActiveProjectId(projectToDelete.id);
    });
  };

  const updateActiveProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className={`flex h-screen bg-[#0A0A0B] text-[#E4E4E7] overflow-hidden relative ${isEInkMode ? 'grayscale invert' : ''}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#0F0F10] border-r border-[#1F1F21] flex-shrink-0 flex flex-col transform transition-all duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col gap-4 border-b border-[#1F1F21]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#008060] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20 flex-shrink-0">
                    <LumoIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                    <span className="block font-black text-sm tracking-tight text-white uppercase truncate">Issac Davis</span>
                    <span className="text-[10px] text-[#008060] font-black uppercase tracking-[0.2em] block">Business Architect</span>
                </div>
            </div>
            
            <div className="flex bg-[#161618] rounded-xl p-1 border border-[#1F1F21]">
                <button 
                  onClick={() => { setView('roadmap'); setIsSidebarOpen(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 h-[40px] text-[10px] font-black rounded-lg transition-all ${view === 'roadmap' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <BoltIcon className="w-3 h-3" /> ROADMAP
                </button>
                <button 
                  onClick={() => { setView('analytics'); setIsSidebarOpen(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 h-[40px] text-[10px] font-black rounded-lg transition-all ${view === 'analytics' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <ChartBarIcon className="w-3 h-3" /> INTEL
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-8 scrollbar-hide">
          <div className="px-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Strategic Intelligence</span>
            <div className="space-y-1">
                <button onClick={() => { setView('insights'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === 'insights' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <GlobeIcon className="w-4 h-4 text-blue-500" /> <span className="text-xs font-bold">Market Recon</span>
                </button>
                <button onClick={() => { setView('pricing'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === 'pricing' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <TagIcon className="w-4 h-4 text-purple-500" /> <span className="text-xs font-bold">Pricing Lab</span>
                </button>
            </div>
          </div>

          <div className="px-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Store Sub-Systems</span>
            <div className="space-y-1">
                {[
                  { id: 'payments', icon: <CreditCardIcon />, label: 'Payments' },
                  { id: 'marketing', icon: <MegaphoneIcon />, label: 'Marketing' },
                  { id: 'bundles', icon: <BoxIcon />, label: 'Bundling' },
                  { id: 'automations', icon: <BoltIcon />, label: 'Automation' },
                ].map(item => (
                  <button key={item.id} onClick={() => { setView(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === item.id ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <div className="w-4 h-4">{item.icon}</div> <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="px-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Operations</span>
            <div className="space-y-1">
                <button onClick={() => { setView('wholesale'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === 'wholesale' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <PlusIcon className="w-4 h-4 rotate-45" /> <span className="text-xs font-bold">Sourcing Hub</span>
                </button>
                <button onClick={() => { setView('shipping'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === 'shipping' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <TruckIcon className="w-4 h-4" /> <span className="text-xs font-bold">Logistics AI</span>
                </button>
                <button onClick={() => { setView('integrations'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all ${view === 'integrations' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <GithubIcon className="w-4 h-4" /> <span className="text-xs font-bold">Workflow Architect</span>
                </button>
            </div>
          </div>

          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Ventures</span>
                <button onClick={() => { setActiveProjectId(null); setIsSidebarOpen(false); }} className="p-2 h-[40px] w-[40px] flex items-center justify-center hover:bg-[#1F1F21] rounded text-green-500"><PlusIcon className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1">
                {projects.map(p => (
                    <div key={p.id} className="group relative">
                      <button 
                          onClick={() => { setActiveProjectId(p.id); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 p-3 h-[48px] rounded-xl transition-all text-left ${activeProjectId === p.id ? 'bg-[#008060]/10 border border-[#008060]/30 text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}
                      >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.ventureType === 'gaming' ? 'bg-indigo-500' : p.ventureType === 'dropshipping' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                          <span className="text-xs font-bold truncate pr-6">{p.name}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-[32px] w-[32px] flex items-center justify-center text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 md:opacity-0 transition-all focus:opacity-100"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[#1F1F21] space-y-3">
            <button onClick={() => setIsTerminalMode(!isTerminalMode)} className="flex items-center justify-center h-[48px] gap-3 w-full rounded-xl text-xs font-black bg-[#161618] hover:bg-[#1F1F21] text-gray-300 transition-all border border-[#1F1F21]">
                <TerminalIcon className="w-4 h-4" /> TERMINAL_UI v3.1
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B] overflow-hidden">
        <header className="flex items-center justify-between p-4 md:p-6 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-[#1F1F21] sticky top-0 z-10 transition-all h-[64px] md:h-[80px]">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 h-[44px] w-[44px] flex items-center justify-center text-gray-400 hover:text-white"><MenuIcon className="w-6 h-6" /></button>
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:inline">Active Workspace:</span>
                    <span className="text-[10px] font-black text-white px-2 py-0.5 bg-[#1F1F21] rounded-md uppercase truncate max-w-[120px] md:max-w-none">{activeProject ? activeProject.name : 'Unassigned'}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => setIsEInkMode(!isEInkMode)} className="p-2 h-[44px] w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"><DevicePhoneIcon className="w-5 h-5" /></button>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {isTerminalMode && (
            <div className="absolute inset-0 z-50 bg-[#000] p-6 md:p-8 font-mono text-green-500 animate-fade-in flex flex-col">
                <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-green-900 pb-4">
                    <span className="text-xs md:text-sm font-black">ISSAC_TERMINAL_V3.1_PRODUCTION</span>
                    <button onClick={() => setIsTerminalMode(false)} className="text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-black px-3 py-1.5 h-[32px] flex items-center">HALT_PROCESS [X]</button>
                </div>
                <div className="space-y-1 text-[10px] md:text-xs overflow-y-auto flex-1 custom-scrollbar">
                    <div>> INITIALIZING LUMO_SECURE_KERNEL... OK</div>
                    <div>> VERIFYING STRIPE_WEBHOOKS... ACTIVE</div>
                    <div>> SYNCING KLAVIYO_AUDIENCE... 1,240 RECORDS OK</div>
                    <div>> BRIDGE: ISSAC_DAVIS -> AETHER_MOOR_CORE... LINKED</div>
                    <div className="pt-6 text-white animate-pulse">_ EXECUTE_COMMAND_</div>
                </div>
                <input autoFocus className="w-full h-[44px] bg-transparent border-none outline-none text-green-400 mt-6 font-mono text-sm" placeholder="ISSAC_ROOT > " />
            </div>
          )}

          <div className="flex-1 overflow-y-auto h-full">
            {view === 'analytics' ? (
              <AnalyticsDashboard isEInkMode={isEInkMode} />
            ) : view === 'insights' ? (
              activeProject ? <MarketInsights project={activeProject} /> : <NoProjectSelected />
            ) : view === 'payments' ? (
              activeProject ? <PaymentWizard project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : view === 'marketing' ? (
              activeProject ? <MarketingHub project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : view === 'automations' ? (
              activeProject ? <AutomationCenter project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : view === 'bundles' ? (
              activeProject ? <ProductBundler project={activeProject} /> : <NoProjectSelected />
            ) : view === 'integrations' ? (
              activeProject ? (
                <IntegrationsManager project={activeProject} onUpdateProject={updateActiveProject} />
              ) : <NoProjectSelected />
            ) : view === 'wholesale' ? (
              activeProject ? <WholesaleManager project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : view === 'pricing' ? (
              activeProject ? <PricingStudio project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : view === 'shipping' ? (
              activeProject ? <ShippingStudio project={activeProject} onUpdateProject={updateActiveProject} /> : <NoProjectSelected />
            ) : activeProject ? (
              <StepList project={activeProject} onUpdateProject={updateActiveProject} filterCategory={filterCategory} isEInkMode={isEInkMode} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 md:p-6 h-full">
                <div className="max-w-3xl w-full text-center py-10">
                    <div className="flex justify-center mb-8 md:mb-10">
                      <div className="p-6 md:p-8 bg-[#008060]/10 text-[#008060] rounded-[2rem] md:rounded-[3rem] border border-[#008060]/20 animate-pulse shadow-2xl shadow-green-900/20">
                        <LumoIcon className="w-12 h-12 md:w-20 md:h-20" />
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-8xl font-black mb-6 md:mb-8 leading-tight text-white tracking-tighter uppercase">Architect.</h1>
                    <p className="text-gray-500 mb-10 md:mb-14 max-w-xl mx-auto text-base md:text-xl font-medium leading-relaxed px-4">Strategic orchestration for the modern merchant. High-agency automation for Aether Moor Games and global commerce.</p>
                    
                    <form onSubmit={(e) => { e.preventDefault(); createProjectFromPrompt(userInput); }} className="mx-4 md:mx-0 flex flex-col sm:flex-row gap-3 p-3 md:p-4 bg-[#161618] rounded-[2rem] md:rounded-[2.5rem] border-2 border-[#1F1F21] focus-within:border-[#008060] transition-all shadow-2xl group">
                        <input 
                          type="text" 
                          value={userInput} 
                          onChange={(e) => setUserInput(e.target.value)} 
                          placeholder="INIT_SEQUENCE: (e.g. Merch Launch)" 
                          className="flex-1 px-6 md:px-8 py-3 md:py-5 h-[54px] md:h-auto bg-transparent outline-none text-sm md:text-lg font-black text-white placeholder:text-gray-800 uppercase tracking-widest" 
                          disabled={isGenerating}
                        />
                        <button 
                          type="submit" 
                          disabled={isGenerating || !userInput.trim()} 
                          className="h-[54px] px-8 md:px-12 py-3 md:py-5 bg-[#008060] text-white font-black rounded-2xl md:rounded-3xl hover:bg-[#006e52] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-green-900/40 active:scale-95"
                        >
                          {isGenerating ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'EXECUTE_INTENT'}
                        </button>
                    </form>

                    <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                      {[
                        { icon: <CreditCardIcon />, label: 'Payment Ops' },
                        { icon: <MegaphoneIcon />, label: 'Marketing Hub' },
                        { icon: <LumoIcon />, label: 'Privacy Kernel' },
                        { icon: <BoltIcon />, label: 'Auto-Architect' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 md:gap-3 opacity-20 hover:opacity-100 transition-all cursor-default">
                          <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center text-white">{item.icon}</div>
                          <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white text-center">{item.label}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget onNavigate={handleAiNavigation} />
      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

const NoProjectSelected = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-[#161618] rounded-[1.5rem] md:rounded-[2rem] border border-[#1F1F21] flex items-center justify-center text-gray-800 mb-6 md:mb-8">
          <GamepadIcon className="w-8 h-8 md:w-12 md:h-12" />
        </div>
        <h3 className="text-lg md:text-2xl font-black text-white mb-2 md:mb-3 tracking-tighter uppercase">Venture Hub</h3>
        <p className="text-gray-500 max-w-xs font-medium leading-relaxed text-xs md:text-base">Select a project from the left navigation or initialize a new roadmap sequence from the central dashboard.</p>
    </div>
);

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
