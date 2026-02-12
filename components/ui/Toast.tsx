'use client';

import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: 'bg-[var(--success)]/15 border-[var(--success)]/30 text-[var(--success)]',
    error: 'bg-[var(--danger)]/15 border-[var(--danger)]/30 text-[var(--danger)]',
    info: 'bg-[var(--info)]/15 border-[var(--info)]/30 text-[var(--info)]',
  };

  const icons = {
    success: <FiCheckCircle className="w-5 h-5" />,
    error: <FiXCircle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border shadow-lg w-full sm:min-w-[300px] sm:max-w-md ${styles[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-xs sm:text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-current opacity-70 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        aria-label="Close"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 space-y-2 flex flex-col items-end safe-top">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
