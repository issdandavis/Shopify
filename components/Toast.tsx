
import React, { useEffect, useState } from 'react';
import { XIcon, CheckCircleIcon, InfoIcon, SparklesIcon } from './Icons.tsx';

export type ToastType = 'success' | 'error' | 'info' | 'aws' | 'undo';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
  onUndo?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-auto z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const DURATION = 5000; // 5 seconds as requested

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onRemove(toast.id);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [toast.id, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-500" checked={true} />;
      case 'aws': return <SparklesIcon className="w-5 h-5 text-blue-500" />;
      case 'error': return <XIcon className="w-5 h-5 text-red-500" />;
      case 'undo': return <InfoIcon className="w-5 h-5 text-yellow-500" />;
      default: return <InfoIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="pointer-events-auto bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden min-w-[300px] animate-fade-in-up md:max-w-sm">
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800 leading-tight">{toast.text}</p>
          {toast.onUndo && (
            <button 
              onClick={() => { toast.onUndo?.(); onRemove(toast.id); }}
              className="mt-2 h-[44px] px-4 w-full md:w-auto bg-yellow-50 text-[10px] font-black uppercase text-yellow-700 hover:bg-yellow-100 rounded-lg transition-all border border-yellow-200 flex items-center justify-center"
            >
              Undo Action
            </button>
          )}
        </div>
        <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 p-2 h-[44px] w-[44px] flex items-center justify-center">
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      {/* Countdown Progress Bar */}
      <div className="h-1 bg-gray-100 w-full">
        <div 
          className={`h-full transition-all linear ${toast.type === 'undo' ? 'bg-yellow-500' : 'bg-[#008060]'}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
