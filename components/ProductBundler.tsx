import React from 'react';
import { Project } from '../types.ts';
import { BoxIcon, PlusIcon, SparklesIcon, TagIcon } from './Icons.tsx';

export const ProductBundler: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="p-8 animate-fade-in space-y-10 overflow-y-auto h-full pb-24">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tighter">Bundle & Upsell Engine</h2>
        <p className="text-gray-500 font-medium">Increase Average Order Value (AOV) with curated sub-sets and tiered packs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
              <BoxIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Bundle Configurator</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Multi-Item Packs</p>
            </div>
          </div>
          
          <div className="p-10 border-2 border-dashed border-[#1F1F21] rounded-[2rem] flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-4">
                <PlusIcon className="w-6 h-6" />
             </div>
             <p className="text-sm font-black text-gray-600 uppercase tracking-widest">Create First Bundle</p>
          </div>
        </section>

        <section className="p-8 bg-[#0F0F10] border border-[#1F1F21] rounded-[2.5rem] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500">
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">AI Strategy Layer</h3>
              <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">AOV Optimization</p>
            </div>
          </div>
          
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 font-medium italic leading-relaxed">
              <SparklesIcon className="w-4 h-4 text-pink-400 mb-2" />
              "Based on store data, your 'Gaming Mouse' and 'Aether Moor Mousepad' have a 62% co-purchase rate. Suggesting a 15% discount bundle to increase throughput."
            </p>
          </div>

          <button className="w-full mt-8 py-4 bg-pink-600 text-white font-black text-sm rounded-2xl">
            IMPLEMENT SUGGESTION
          </button>
        </section>
      </div>
    </div>
  );
};