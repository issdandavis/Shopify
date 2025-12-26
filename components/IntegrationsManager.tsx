import React, { useState } from 'react';
import { Project, IntegrationConfig, IntegrationSettings } from '../types.ts';
import { ProtonIcon, ZapierIcon, NotionIcon, LinkIcon, LockIcon, XIcon, CheckCircleIcon, SparklesIcon, BoltIcon, InfoIcon } from './Icons.tsx';
import { protonService } from '../services/integrations/protonmail.ts';
import { zapierService } from '../services/integrations/zapier.ts';
import { notionService } from '../services/integrations/notion.ts';

interface IntegrationsManagerProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  isEInkMode?: boolean;
}

export const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ project, onUpdateProject, isEInkMode }) => {
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, boolean>>({});

  const integrations = project.integrations || {
    proton: { isActive: false },
    zapier: { isActive: false },
    notion: { isActive: false }
  };

  const updateConfig = (key: keyof IntegrationSettings, fields: Partial<IntegrationConfig>) => {
    const updatedIntegrations = {
      ...integrations,
      [key]: { ...integrations[key], ...fields }
    };
    onUpdateProject({ ...project, integrations: updatedIntegrations });
  };

  const testConnection = async (key: keyof IntegrationSettings) => {
    setTesting(key);
    let success = false;
    const config = integrations[key];
    
    if (key === 'proton') success = await protonService.testConnection(config);
    if (key === 'zapier') success = await zapierService.testConnection(config);
    if (key === 'notion') success = await notionService.testConnection(config);
    
    setTestResult(prev => ({ ...prev, [key]: success }));
    setTesting(null);
    if (success) updateConfig(key, { lastSync: Date.now() });
  };

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">Professional Services</h2>
        <p className="text-sm text-gray-400">Scale your operations with secure email, automation, and documentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {/* Proton Mail Card */}
        <section className={`p-8 bg-white rounded-[32px] border transition-all ${isEInkMode ? 'border-4 border-black shadow-none' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#6D4AFF]">
                <ProtonIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Proton Mail</h3>
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Secure Business Email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={integrations.proton.isActive} onChange={(e) => updateConfig('proton', { isActive: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6D4AFF]"></div>
            </label>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bridge API Endpoint</label>
              <input 
                type="text" 
                value={integrations.proton.endpoint || ''} 
                onChange={(e) => updateConfig('proton', { endpoint: e.target.value })}
                placeholder="https://localhost:1143/v1"
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition-all ${isEInkMode ? 'border-2 border-black' : 'border-gray-100'}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bridge Key</label>
              <input 
                type="password" 
                value={integrations.proton.apiKey || ''} 
                onChange={(e) => updateConfig('proton', { apiKey: e.target.value })}
                placeholder="pm_..."
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition-all ${isEInkMode ? 'border-2 border-black' : 'border-gray-100'}`}
              />
            </div>
          </div>

          <button 
            onClick={() => testConnection('proton')}
            disabled={testing === 'proton'}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${testResult.proton ? 'bg-green-50 text-green-700' : 'bg-gray-900 text-white'}`}
          >
            {testing === 'proton' ? 'Connecting...' : testResult.proton ? <><CheckCircleIcon className="w-4 h-4" checked /> Connected</> : <><LockIcon className="w-4 h-4" /> Secure Connection</>}
          </button>
        </section>

        {/* Zapier Card */}
        <section className={`p-8 bg-white rounded-[32px] border transition-all ${isEInkMode ? 'border-4 border-black shadow-none' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF4F00]">
                <ZapierIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Zapier</h3>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Workflow Automation</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={integrations.zapier.isActive} onChange={(e) => updateConfig('zapier', { isActive: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4F00]"></div>
            </label>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Webhook URL</label>
              <input 
                type="text" 
                value={integrations.zapier.endpoint || ''} 
                onChange={(e) => updateConfig('zapier', { endpoint: e.target.value })}
                placeholder="https://hooks.zapier.com/..."
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-orange-200 outline-none transition-all ${isEInkMode ? 'border-2 border-black' : 'border-gray-100'}`}
              />
            </div>
          </div>

          <button 
            onClick={() => testConnection('zapier')}
            disabled={testing === 'zapier'}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${testResult.zapier ? 'bg-green-50 text-green-700' : 'bg-gray-900 text-white'}`}
          >
            {testing === 'zapier' ? 'Verifying...' : testResult.zapier ? <><CheckCircleIcon className="w-4 h-4" checked /> Verified Hook</> : <><LinkIcon className="w-4 h-4" /> Link Webhook</>}
          </button>
        </section>

        {/* Notion Card */}
        <section className={`p-8 bg-white rounded-[32px] border transition-all lg:col-span-2 ${isEInkMode ? 'border-4 border-black shadow-none' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900">
                <NotionIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Notion Workspace</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inventory & CRM Documentation</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={integrations.notion.isActive} onChange={(e) => updateConfig('notion', { isActive: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Integration Token</label>
              <input 
                type="password" 
                value={integrations.notion.apiKey || ''} 
                onChange={(e) => updateConfig('notion', { apiKey: e.target.value })}
                placeholder="secret_..."
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-gray-200 outline-none transition-all ${isEInkMode ? 'border-2 border-black' : 'border-gray-100'}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Database ID</label>
              <input 
                type="text" 
                value={integrations.notion.databaseId || ''} 
                onChange={(e) => updateConfig('notion', { databaseId: e.target.value })}
                placeholder="32-char hex string"
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-gray-200 outline-none transition-all ${isEInkMode ? 'border-2 border-black' : 'border-gray-100'}`}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => testConnection('notion')}
              disabled={testing === 'notion'}
              className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${testResult.notion ? 'bg-green-50 text-green-700' : 'bg-gray-900 text-white'}`}
            >
              {testing === 'notion' ? 'Connecting...' : testResult.notion ? <><CheckCircleIcon className="w-4 h-4" checked /> Workspace Linked</> : <><LinkIcon className="w-4 h-4" /> Connect Workspace</>}
            </button>
            <button className={`px-8 py-4 rounded-xl font-black text-sm border-2 transition-all ${isEInkMode ? 'border-black' : 'border-gray-100 hover:bg-gray-50'}`}>
              Sync Database
            </button>
          </div>
        </section>
      </div>

      {/* Templates & Guides */}
      <div className="space-y-6">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Integration Blueprints</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
          <div className={`p-6 rounded-3xl border ${isEInkMode ? 'border-2 border-black' : 'bg-purple-50/30 border-purple-100 shadow-sm'}`}>
            <SparklesIcon className="w-6 h-6 text-[#6D4AFF] mb-4" />
            <h5 className="font-black text-sm mb-2">Secure Email Campaigns</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">Sync customer segments to Proton Mail for ultra-secure encrypted newsletters.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${isEInkMode ? 'border-2 border-black' : 'bg-orange-50/30 border-orange-100 shadow-sm'}`}>
            <BoltIcon className="w-6 h-6 text-[#FF4F00] mb-4" />
            <h5 className="font-black text-sm mb-2">Automated Fulfillment</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">Trigger Zapier on "Order Created" to notify custom manufacturing Slack channels.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${isEInkMode ? 'border-2 border-black' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
            <NotionIcon className="w-6 h-6 text-gray-900 mb-4" />
            <h5 className="font-black text-sm mb-2">Inventory Master Wiki</h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">Auto-sync products to Notion databases for collaborative planning and notes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};