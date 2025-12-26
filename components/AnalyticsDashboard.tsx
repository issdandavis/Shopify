import React from 'react';
import { ChartBarIcon, TagIcon, CreditCardIcon, BoxIcon, BoltIcon } from './Icons.tsx';

export const AnalyticsDashboard: React.FC<{ isEInkMode?: boolean }> = ({ isEInkMode }) => {
    const stats = [
        { name: 'Total Sales', value: '$12,450.00', change: '+12%', icon: <CreditCardIcon className="w-5 h-5" /> },
        { name: 'Avg. Conversion', value: '3.42%', change: '+0.5%', icon: <ChartBarIcon className="w-5 h-5" /> },
        { name: 'New Customers', value: '1,240', change: '+24%', icon: <TagIcon className="w-5 h-5" /> },
        { name: 'Stock Forecast', value: '98% Accuracy', change: 'ML Enabled', icon: <BoltIcon className="w-5 h-5" /> },
    ];

    return (
        <div className={`p-6 md:p-8 animate-fade-in h-full overflow-y-auto ${isEInkMode ? 'grayscale' : ''}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Intelligence Hub</h2>
                    <p className="text-sm text-gray-400">Advanced Analytics & Forecasting</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-bold border rounded-lg">Last 30 Days</button>
                    <button className="px-4 py-2 text-xs font-bold bg-[#008060] text-white rounded-lg">Export Insights</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-6 bg-white rounded-2xl border ${isEInkMode ? 'border-2 border-black' : 'border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4 text-gray-400">
                            {stat.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{stat.name}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className={`p-8 bg-white rounded-3xl border ${isEInkMode ? 'border-2 border-black' : 'border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black">Inventory Demand Forecast</h3>
                        <span className="text-[10px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded">ML PREDICTION</span>
                    </div>
                    <div className="h-64 flex items-end justify-around gap-4 pt-10">
                        {[45, 55, 60, 80, 75, 90, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className={`w-full rounded-t-lg transition-all duration-1000 ${i > 4 ? (isEInkMode ? 'bg-black opacity-30' : 'bg-blue-400 opacity-60') : (isEInkMode ? 'bg-black' : 'bg-[#008060]')}`} style={{ height: `${h}%` }}></div>
                                <span className="text-[10px] text-gray-400 font-bold">Wk {i+1}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 flex items-center gap-2">
                            <BoltIcon className="w-4 h-4" /> 
                            Supply chain recommendation: Order 200 units of "Primary Item" by Tuesday.
                        </p>
                    </div>
                </div>

                <div className={`p-8 bg-white rounded-3xl border ${isEInkMode ? 'border-2 border-black' : 'border-gray-100 shadow-sm'}`}>
                    <h3 className="font-black mb-6">A/B Test Performance</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                                <span>Variant A (Standard)</span>
                                <span>2.8% CR</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-400 w-[60%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-[#008060]">
                                <span>Variant B (AI Dynamic)</span>
                                <span>4.2% CR</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full w-[85%] ${isEInkMode ? 'bg-black' : 'bg-[#008060]'}`}></div>
                            </div>
                        </div>
                    </div>
                    <p className="mt-8 text-xs text-gray-400 leading-relaxed italic">
                        Statistical Significance: 99.4%. Variant B is the winner. Implementing changes store-wide...
                    </p>
                </div>
            </div>
        </div>
    );
};