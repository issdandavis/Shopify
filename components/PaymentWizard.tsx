
import React, { useState, useEffect } from 'react';
import { Project, PaymentConfig } from '../types.ts';
import { CreditCardIcon, ShieldCheckIcon, SparklesIcon, CheckCircleIcon, BoltIcon, InfoIcon, XIcon, GlobeIcon, ChevronRightIcon } from './Icons.tsx';

interface PaymentWizardProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
}

type WizardMode = 'overview' | 'stripe' | 'tax';
type StripeStep = 1 | 2 | 3 | 4 | 5;
type TaxStep = 1 | 2 | 3;

export const PaymentWizard: React.FC<PaymentWizardProps> = ({ project, onUpdateProject }) => {
  const [mode, setMode] = useState<WizardMode>('overview');
  const [stripeStep, setStripeStep] = useState<StripeStep>(1);
  const [taxStep, setTaxStep] = useState<TaxStep>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialConfig: PaymentConfig = {
    stripeActive: false,
    paypalActive: false,
    testMode: true,
    taxProvider: 'native',
    supportedCurrencies: ['USD'],
    fraudProtection: true,
    fraudRules: { blockProxy: true, blockMismatch: false, require3DS: true },
    paymentMethods: { applePay: true, googlePay: true, shopPay: true },
    subscriptionEnabled: false,
    taxRates: [{ region: 'Primary Warehouse', rate: 0 }],
    ...project.payments
  };

  const [config, setConfig] = useState<PaymentConfig>(initialConfig);

  const updateConfig = (fields: Partial<PaymentConfig>) => {
    const updated = { ...config, ...fields };
    setConfig(updated);
    onUpdateProject({ ...project, payments: updated });
  };

  const handleFinish = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setMode('overview');
      setStripeStep(1);
      setTaxStep(1);
    }, 2500);
  };

  const stripeCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'HKD', 'SGD', 'NZD'];

  const renderStripeWizard = () => {
    switch (stripeStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">API Configuration</h4>
            <p className="text-sm text-gray-500">Connect your Stripe account using API keys from your dashboard.</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Publishable Key</label>
                <input 
                  type="text" 
                  value={config.publishableKey || ''}
                  onChange={(e) => updateConfig({ publishableKey: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 min-h-[48px] rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Secret Key</label>
                <input 
                  type="password" 
                  value={config.secretKey || ''}
                  onChange={(e) => updateConfig({ secretKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 min-h-[48px] rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <BoltIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-200">Enable Test Mode</span>
              </div>
              <button 
                onClick={() => updateConfig({ testMode: !config.testMode })}
                className={`w-12 h-[32px] rounded-full relative transition-all ${config.testMode ? 'bg-yellow-600' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.testMode ? 'left-5' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">Webhook Integration</h4>
            <p className="text-sm text-gray-500">Enable real-time order syncing by adding a webhook endpoint in Stripe.</p>
            <div className="p-5 bg-black rounded-2xl border border-[#1F1F21] font-mono text-xs text-indigo-400 break-all select-all">
              {project.shopifyUrl ? `https://${project.shopifyUrl}/api/webhooks/stripe` : 'https://your-store.myshopify.com/api/webhooks/stripe'}
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Webhook Signing Secret</label>
              <input 
                type="text" 
                value={config.webhookSecret || ''}
                onChange={(e) => updateConfig({ webhookSecret: e.target.value })}
                placeholder="whsec_..."
                className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 min-h-[48px] rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Listener Active
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">Currencies & Markets</h4>
            <p className="text-sm text-gray-500">Select which currencies your store will accept natively.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stripeCurrencies.map(cur => (
                <button
                  key={cur}
                  onClick={() => {
                    const exists = config.supportedCurrencies.includes(cur);
                    updateConfig({
                      supportedCurrencies: exists 
                        ? config.supportedCurrencies.filter(c => c !== cur)
                        : [...config.supportedCurrencies, cur]
                    });
                  }}
                  className={`h-[54px] rounded-xl border text-xs font-black transition-all ${config.supportedCurrencies.includes(cur) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-[#1F1F21] text-gray-500'}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">Stripe Radar & Protection</h4>
            <p className="text-sm text-gray-500">Configure machine learning fraud detection rules.</p>
            <div className="space-y-4">
              <button 
                onClick={() => updateConfig({ fraudRules: { ...config.fraudRules, blockProxy: !config.fraudRules.blockProxy } })}
                className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-[#1F1F21] min-h-[64px]"
              >
                <div className="text-left">
                  <span className="block text-xs font-black text-white uppercase tracking-widest">Block Anonymous Proxies</span>
                  <span className="text-[10px] text-gray-500">Blocks high-risk VPN and proxy traffic.</span>
                </div>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${config.fraudRules.blockProxy ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700'}`}>
                    {config.fraudRules.blockProxy && <CheckCircleIcon className="w-4 h-4 text-white" checked />}
                </div>
              </button>
              <button 
                onClick={() => updateConfig({ fraudRules: { ...config.fraudRules, require3DS: !config.fraudRules.require3DS } })}
                className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-[#1F1F21] min-h-[64px]"
              >
                <div className="text-left">
                  <span className="block text-xs font-black text-white uppercase tracking-widest">3D Secure Requirement</span>
                  <span className="text-[10px] text-gray-500">Enforce SCA for European cards.</span>
                </div>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${config.fraudRules.require3DS ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700'}`}>
                    {config.fraudRules.require3DS && <CheckCircleIcon className="w-4 h-4 text-white" checked />}
                </div>
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in text-center py-10 px-4 md:px-0">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-500/30">
              <CheckCircleIcon className="w-10 h-10" checked />
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Ready for Launch</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">Stripe is configured with {config.supportedCurrencies.length} currencies and enhanced Radar protection.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {Object.entries(config.paymentMethods).map(([method, active]) => active && (
                <div key={method} className="px-3 py-1.5 bg-[#1F1F21] rounded-lg text-[8px] font-black uppercase text-gray-400 border border-white/5">
                  {method.replace(/([A-Z])/g, ' $1')}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderTaxWizard = () => {
    switch (taxStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">Provider Selection</h4>
            <p className="text-sm text-gray-500">Choose a tax compliance partner or use Shopify's built-in engine.</p>
            <div className="grid grid-cols-1 gap-3">
              {['native', 'avalara', 'taxjar'].map((p) => (
                <button
                  key={p}
                  onClick={() => updateConfig({ taxProvider: p as any })}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all min-h-[80px] ${config.taxProvider === p ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-black/40 border-[#1F1F21] text-gray-500 hover:border-gray-700'}`}
                >
                  <div className="text-left">
                    <span className="block text-sm font-black uppercase tracking-widest">{p} {p === 'native' ? '(Shopify)' : ''}</span>
                    <span className="text-[10px] opacity-60 line-clamp-1">{p === 'avalara' ? 'Best for multi-state scaling' : p === 'taxjar' ? 'Auto-filing specialist' : 'Simple regional calculations'}</span>
                  </div>
                  {config.taxProvider === p && <CheckCircleIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 ml-4" checked />}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in px-4 md:px-0">
            <h4 className="text-xl font-black text-white">Regional Rates</h4>
            <p className="text-sm text-gray-500">Set baseline tax rates for regions where you have economic nexus.</p>
            <div className="space-y-4">
              {config.taxRates.map((tr, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-white/5 p-4 rounded-2xl md:p-0 md:bg-transparent">
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 block md:hidden">Region Name</label>
                    <input 
                      type="text" 
                      value={tr.region}
                      onChange={(e) => {
                        const newRates = [...config.taxRates];
                        newRates[idx].region = e.target.value;
                        updateConfig({ taxRates: newRates });
                      }}
                      placeholder="Region name..."
                      className="w-full bg-black/40 border border-[#1F1F21] px-5 py-3 h-[44px] rounded-xl text-white text-sm outline-none"
                    />
                  </div>
                  <div className="relative w-full sm:w-32">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 block md:hidden">Rate (%)</label>
                    <input 
                      type="number" 
                      value={tr.rate}
                      onChange={(e) => {
                        const newRates = [...config.taxRates];
                        newRates[idx].rate = Number(e.target.value);
                        updateConfig({ taxRates: newRates });
                      }}
                      className="w-full bg-black/40 border border-[#1F1F21] px-5 py-3 h-[44px] rounded-xl text-white text-sm outline-none pr-10"
                    />
                    <span className="absolute right-4 top-[30px] sm:top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => updateConfig({ taxRates: [...config.taxRates, { region: '', rate: 0 }] })}
                className="w-full h-[44px] flex items-center justify-center border border-dashed border-gray-800 rounded-xl text-[10px] font-black text-gray-500 hover:text-white transition-colors"
              >
                + ADD NEXUS REGION
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in text-center py-10 px-4 md:px-0">
             <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-500/30">
              <ShieldCheckIcon className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Compliance Synced</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">Tax calculations via {config.taxProvider.toUpperCase()} are now active for {config.taxRates.length} regions.</p>
            <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <p className="text-[10px] text-indigo-400 font-bold uppercase">Pro Tip</p>
                <p className="text-[10px] text-gray-500 mt-1 italic">Automated tax reporting is recommended once you exceed $100k in annual GMV.</p>
            </div>
          </div>
        );
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0B] p-6">
        <div className="text-center animate-fade-in-up w-full">
           <div className="w-24 h-24 md:w-32 md:h-32 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-10 border-4 border-green-500/20">
              <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path className="animate-[dash_0.6s_ease-in-out_forwards]" strokeDasharray="100" strokeDashoffset="100" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
           </div>
           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">Sync Complete</h2>
           <p className="text-gray-500 font-medium text-base md:text-lg">Financial sub-systems are integrated and reporting to dashboard.</p>
        </div>
      </div>
    );
  }

  if (mode !== 'overview') {
    const isStripe = mode === 'stripe';
    const currentStep = isStripe ? stripeStep : taxStep;
    const totalSteps = isStripe ? 5 : 3;

    return (
      <div className="fixed inset-0 z-[60] bg-[#0A0A0B] flex flex-col animate-slide-in-right md:static md:inset-auto md:h-full md:bg-transparent md:animate-none">
        <div className="p-4 md:p-8 flex-1 flex flex-col max-w-4xl mx-auto w-full pb-24 md:pb-24">
          <div className="flex items-center justify-between mb-8 md:mb-12">
              <button onClick={() => setMode('overview')} className="p-2 h-[44px] w-[44px] flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-500">
                <XIcon className="w-6 h-6" />
              </button>
              <div className="flex gap-1.5 md:gap-2">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                      <div key={i} className={`h-1 w-6 md:w-12 rounded-full transition-all duration-500 ${currentStep >= (i+1) ? (isStripe ? 'bg-indigo-600' : 'bg-green-600') : 'bg-gray-800'}`}></div>
                  ))}
              </div>
              <div className="w-[44px]"></div>
          </div>

          <div className="flex-1 flex flex-col justify-center overflow-y-auto">
            <div className="w-full max-w-xl mx-auto py-6">
              {isStripe ? renderStripeWizard() : renderTaxWizard()}
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col md:flex-row gap-3">
             {currentStep > 1 && (
               <button 
                onClick={() => isStripe ? setStripeStep(s => (s-1) as StripeStep) : setTaxStep(s => (s-1) as TaxStep)} 
                className="h-[54px] md:px-8 border border-gray-800 text-gray-500 font-black rounded-2xl hover:text-white"
               >
                 BACK
               </button>
             )}
             <button 
               onClick={() => {
                 if (isStripe) stripeStep === 5 ? handleFinish() : setStripeStep(s => (s+1) as StripeStep);
                 else taxStep === 3 ? handleFinish() : setTaxStep(s => (s+1) as TaxStep);
               }}
               className={`flex-1 h-[54px] ${isStripe ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3`}
             >
                {currentStep === totalSteps ? 'COMPLETE SETUP' : 'CONTINUE'} <ChevronRightIcon className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in space-y-8 overflow-y-auto h-full pb-24 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Finance Hub</h2>
          <p className="text-sm md:text-gray-500 font-medium">Orchestrate your store's capital flow and compliance layers.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20 w-fit">
          <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">PCI Level 1 Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section className="p-6 md:p-10 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] group hover:border-indigo-500/50 transition-all cursor-pointer" onClick={() => setMode('stripe')}>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-indigo-500 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
            <CreditCardIcon className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">Stripe Wizard</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 md:mb-10">Configure API keys, webhooks, and fraud rules in a single flow.</p>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className={config.stripeActive ? 'text-green-500' : 'text-gray-600'}>{config.stripeActive ? 'ACTIVE' : 'READY TO SYNC'}</span>
            <div className="flex items-center gap-2 text-indigo-500 group-hover:translate-x-2 transition-transform">START <ChevronRightIcon className="w-4 h-4" /></div>
          </div>
        </section>

        <section className="p-6 md:p-10 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] group hover:border-green-500/50 transition-all cursor-pointer" onClick={() => setMode('tax')}>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-600/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-green-500 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
            <ShieldCheckIcon className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">Tax Architect</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 md:mb-10">Automate regional sales tax and nexus reporting via global compliance partners.</p>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-gray-600">PROVIDER: {config.taxProvider.toUpperCase()}</span>
            <div className="flex items-center gap-2 text-green-500 group-hover:translate-x-2 transition-transform">CONFIGURE <ChevronRightIcon className="w-4 h-4" /></div>
          </div>
        </section>
      </div>

      <section className="p-6 md:p-10 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[2.5rem] md:rounded-[3rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-indigo-400" /> Recurring Engine
            </h3>
            <p className="text-gray-400 mt-3 md:mt-4 text-sm font-medium leading-relaxed">Enable monthly curated boxes and automated recurring billing via Stripe Billing kernel.</p>
          </div>
          <button 
            onClick={() => updateConfig({ subscriptionEnabled: !config.subscriptionEnabled })}
            className={`h-[54px] px-8 md:px-10 rounded-2xl font-black text-sm transition-all shadow-2xl ${config.subscriptionEnabled ? 'bg-green-600 text-white' : 'bg-white text-black hover:scale-105 active:scale-95'}`}
          >
            {config.subscriptionEnabled ? '✓ RECURRING ACTIVE' : 'BOOT SUB-SYSTEM'}
          </button>
        </div>
      </section>
    </div>
  );
};
