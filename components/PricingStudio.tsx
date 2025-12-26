import React, { useState } from 'react';
import { Project } from '../types.ts';
import { getPricingRecommendation, PricingRecommendation } from '../services/pricing-ai.ts';
import { SparklesIcon, CreditCardIcon, ChartBarIcon, InfoIcon, BoltIcon } from './Icons.tsx';

interface PricingStudioProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
  isEInkMode?: boolean;
}

export const PricingStudio: React.FC<PricingStudioProps> = ({ project, onUpdateProject, isEInkMode }) => {
  const [productName, setProductName] = useState('');
  const [cogs, setCogs] = useState<number>(0);
  const [category, setCategory] = useState('Electronics');
  const [rec, setRec] = useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const getRecs = async () => {
    setLoading(true);
    try {
      const result = await getPricingRecommendation(productName, cogs, category);
      setRec(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">AI Pricing Lab</h2>
        <p className="text-sm text-gray-400">Maximize margins with dynamic competitor-aware pricing models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className={`p-8 bg-white rounded-[32px] border ${isEInkMode ? 'border-4 border-black' : 'border-gray-100 shadow-sm'}`}>
          <h3 className="font-black text-lg mb-6">Product Parameters</h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Item Name</label>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Wireless Noise Cancelling Headphones"
                className={`w-full px-4 py-3 text-sm rounded-xl border outline-none ${isEInkMode ? 'border-black' : 'border-gray-100'}`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Unit COGS ($)</label>
                <input 
                  type="number" 
                  value={cogs}
                  onChange={(e) => setCogs(Number(e.target.value))}
                  className={`w-full px-4 py-3 text-sm rounded-xl border outline-none ${isEInkMode ? 'border-black' : 'border-gray-100'}`} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Market Segment</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-xl border outline-none bg-transparent ${isEInkMode ? 'border-black' : 'border-gray-100'}`}
                >
                  <option>Electronics</option>
                  <option>Apparel</option>
                  <option>Home & Decor</option>
                  <option>Beauty & Health</option>
                </select>
              </div>
            </div>
            <button 
              onClick={getRecs}
              disabled={loading || !productName}
              className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isEInkMode ? 'bg-black text-white' : 'bg-[#008060] text-white hover:bg-[#006e52]'}`}
            >
              {loading ? 'Analyzing Market...' : <><SparklesIcon className="w-4 h-4" /> Calculate Ideal Price</>}
            </button>
          </div>
        </section>

        {rec && (
          <section className={`p-8 bg-gray-900 text-white rounded-[32px] border border-gray-800 animate-slide-in-right`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg">AI Recommendations</h3>
              <div className="px-3 py-1 bg-[#008060] rounded-full text-[10px] font-black uppercase tracking-widest">Optimized</div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">MSRP SUGGESTION</p>
                <p className="text-3xl font-black text-green-400">${rec.suggestedPrice.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">PROJECTED MARGIN</p>
                <p className="text-3xl font-black text-blue-400">{rec.margin}%</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] text-gray-400 font-black uppercase mb-3 flex items-center gap-2"><InfoIcon className="w-3 h-3" /> STRATEGY INSIGHT</p>
              <p className="text-sm text-gray-300 leading-relaxed italic">"{rec.reasoning}"</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase mb-3">WHOLESALE TIERING</p>
              <div className="space-y-2">
                {rec.tieredPricing.map((tier, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-xs font-bold border border-white/5">
                    <span>{tier.quantity}+ Units</span>
                    <span className="text-green-400">${tier.price.toFixed(2)} / ea</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};