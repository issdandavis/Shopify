import React, { useEffect } from 'react';
import { XIcon, CheckCircleIcon, InfoIcon, SparklesIcon } from './Icons.tsx';

export type ToastType = 'success' | 'error' | 'info' | 'aws';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-500" checked={true} />;
      case 'aws': return <SparklesIcon className="w-5 h-5 text-blue-500" />;
      case 'error': return <XIcon className="w-5 h-5 text-red-500" />;
      default: return <InfoIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="pointer-events-auto bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px] animate-fade-in-up">
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-bold text-gray-800 flex-1">{toast.text}</p>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 p-1">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};