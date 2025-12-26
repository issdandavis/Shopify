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

  // Simulated comparative analytics data based on recommendation
  const analyticsData = rec ? {
    current: { cr: 2.1, margin: Math.round((rec.suggestedPrice * 0.8 - cogs) / (rec.suggestedPrice * 0.8) * 100) || 15 },
    optimized: { cr: 3.4, margin: rec.margin },
    lift: 38
  } : null;

  return (
    <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale invert' : ''}`}>
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">AI Pricing Lab</h2>
        <p className="text-sm text-gray-500 font-medium">Maximize margins with dynamic competitor-aware pricing models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className={`p-8 bg-[#0F0F10] rounded-[2.5rem] border border-[#1F1F21] ${isEInkMode ? 'border-4 border-black' : ''}`}>
          <h3 className="font-black text-lg mb-6 text-white uppercase tracking-tight">Product Parameters</h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Item Name</label>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Wireless Noise Cancelling Headphones"
                className="w-full bg-black/40 px-5 py-4 text-sm rounded-2xl border border-[#1F1F21] text-white outline-none focus:border-[#008060] transition-all" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Unit COGS ($)</label>
                <input 
                  type="number" 
                  value={cogs}
                  onChange={(e) => setCogs(Number(e.target.value))}
                  className="w-full bg-black/40 px-5 py-4 text-sm rounded-2xl border border-[#1F1F21] text-white outline-none focus:border-[#008060] transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Market Segment</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 px-5 py-4 text-sm rounded-2xl border border-[#1F1F21] text-white outline-none bg-transparent"
                >
                  <option className="bg-[#0F0F10]">Electronics</option>
                  <option className="bg-[#0F0F10]">Apparel</option>
                  <option className="bg-[#0F0F10]">Home & Decor</option>
                  <option className="bg-[#0F0F10]">Beauty & Health</option>
                </select>
              </div>
            </div>
            <button 
              onClick={getRecs}
              disabled={loading || !productName}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${loading ? 'opacity-50' : 'bg-[#008060] text-white hover:bg-[#006e52] shadow-lg shadow-green-900/20 active:scale-95'}`}
            >
              {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><SparklesIcon className="w-5 h-5" /> Calculate Ideal Price</>}
            </button>
          </div>
        </section>

        {rec && (
          <section className={`p-8 bg-[#0F0F10] text-white rounded-[2.5rem] border border-[#1F1F21] animate-slide-in-right`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg uppercase tracking-tight">AI Recommendations</h3>
              <div className="px-3 py-1 bg-[#008060] rounded-full text-[10px] font-black uppercase tracking-widest">Optimized</div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest">MSRP SUGGESTION</p>
                <p className="text-3xl font-black text-green-400">${rec.suggestedPrice.toFixed(2)}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest">PROJECTED MARGIN</p>
                <p className="text-3xl font-black text-blue-400">{rec.margin}%</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-3 flex items-center gap-2 tracking-widest"><InfoIcon className="w-3 h-3 text-indigo-400" /> STRATEGY INSIGHT</p>
              <p className="text-sm text-gray-300 leading-relaxed font-medium italic">"{rec.reasoning}"</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-widest">WHOLESALE TIERING</p>
              <div className="space-y-2">
                {rec.tieredPricing.map((tier, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl text-xs font-bold border border-white/5">
                    <span className="text-gray-400">{tier.quantity}+ Units</span>
                    <span className="text-green-400">${tier.price.toFixed(2)} / ea</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {rec && analyticsData && (
        <section className="mt-12 mb-20 p-10 bg-gradient-to-br from-[#161618] to-black rounded-[3rem] border border-[#1F1F21] animate-fade-in-up">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Impact Analysis</h3>
              <p className="text-sm text-gray-500 font-medium">Comparative performance of AI vs. traditional pricing models.</p>
            </div>
            <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-2xl text-center">
              <p className="text-[10px] font-black text-green-500 uppercase mb-1">Expected Rev Lift</p>
              <p className="text-2xl font-black text-green-400">+{analyticsData.lift}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Conversion Rate Comparison */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Conversion Rate (CR)</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                    <span>Current Strategy</span>
                    <span>{analyticsData.current.cr}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-600 rounded-full" style={{ width: `${(analyticsData.current.cr / analyticsData.optimized.cr) * 100}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-green-500 uppercase">
                    <span>AI Optimized</span>
                    <span>{analyticsData.optimized.cr}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full shadow-[0_0_10px_#008060]" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Margin Comparison */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Profit Margin (%)</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                    <span>Current Strategy</span>
                    <span>{analyticsData.current.margin}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-600 rounded-full" style={{ width: `${(analyticsData.current.margin / analyticsData.optimized.margin) * 100}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-blue-500 uppercase">
                    <span>AI Optimized</span>
                    <span>{analyticsData.optimized.margin}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <BoltIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-100 mb-1 uppercase tracking-wider">Predictive Outcome</p>
              <p className="text-sm text-indigo-200/60 leading-relaxed font-medium">By adopting the "Psychological Anchor" pricing strategy, we expect to see a significant reduction in cart abandonment due to price friction, directly leading to the projected CR lift.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};