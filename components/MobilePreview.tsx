import React, { useState } from 'react';
import { XIcon } from './Icons.tsx';

interface MobilePreviewProps {
  onClose: () => void;
  isEInkMode?: boolean;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ onClose, isEInkMode }) => {
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#F6F6F7] animate-fade-in ${isEInkMode ? 'grayscale' : ''}`}>
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black">Mobile UX Studio</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setDeviceType('ios')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${deviceType === 'ios' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              iPhone 15 Pro
            </button>
            <button 
              onClick={() => setDeviceType('android')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${deviceType === 'android' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              Pixel 8
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><XIcon /></button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className={`relative transition-all duration-500 bg-white border-[12px] border-gray-900 rounded-[3rem] shadow-2xl overflow-hidden ${deviceType === 'ios' ? 'w-[360px] h-[720px]' : 'w-[360px] h-[700px] rounded-[2rem]'}`}>
          {/* Status Bar */}
          <div className="h-6 flex items-center justify-between px-8 pt-4">
            <span className="text-[10px] font-bold">9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-4 h-2 border border-black rounded-[2px]"></div>
              <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
          </div>
          
          {/* Content Mock */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
              <div className="w-24 h-4 bg-gray-900 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
            </div>
            
            <div className="w-full h-48 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed border-gray-200">
               <span className="text-xs font-bold text-gray-400">Hero Section Preview</span>
            </div>

            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-gray-100 rounded-full"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="h-40 bg-gray-50 rounded-2xl border border-gray-100"></div>
              <div className="h-40 bg-gray-50 rounded-2xl border border-gray-100"></div>
            </div>

            <div className="fixed bottom-10 left-6 right-6 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xs font-bold">
              Add to Cart
            </div>
          </div>

          {/* Device Notch/Home Indicator */}
          {deviceType === 'ios' ? (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full"></div>
          ) : (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full"></div>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};