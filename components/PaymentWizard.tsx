import React, { useState } from 'react';
import { Project, PaymentConfig } from '../types.ts';
import { CreditCardIcon, ShieldCheckIcon, SparklesIcon, CheckCircleIcon, BoltIcon, InfoIcon } from './Icons.tsx';

interface PaymentWizardProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
}

export const PaymentWizard: React.FC<PaymentWizardProps> = ({ project, onUpdateProject }) => {
  const config = project.payments || {
    stripeActive: false,
    paypalActive: false,
    testMode: true,
    taxProvider: 'native',
    supportedCurrencies: ['USD'],
    fraudProtection: true,
    subscriptionEnabled: false
  };

  const update = (fields: Partial<PaymentConfig>) => {
    onUpdateProject({ ...project, payments: { ...config, ...fields } });
  };

  return (
    <div className="p-8 animate-fade-in space-y-10 overflow-y-auto h-full pb-24">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tighter">Payment Engine</h2>
        <p className="text-gray-500 font-medium">Configure global processing, tax compliance, and fraud protection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stripe Configuration */}
        <section className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem]">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                <CreditCardIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Stripe Integration</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Global Payments</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.stripeActive} onChange={(e) => update({ stripeActive: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-[#1F1F21]">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-gray-300">Stripe Radar (Fraud Protection)</span>
              </div>
              <input type="checkbox" checked={config.fraudProtection} onChange={(e) => update({ fraudProtection: e.target.checked })} className="rounded bg-gray-800 border-gray-700" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-[#1F1F21]">
              <div className="flex items-center gap-3">
                <BoltIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-xs font-bold text-gray-300">Test Mode</span>
              </div>
              <input type="checkbox" checked={config.testMode} onChange={(e) => update({ testMode: e.target.checked })} className="rounded bg-gray-800 border-gray-700" />
            </div>

            <button className="w-full py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
              CONFIGURE WEBHOOKS
            </button>
          </div>
        </section>

        {/* Tax & Compliance */}
        <section className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Tax Automation</h3>
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Compliance & Reporting</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block ml-1">Provider Selection</label>
            <div className="grid grid-cols-3 gap-3">
              {['native', 'avalara', 'taxjar'].map((p) => (
                <button
                  key={p}
                  onClick={() => update({ taxProvider: p as any })}
                  className={`py-3 text-[10px] font-black rounded-xl border transition-all ${config.taxProvider === p ? 'bg-green-600 text-white border-green-600' : 'bg-black/40 text-gray-500 border-[#1F1F21] hover:border-gray-700'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 mt-6">
              <p className="text-[10px] font-bold text-yellow-500 leading-relaxed uppercase flex items-center gap-2">
                <InfoIcon className="w-3 h-3" /> Architect Insight
              </p>
              <p className="text-xs text-gray-400 mt-2">Avalara is recommended for high-volume cross-border scaling to avoid compliance risk.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Subscription Layer */}
      <section className="p-10 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[3rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-indigo-400" /> Recurring Revenue
            </h3>
            <p className="text-gray-400 mt-4 font-medium leading-relaxed">Activate Shopify Subscriptions to enable box templates, curated sets, and automated monthly billing.</p>
          </div>
          <button 
            onClick={() => update({ subscriptionEnabled: !config.subscriptionEnabled })}
            className={`px-10 py-5 rounded-2xl font-black text-sm transition-all ${config.subscriptionEnabled ? 'bg-green-600 text-white' : 'bg-white text-black hover:scale-105'}`}
          >
            {config.subscriptionEnabled ? '✓ ENGINE ACTIVE' : 'INITIALIZE SUB-SYSTEM'}
          </button>
        </div>
      </section>
    </div>
  );
};