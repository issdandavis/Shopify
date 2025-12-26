import React, { useState } from 'react';
import { Project, ShippingZone, ShippingRate } from '../types.ts';
import { TruckIcon, PlusIcon, TrashIcon, CheckCircleIcon, InfoIcon, SparklesIcon, XIcon, GlobeIcon, BoltIcon } from './Icons.tsx';
import { getLogisticsAdvice, LogisticsAdvice } from '../services/shipping-ai.ts';

interface ShippingStudioProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  isEInkMode?: boolean;
}

export const ShippingStudio: React.FC<ShippingStudioProps> = ({ project, onUpdateProject, isEInkMode }) => {
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  
  // Logistics Advisor State
  const [dest, setDest] = useState('');
  const [weight, setWeight] = useState(16);
  const [isIntl, setIsIntl] = useState(false);
  const [advice, setAdvice] = useState<LogisticsAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const getAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await getLogisticsAdvice(dest, weight, isIntl);
      setAdvice(res);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const setupDefaultShipping = () => {
    const defaultZone: ShippingZone = {
      id: generateId(),
      name: 'Domestic (USA)',
      countries: ['United States'],
      rates: [
        { id: generateId(), name: 'Standard Shipping', price: 9.99, type: 'flat' },
        { id: generateId(), name: 'Free Shipping over $100', price: 0, type: 'free' }
      ]
    };
    onUpdateProject({ ...project, shippingZones: [defaultZone] });
  };

  const zones = project.shippingZones || [];

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Logistics AI</h2>
          <p className="text-sm text-gray-400">Optimize global fulfillment and carrier selection.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={setupDefaultShipping}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-xl transition-all hover:bg-gray-50 ${isEInkMode ? 'border-black' : ''}`}
          >
            <SparklesIcon className="w-4 h-4 text-green-600" />
            AI Baseline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* Logistics Advisor Form */}
        <section className={`xl:col-span-1 p-8 bg-white rounded-[32px] border ${isEInkMode ? 'border-4 border-black' : 'border-gray-100 shadow-sm'}`}>
          <h3 className="font-black text-lg mb-6 flex items-center gap-2"><BoltIcon className="w-5 h-5 text-[#008060]" /> Carrier Advisor</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Destination</label>
              <input type="text" value={dest} onChange={e => setDest(e.target.value)} placeholder="London, UK" className="w-full px-4 py-3 text-sm rounded-xl border border-gray-100 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Weight (oz)</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-100 outline-none" />
            </div>
            <div className="flex items-center gap-3">
               <input type="checkbox" checked={isIntl} onChange={e => setIsIntl(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#008060] focus:ring-[#008060]" />
               <label className="text-xs font-bold text-gray-600">International Customs Required</label>
            </div>
            <button 
              onClick={getAdvice}
              disabled={loadingAdvice || !dest}
              className={`w-full py-4 rounded-xl font-black text-xs bg-gray-900 text-white hover:bg-black transition-all ${loadingAdvice ? 'opacity-50' : ''}`}
            >
              {loadingAdvice ? 'Simulating Rates...' : 'Get Optimal Carrier'}
            </button>
          </div>
        </section>

        {/* Results / Advice */}
        <section className={`xl:col-span-2 p-8 bg-gray-900 text-white rounded-[32px] border border-gray-800 flex flex-col justify-center min-h-[300px]`}>
          {!advice ? (
             <div className="text-center opacity-50">
                <TruckIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Awaiting Logistics Data</p>
             </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">RECOMMENDED CARRIER</p>
                  <h4 className="text-3xl font-black">{advice.optimalCarrier}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">ESTIMATED COST</p>
                  <p className="text-3xl font-black">${advice.estimatedCost.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-3">KEY ADVANTAGES</p>
                   <ul className="space-y-2">
                     {advice.pros.map((p, i) => <li key={i} className="text-xs text-green-300 font-bold flex items-start gap-2"><CheckCircleIcon className="w-4 h-4 shrink-0" checked /> {p}</li>)}
                   </ul>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-3">CONSIDERATIONS</p>
                   <ul className="space-y-2">
                     {advice.cons.map((c, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="text-yellow-500 font-black">!</span> {c}</li>)}
                   </ul>
                </div>
              </div>

              {advice.customsRequirements && (
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-orange-400 uppercase mb-2">CUSTOMS INTEL</p>
                  <p className="text-xs text-gray-300 leading-relaxed italic">{advice.customsRequirements}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Manual Zones */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Manual Shipping Zones</h3>
           <button onClick={() => setIsAddingZone(true)} className="p-2 bg-white rounded-lg border border-gray-200 text-[#008060]"><PlusIcon className="w-5 h-5" /></button>
        </div>
        
        {isAddingZone && (
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl mb-6">
            <input 
              type="text" 
              value={newZoneName} 
              onChange={e => setNewZoneName(e.target.value)} 
              placeholder="Zone Name (e.g. EU Express)"
              className="w-full px-4 py-3 text-sm rounded-xl border mb-4 outline-none" 
            />
            <div className="flex gap-2">
               <button onClick={() => { 
                 const z = { id: generateId(), name: newZoneName, countries: ['Custom'], rates: [] };
                 onUpdateProject({ ...project, shippingZones: [...zones, z] });
                 setIsAddingZone(false);
               }} className="px-6 py-2 bg-[#008060] text-white font-black text-xs rounded-xl">Create Zone</button>
               <button onClick={() => setIsAddingZone(false)} className="px-6 py-2 bg-gray-100 font-black text-xs rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pb-20">
          {zones.map(z => (
            <div key={z.id} className="p-6 bg-white rounded-[32px] border border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#008060]"><GlobeIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-black">{z.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{z.rates.length} ACTIVE RATES</p>
                  </div>
               </div>
               <button onClick={() => onUpdateProject({ ...project, shippingZones: zones.filter(item => item.id !== z.id) })} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};