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
  // Persistence initialization
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isEInkMode, setIsEInkMode] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [view, setView] = useState<'roadmap' | 'analytics' | 'mobile_preview' | 'shipping' | 'integrations' | 'pricing' | 'wholesale' | 'payments' | 'marketing' | 'automations' | 'bundles'>('roadmap');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Load data on mount
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

  // Save data on change
  useEffect(() => {
    saveProjects(projects);
    savePrefs({
      language: selectedLanguage,
      isEInkMode: isEInkMode,
      onboardingCompleted: true
    });
  }, [projects, selectedLanguage, isEInkMode]);

  const addToast = (text: string, type: ToastType = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, text, type }]);
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
      
      // Auto-detect Venture Type based on intent
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

  const updateActiveProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const isGaming = activeProject?.ventureType === 'gaming';

  return (
    <div className={`flex h-screen bg-[#0A0A0B] text-[#E4E4E7] overflow-hidden relative ${isEInkMode ? 'grayscale invert' : ''}`}>
      {/* Sidebar - Personal Architect Branded */}
      <nav className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#0F0F10] border-r border-[#1F1F21] flex-shrink-0 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col gap-4 border-b border-[#1F1F21]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#008060] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
                    <LumoIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <span className="block font-black text-sm tracking-tight text-white uppercase">Issac Davis</span>
                    <span className="text-[10px] text-[#008060] font-black uppercase tracking-[0.2em]">Business Architect</span>
                </div>
            </div>
            
            <div className="flex bg-[#161618] rounded-xl p-1 border border-[#1F1F21]">
                <button 
                  onClick={() => setView('roadmap')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all ${view === 'roadmap' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <BoltIcon className="w-3 h-3" /> ROADMAP
                </button>
                <button 
                  onClick={() => setView('analytics')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition-all ${view === 'analytics' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <ChartBarIcon className="w-3 h-3" /> INTEL
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-8 scrollbar-hide">
          <div className="px-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Store Sub-Systems</span>
            <div className="space-y-1">
                <button onClick={() => setView('payments')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'payments' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <CreditCardIcon className="w-4 h-4" /> <span className="text-xs font-bold">Payments</span>
                </button>
                <button onClick={() => setView('marketing')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'marketing' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <MegaphoneIcon className="w-4 h-4" /> <span className="text-xs font-bold">Marketing</span>
                </button>
                <button onClick={() => setView('bundles')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'bundles' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <BoxIcon className="w-4 h-4" /> <span className="text-xs font-bold">Bundling</span>
                </button>
                <button onClick={() => setView('automations')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'automations' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <BoltIcon className="w-4 h-4" /> <span className="text-xs font-bold">Automation</span>
                </button>
            </div>
          </div>

          <div className="px-6">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Operations</span>
            <div className="space-y-1">
                <button onClick={() => setView('wholesale')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'wholesale' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <PlusIcon className="w-4 h-4 rotate-45" /> <span className="text-xs font-bold">Sourcing Hub</span>
                </button>
                <button onClick={() => setView('shipping')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'shipping' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <TruckIcon className="w-4 h-4" /> <span className="text-xs font-bold">Logistics AI</span>
                </button>
                <button onClick={() => setView('integrations')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === 'integrations' ? 'bg-[#1F1F21] text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}>
                    <GithubIcon className="w-4 h-4" /> <span className="text-xs font-bold">Workflow Architect</span>
                </button>
            </div>
          </div>

          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Ventures</span>
                <button onClick={() => setActiveProjectId(null)} className="p-1 hover:bg-[#1F1F21] rounded text-green-500"><PlusIcon className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1">
                {projects.map(p => (
                    <button 
                        key={p.id} 
                        onClick={() => { setActiveProjectId(p.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activeProjectId === p.id ? 'bg-[#008060]/10 border border-[#008060]/30 text-white' : 'text-gray-500 hover:text-white hover:bg-[#161618]'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${p.ventureType === 'gaming' ? 'bg-indigo-500' : p.ventureType === 'dropshipping' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <span className="text-xs font-bold truncate">{p.name}</span>
                    </button>
                ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[#1F1F21] space-y-3">
            <button onClick={() => setIsTerminalMode(!isTerminalMode)} className="flex items-center gap-3 w-full p-3 rounded-xl text-xs font-black bg-[#161618] hover:bg-[#1F1F21] text-gray-300 transition-all border border-[#1F1F21]">
                <TerminalIcon className="w-4 h-4" /> TERMINAL_UI v3.1
            </button>
            <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-gray-600 uppercase">Secure Bridge</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#008060]"></div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B]">
        <header className="flex items-center justify-between p-6 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-[#1F1F21] sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400"><MenuIcon /></button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Workspace:</span>
                    <span className="text-xs font-black text-white px-2 py-0.5 bg-[#1F1F21] rounded-md uppercase">{activeProject ? activeProject.name : 'Unassigned'}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-[#161618] rounded-lg p-1 border border-[#1F1F21] hidden sm:flex">
                   <button className="px-3 py-1 text-[10px] font-black text-gray-500 hover:text-white uppercase">Logs</button>
                   <button className="px-3 py-1 text-[10px] font-black text-gray-500 hover:text-white uppercase border-l border-[#1F1F21]">Docs</button>
                </div>
                <button onClick={() => setIsEInkMode(!isEInkMode)} className="p-2 text-gray-400 hover:text-white transition-colors"><DevicePhoneIcon className="w-5 h-5" /></button>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {isTerminalMode && (
            <div className="absolute inset-0 z-50 bg-[#000] p-8 font-mono text-green-500 animate-fade-in">
                <div className="flex justify-between items-center mb-10 border-b border-green-900 pb-4">
                    <span className="text-sm font-black">ISSAC_TERMINAL_V3.1_PRODUCTION</span>
                    <button onClick={() => setIsTerminalMode(false)} className="text-red-500 text-xs font-black hover:bg-red-500 hover:text-black px-2 py-1">HALT_PROCESS [X]</button>
                </div>
                <div className="space-y-1 text-xs overflow-y-auto h-[80%] custom-scrollbar">
                    <div>> INITIALIZING LUMO_SECURE_KERNEL... OK</div>
                    <div>> VERIFYING STRIPE_WEBHOOKS... ACTIVE</div>
                    <div>> SYNCING KLAVIYO_AUDIENCE... 1,240 RECORDS OK</div>
                    <div>> BRIDGE: ISSAC_DAVIS -> AETHER_MOOR_CORE... LINKED</div>
                    <div className="pt-6 text-white animate-pulse">_ EXECUTE_COMMAND_</div>
                </div>
                <input autoFocus className="w-full bg-transparent border-none outline-none text-green-400 mt-6 font-mono text-sm" placeholder="ISSAC_ROOT > " />
            </div>
          )}

          {view === 'analytics' ? (
            <AnalyticsDashboard isEInkMode={isEInkMode} />
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
            <div className="flex-1 flex items-center justify-center p-6 h-full">
              <div className="max-w-3xl w-full text-center">
                  <div className="flex justify-center mb-10">
                    <div className="p-8 bg-[#008060]/10 text-[#008060] rounded-[3rem] border border-[#008060]/20 animate-pulse shadow-2xl shadow-green-900/20">
                      <LumoIcon className="w-20 h-20" />
                    </div>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight text-white tracking-tighter uppercase">Architect.</h1>
                  <p className="text-gray-500 mb-14 max-w-xl mx-auto text-xl font-medium leading-relaxed">Strategic orchestration for the modern merchant. High-agency automation for Aether Moor Games and global commerce.</p>
                  
                  <form onSubmit={(e) => { e.preventDefault(); createProjectFromPrompt(userInput); }} className="flex gap-3 p-4 bg-[#161618] rounded-[2.5rem] border-2 border-[#1F1F21] focus-within:border-[#008060] transition-all shadow-2xl group">
                      <input 
                        type="text" 
                        value={userInput} 
                        onChange={(e) => setUserInput(e.target.value)} 
                        placeholder="INIT_SEQUENCE: (e.g. Aether Moor Merch Launch)" 
                        className="flex-1 px-8 py-5 bg-transparent outline-none text-lg font-black text-white placeholder:text-gray-800 uppercase tracking-widest" 
                        disabled={isGenerating}
                      />
                      <button 
                        type="submit" 
                        disabled={isGenerating || !userInput.trim()} 
                        className="px-12 py-5 bg-[#008060] text-white font-black rounded-3xl hover:bg-[#006e52] transition-all disabled:opacity-50 flex items-center gap-4 shadow-xl shadow-green-900/40 active:scale-95"
                      >
                        {isGenerating ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'EXECUTE_INTENT'}
                      </button>
                  </form>

                  <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-10">
                    {[
                      { icon: <CreditCardIcon />, label: 'Payment Ops' },
                      { icon: <MegaphoneIcon />, label: 'Marketing Hub' },
                      { icon: <LumoIcon />, label: 'Privacy Kernel' },
                      { icon: <BoltIcon />, label: 'Auto-Architect' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-all cursor-default">
                        <div className="w-10 h-10 flex items-center justify-center text-white">{item.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{item.label}</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ChatWidget onNavigate={handleAiNavigation} />
      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

const NoProjectSelected = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-fade-in">
        <div className="w-24 h-24 bg-[#161618] rounded-[2rem] border border-[#1F1F21] flex items-center justify-center text-gray-800 mb-8">
          <GamepadIcon className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase">Venture Hub</h3>
        <p className="text-gray-500 max-w-xs font-medium leading-relaxed">Select a project from the left navigation or initialize a new roadmap sequence from the central dashboard.</p>
    </div>
);

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;