'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
}

const sizes = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
};

const CloseIcon = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className 
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} as="div" className="relative z-50">
      <DialogBackdrop 
        transition 
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300 ease-out data-[closed]:opacity-0" 
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel 
            transition
            className={clsx(
              'relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-800 text-left shadow-xl transition-all duration-300 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 sm:my-8 w-full',
              sizes[size],
              className
            )}
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
            
            {title && (
              <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-700">
                {title}
              </DialogTitle>
            )}
            
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
} 