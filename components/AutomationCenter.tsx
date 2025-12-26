import React, { useState } from 'react';
import { Project, AutomationFlow } from '../types.ts';
import { BoltIcon, ZapierIcon, PlusIcon, TrashIcon, InfoIcon, TerminalIcon } from './Icons.tsx';

interface AutomationCenterProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
}

export const AutomationCenter: React.FC<AutomationCenterProps> = ({ project, onUpdateProject }) => {
  const flows = project.automations || [];

  const addDefaultFlows = () => {
    const defaultFlows: AutomationFlow[] = [
      { id: 'f1', name: 'Low Stock Trigger', trigger: 'Inventory < 5', action: 'Notify Slack', isActive: true },
      { id: 'f2', name: 'VIP Tagging', trigger: 'Order Value > $200', action: 'Add Tag "VIP"', isActive: true }
    ];
    onUpdateProject({ ...project, automations: [...flows, ...defaultFlows] });
  };

  const toggleFlow = (id: string) => {
    onUpdateProject({ ...project, automations: flows.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f) });
  };

  return (
    <div className="p-8 animate-fade-in space-y-10 overflow-y-auto h-full pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Automation Architect</h2>
          <p className="text-gray-500 font-medium">Manage cross-app logic and custom Shopify Flow protocols.</p>
        </div>
        <button 
          onClick={addDefaultFlows}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all"
        >
          <BoltIcon className="w-4 h-4" /> LOAD TEMPLATES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Automations */}
        <section className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] space-y-6">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
            <TerminalIcon className="w-3 h-3" /> Runtime Protocols
          </h3>
          
          <div className="space-y-4">
            {flows.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-[#1F1F21] rounded-[2rem] text-center text-gray-700 font-bold text-sm italic">
                No active flows. Initialize sub-systems to begin.
              </div>
            ) : (
              flows.map(flow => (
                <div key={flow.id} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-[#1F1F21] group">
                  <div>
                    <h4 className="text-sm font-black text-white">{flow.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Trigger: {flow.trigger} → Action: {flow.action}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleFlow(flow.id)}
                      className={`w-10 h-5 rounded-full relative transition-all ${flow.isActive ? 'bg-indigo-600' : 'bg-gray-800'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${flow.isActive ? 'left-6' : 'left-1'}`}></div>
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Zapier / Flow Bridge */}
        <section className="p-8 bg-gradient-to-br from-orange-600/10 to-orange-900/5 border border-orange-500/20 rounded-[2.5rem]">
          <div className="w-14 h-14 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mb-6">
            <ZapierIcon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter">Zapier Ecosystem</h3>
          <p className="text-gray-400 mt-3 font-medium leading-relaxed">Connect Shopify events to 3,000+ external apps via multi-stage workflows.</p>
          
          <div className="mt-8 space-y-3">
             <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl text-xs font-bold text-gray-500">
                <InfoIcon className="w-4 h-4 text-orange-400" />
                Webhook endpoint verified and active.
             </div>
             <button className="w-full py-4 bg-orange-600 text-white font-black text-sm rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20">
               LAUNCH ZAPIER CONSOLE
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};