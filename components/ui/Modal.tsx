'use client';

import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm safe-top safe-bottom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] rounded-t-3xl sm:rounded-xl md:rounded-2xl shadow-2xl ${sizes[size]} w-full h-[75vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-4 md:p-6 border-b border-[var(--border)] bg-[var(--card)] z-10 flex-shrink-0 rounded-t-3xl sm:rounded-t-xl">
            {title && (
              <h2 id="modal-title" className="text-xl sm:text-xl md:text-2xl font-bold text-[var(--foreground)] pr-2">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6 pb-0 sm:pb-6 md:pb-6 safe-bottom flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
