
import React from 'react';
import { Project, MarketingConfig } from '../types.ts';
import { MegaphoneIcon, InboxIcon, SparklesIcon, ChartBarIcon, TagIcon, BoltIcon, PlusIcon } from './Icons.tsx';

interface MarketingHubProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
}

export const MarketingHub: React.FC<MarketingHubProps> = ({ project, onUpdateProject }) => {
  const config = project.marketing || {
    klaviyoActive: false,
    mailchimpActive: false,
    smsMarketing: false,
    automationFlows: { abandonedCart: false, postPurchase: false, winBack: false },
    ugcEnabled: false
  };

  const update = (fields: Partial<MarketingConfig>) => {
    onUpdateProject({ ...project, marketing: { ...config, ...fields } });
  };

  const updateFlow = (flow: keyof MarketingConfig['automationFlows']) => {
    update({ automationFlows: { ...config.automationFlows, [flow]: !config.automationFlows[flow] } });
  };

  return (
    <div className="p-8 animate-fade-in space-y-10 overflow-y-auto h-full pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Marketing Ops Hub</h2>
          <p className="text-gray-500 font-medium">Orchestrate multi-channel acquisition and retention sub-systems.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
          <ChartBarIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Attribution Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Klaviyo / Email Card */}
        <section className="xl:col-span-1 p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem]">
          <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
            <InboxIcon className="w-6 h-6" />
          </div>
          <h3 className="font-black text-lg text-white mb-2">Email Automations</h3>
          <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed">Deep integration with Klaviyo for behavioral triggers and retention flows.</p>
          
          <div className="space-y-3 mb-8">
            {['abandonedCart', 'postPurchase', 'winBack'].map((flow) => (
              <button
                key={flow}
                onClick={() => updateFlow(flow as any)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${config.automationFlows[flow as keyof typeof config.automationFlows] ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'bg-black/40 border-[#1F1F21] text-gray-600 hover:border-gray-700'}`}
              >
                <span className="text-xs font-black uppercase tracking-widest">{flow.replace(/([A-Z])/g, ' $1')}</span>
                {config.automationFlows[flow as keyof typeof config.automationFlows] ? <BoltIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4 opacity-30" />}
              </button>
            ))}
          </div>

          <button className="w-full py-4 bg-purple-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-900/20">
            SYNC SEGMENTS
          </button>
        </section>

        {/* SMS & UGC */}
        <section className="xl:col-span-2 space-y-8">
          <div className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-white">SMS Marketing</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Direct merchant-to-customer communication sub-system.</p>
            </div>
            <button 
              onClick={() => update({ smsMarketing: !config.smsMarketing })}
              className={`px-8 py-3 rounded-xl font-black text-[10px] transition-all ${config.smsMarketing ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {config.smsMarketing ? 'ACTIVE' : 'INITIALIZE'}
            </button>
          </div>

          <div className="p-8 bg-gradient-to-br from-green-900/10 to-blue-900/10 border border-green-500/20 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <TagIcon className="w-5 h-5 text-green-400" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest leading-none">UGC Engine</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter">Automated Social Proof</h3>
                <p className="text-gray-400 text-sm mt-3 max-w-md font-medium leading-relaxed">Auto-request reviews and User Generated Content 7 days after fulfillment. Sync directly to your storefront.</p>
                <button 
                  onClick={() => update({ ugcEnabled: !config.ugcEnabled })}
                  className={`mt-6 px-8 py-3 bg-white text-black font-black text-[10px] rounded-xl hover:scale-105 transition-all shadow-xl`}
                >
                  {config.ugcEnabled ? 'CONFIGURING PROTOCOL...' : 'LAUNCH CAMPAIGN'}
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 opacity-10">
                <MegaphoneIcon className="w-64 h-64 text-green-500" />
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
