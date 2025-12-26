import React, { useState } from 'react';
import { Project, WholesaleConfig } from '../types.ts';
import { BoxIcon, LinkIcon, CheckCircleIcon, PlusIcon, TrashIcon, InfoIcon, ShoppingCartIcon } from './Icons.tsx';

interface WholesaleManagerProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
  isEInkMode?: boolean;
}

export const WholesaleManager: React.FC<WholesaleManagerProps> = ({ project, onUpdateProject, isEInkMode }) => {
  const currentWholesale = project.wholesale || [];

  const providers: { id: WholesaleConfig['provider']; name: string; url: string; logoColor: string }[] = [
    { id: 'alibaba', name: 'Alibaba', url: 'https://alibaba.com', logoColor: 'bg-orange-500' },
    { id: 'faire', name: 'Faire', url: 'https://faire.com', logoColor: 'bg-black' },
    { id: 'printful', name: 'Printful', url: 'https://printful.com', logoColor: 'bg-red-600' },
    { id: 'modalyst', name: 'Modalyst', url: 'https://modalyst.co', logoColor: 'bg-blue-600' },
  ];

  const toggleProvider = (pid: WholesaleConfig['provider']) => {
    const exists = currentWholesale.find(w => w.provider === pid);
    let updated;
    if (exists) {
      updated = currentWholesale.filter(w => w.provider !== pid);
    } else {
      updated = [...currentWholesale, { provider: pid, isActive: true, lastSync: Date.now() }];
    }
    onUpdateProject({ ...project, wholesale: updated });
  };

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">Wholesale & Sourcing</h2>
        <p className="text-sm text-gray-400">Connect to global inventory hubs and POD providers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {providers.map((p) => {
          const config = currentWholesale.find(w => w.provider === p.id);
          return (
            <div key={p.id} className={`p-6 rounded-[32px] border transition-all ${isEInkMode ? 'border-2 border-black' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
              <div className={`w-12 h-12 ${p.logoColor} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                <BoxIcon className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg mb-1">{p.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">{p.id === 'printful' ? 'POD Integration' : 'Bulk Wholesale'}</p>
              
              <button 
                onClick={() => toggleProvider(p.id)}
                className={`w-full py-3 rounded-xl font-black text-xs transition-all ${config ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {config ? '✓ Connected' : '+ Link API'}
              </button>
            </div>
          );
        })}
      </div>

      {currentWholesale.length > 0 && (
        <section className={`p-8 bg-white rounded-[40px] border ${isEInkMode ? 'border-4 border-black' : 'border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">Active Inventory Sync</h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Real-time</span>
          </div>
          <div className="space-y-4">
            {currentWholesale.map((w) => (
              <div key={w.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                     <ShoppingCartIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black capitalize">{w.provider}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Last sync: {new Date(w.lastSync!).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white text-[10px] font-black border rounded-lg hover:bg-gray-100 transition-colors">SYNC NOW</button>
                  <button onClick={() => toggleProvider(w.provider)} className="p-2 text-gray-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};