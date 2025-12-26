
import React, { useState, useEffect } from 'react';
import { Project, ShippingZone, ShippingRate } from '../types.ts';
import { TruckIcon, PlusIcon, TrashIcon, CheckCircleIcon, InfoIcon, SparklesIcon, XIcon, GlobeIcon, BoltIcon } from './Icons.tsx';
import { getLogisticsAdvice, LogisticsAdvice } from '../services/shipping-ai.ts';
import { getMapsGroundedInfo } from '../services/geminiService.ts';

interface ShippingStudioProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  isEInkMode?: boolean;
}

export const ShippingStudio: React.FC<ShippingStudioProps> = ({ project, onUpdateProject, isEInkMode }) => {
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCountries, setNewZoneCountries] = useState('');
  const [newZoneRate, setNewZoneRate] = useState('9.99');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isAddingRateToZone, setIsAddingRateToZone] = useState<string | null>(null);
  const [newRateName, setNewRateName] = useState('');
  const [newRatePrice, setNewRatePrice] = useState('0');

  // Maps Grounding State
  const [verifying, setVerifying] = useState(false);
  const [mapResult, setMapResult] = useState<string | null>(null);

  // Logistics Advisor State
  const [dest, setDest] = useState('');
  const [weight, setWeight] = useState(16);
  const [isIntl, setIsIntl] = useState(false);
  const [advice, setAdvice] = useState<LogisticsAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const verifyZoneFeasibility = async () => {
    if (!newZoneCountries) return;
    setVerifying(true);
    setMapResult(null);
    try {
        const result = await getMapsGroundedInfo(`What are the major shipping ports and expected cross-border logistics challenges for shipping from USA to ${newZoneCountries}?`);
        setMapResult(result.text || "No mapping data available.");
    } catch (e) {
        console.error(e);
    } finally {
        setVerifying(false);
    }
  };

  const handleAddZone = () => {
    if (!newZoneName || !newZoneCountries) return;
    
    const z: ShippingZone = { 
      id: generateId(), 
      name: newZoneName, 
      countries: newZoneCountries.split(',').map(c => c.trim()).filter(c => c), 
      rates: [{ id: generateId(), name: 'Standard Flat Rate', price: parseFloat(newZoneRate) || 0, type: 'flat' as const }] 
    };

    onUpdateProject({ ...project, shippingZones: [...(project.shippingZones || []), z] });
    
    setSuccessMessage(`Zone "${newZoneName}" Active!`);
    setTimeout(() => setSuccessMessage(null), 3000);
    
    setIsAddingZone(false);
    setNewZoneName('');
    setNewZoneCountries('');
    setMapResult(null);
  };

  const handleAddRate = (zoneId: string) => {
    if (!newRateName) return;
    const updatedZones = (project.shippingZones || []).map(z => {
      if (z.id === zoneId) {
        return {
          ...z,
          rates: [...z.rates, { id: generateId(), name: newRateName, price: parseFloat(newRatePrice) || 0, type: 'flat' as any }]
        };
      }
      return z;
    });
    onUpdateProject({ ...project, shippingZones: updatedZones });
    setIsAddingRateToZone(null);
    setNewRateName('');
    setNewRatePrice('0');
  };

  const removeRate = (zoneId: string, rateId: string) => {
    const updatedZones = (project.shippingZones || []).map(z => {
      if (z.id === zoneId) {
        return { ...z, rates: z.rates.filter(r => r.id !== rateId) };
      }
      return z;
    });
    onUpdateProject({ ...project, shippingZones: updatedZones });
  };

  const getAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await getLogisticsAdvice(dest, weight, isIntl);
      setAdvice(res);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const zones = project.shippingZones || [];

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto pb-24 ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Logistics Architect</h2>
          <p className="text-sm text-gray-500 font-medium">Manage global shipping zones and verify delivery routes with Google Maps.</p>
        </div>
        <div className="flex gap-3">
          {!isAddingZone && (
            <button 
              onClick={() => setIsAddingZone(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#008060] text-white text-xs font-black rounded-2xl shadow-xl shadow-green-900/20 hover:bg-[#006e52] transition-all"
            >
              <PlusIcon className="w-4 h-4" /> INITIALIZE NEW ZONE
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-8 p-4 bg-green-600 text-white font-black text-center rounded-2xl animate-fade-in-up flex items-center justify-center gap-3">
            <CheckCircleIcon className="w-5 h-5" checked /> {successMessage}
        </div>
      )}

      {isAddingZone && (
        <section className="mb-12 p-10 bg-[#0F0F10] border border-indigo-500/30 rounded-[3rem] animate-fade-in-up shadow-2xl shadow-indigo-900/10">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                    <GlobeIcon className="w-6 h-6 text-indigo-400" /> Zone Configuration
                </h3>
                <button onClick={() => setIsAddingZone(false)} className="p-2 text-gray-500 hover:text-white transition-all"><XIcon /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Zone Identity (e.g. EU West)</label>
                        <input 
                            type="text" 
                            value={newZoneName} 
                            onChange={e => setNewZoneName(e.target.value)}
                            className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
                            placeholder="Enter Zone Name..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Coverage (Countries, comma separated)</label>
                        <input 
                            type="text" 
                            value={newZoneCountries} 
                            onChange={e => setNewZoneCountries(e.target.value)}
                            className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
                            placeholder="United Kingdom, France, Germany..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Base Flat Rate ($)</label>
                        <input 
                            type="number" 
                            value={newZoneRate} 
                            onChange={e => setNewZoneRate(e.target.value)}
                            className="w-full bg-black/40 border border-[#1F1F21] px-5 py-4 rounded-2xl text-white text-sm outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={handleAddZone}
                            disabled={!newZoneName || !newZoneCountries}
                            className="flex-1 py-5 bg-indigo-600 text-white font-black text-xs rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all uppercase tracking-widest"
                        >
                            Activate Zone
                        </button>
                        <button 
                            onClick={verifyZoneFeasibility}
                            disabled={verifying || !newZoneCountries}
                            className="px-8 py-5 border border-indigo-500/30 text-indigo-400 font-black text-xs rounded-2xl hover:bg-indigo-600/10 transition-all uppercase flex items-center gap-2"
                        >
                            {verifying ? 'MAPPING...' : <><GlobeIcon className="w-4 h-4" /> VERIFY ROUTES</>}
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-black/40 border border-[#1F1F21] rounded-[2.5rem] flex flex-col">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Logistics Grounding (Google Maps)</h4>
                    {verifying ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-10 h-10 border-2 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-indigo-400 animate-pulse">Calculating Global Distances...</p>
                        </div>
                    ) : mapResult ? (
                        <div className="flex-1 space-y-4">
                            <div className="p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl">
                                <p className="text-xs text-indigo-200 leading-relaxed italic font-medium">"{mapResult}"</p>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold uppercase flex items-center gap-2">
                                <InfoIcon className="w-3 h-3" /> Data grounded via Google Maps API
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                            <GlobeIcon className="w-12 h-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Enter countries to analyze route feasibility.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] ml-2">Active Fulfillment Zones</h3>
            <div className="space-y-4">
                {zones.length === 0 ? (
                    <div className="p-20 bg-[#0F0F10] border border-dashed border-[#1F1F21] rounded-[3rem] text-center text-gray-700 font-black text-sm uppercase italic">
                        No configured zones.
                    </div>
                ) : (
                    zones.map(z => (
                        <div key={z.id} className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] space-y-6 group hover:border-[#008060]/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#008060] shadow-inner">
                                        <GlobeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{z.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{z.countries.join(', ')}</p>
                                    </div>
                                </div>
                                <button onClick={() => onUpdateProject({ ...project, shippingZones: zones.filter(item => item.id !== z.id) })} className="p-2 text-gray-700 hover:text-red-500 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Rate Protocols</span>
                                  <button 
                                    onClick={() => setIsAddingRateToZone(z.id)}
                                    className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:underline"
                                  >
                                    + ADD RATE
                                  </button>
                                </div>
                                {isAddingRateToZone === z.id && (
                                  <div className="p-4 bg-black/60 rounded-2xl border border-indigo-500/20 flex flex-col gap-3 mb-4">
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        placeholder="Rate Name (e.g. Express)" 
                                        className="flex-1 bg-transparent border-b border-gray-800 text-[10px] outline-none py-1"
                                        value={newRateName}
                                        onChange={(e) => setNewRateName(e.target.value)}
                                      />
                                      <input 
                                        type="number" 
                                        placeholder="$" 
                                        className="w-16 bg-transparent border-b border-gray-800 text-[10px] outline-none py-1"
                                        value={newRatePrice}
                                        onChange={(e) => setNewRatePrice(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleAddRate(z.id)} className="flex-1 py-2 bg-indigo-600 text-[8px] font-black rounded-lg">CONFIRM</button>
                                      <button onClick={() => setIsAddingRateToZone(null)} className="px-3 py-2 bg-gray-900 text-[8px] font-black rounded-lg">CANCEL</button>
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {z.rates.map(r => (
                                      <div key={r.id} className="group/rate px-3 py-2 bg-black rounded-xl border border-white/5 flex items-center justify-between">
                                          <div>
                                            <span className="text-[10px] font-bold text-gray-300">{r.name}</span>
                                            <span className="ml-2 text-[10px] font-black text-green-500">${r.price.toFixed(2)}</span>
                                          </div>
                                          <button onClick={() => removeRate(z.id, r.id)} className="opacity-0 group-hover/rate:opacity-100 text-gray-700 hover:text-red-500 transition-all">
                                            <XIcon className="w-3 h-3" />
                                          </button>
                                      </div>
                                  ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>

        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] ml-2">Carrier Simulation Hub</h3>
            <div className="p-8 bg-gradient-to-br from-[#161618] to-black rounded-[3rem] border border-[#1F1F21] space-y-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={dest} onChange={e => setDest(e.target.value)} placeholder="Destination (e.g. UK)" className="bg-black/40 border border-[#1F1F21] px-5 py-4 rounded-2xl text-white text-xs outline-none focus:border-[#008060]" />
                        <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} placeholder="Weight (oz)" className="bg-black/40 border border-[#1F1F21] px-5 py-4 rounded-2xl text-white text-xs outline-none focus:border-[#008060]" />
                    </div>
                    <button onClick={getAdvice} disabled={loadingAdvice || !dest} className="w-full py-4 bg-[#008060] text-white font-black text-xs rounded-2xl hover:bg-[#006e52] transition-all uppercase tracking-widest disabled:opacity-30 shadow-xl shadow-green-900/20 flex items-center justify-center gap-3">
                         {loadingAdvice ? 'Processing...' : <><SparklesIcon className="w-4 h-4" /> Simulate Best Carrier</>}
                    </button>
                </div>

                {advice && (
                    <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-6 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-green-500 font-black uppercase mb-1">Optimized Selection</p>
                                <p className="text-2xl font-black text-white">{advice.optimalCarrier}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Est. Cost</p>
                                <p className="text-2xl font-black text-white">${advice.estimatedCost.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[8px] text-gray-500 font-black uppercase mb-2">Advantages</p>
                                <ul className="space-y-1">
                                    {advice.pros.slice(0, 2).map((p, i) => <li key={i} className="text-[10px] font-bold text-gray-400 flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-600" checked /> {p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <p className="text-[8px] text-gray-500 font-black uppercase mb-2">Delivery Window</p>
                                <p className="text-xs font-black text-indigo-400">{advice.estimatedDays}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};
