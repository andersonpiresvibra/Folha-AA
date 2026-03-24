import React from 'react';

import { Monitor, Smartphone } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  viewMode?: 'desktop' | 'mobile';
  setViewMode?: (mode: 'desktop' | 'mobile') => void;
}

export function Layout({
  children,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = 'AVANÇAR',
  backLabel = 'VOLTAR',
  hideHeader = false,
  hideFooter = false,
  viewMode = 'desktop',
  setViewMode,
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      {!hideHeader && (
        <header className="flex flex-col print:hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-700 text-white">
            <h1 className="text-lg font-semibold tracking-wide">SUPORTE FOLHA</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium tracking-widest opacity-80 border-l border-slate-600 pl-4 hidden sm:inline">
                AMERICAN AIRLINE
              </span>
            </div>
          </div>
          {subtitle && (
            <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium uppercase tracking-wider">
              {subtitle}
            </div>
          )}
        </header>
      )}

      <main className={`flex-1 flex flex-col relative ${viewMode === 'mobile' ? 'bg-slate-200 overflow-hidden' : 'overflow-y-auto'}`}>
        {viewMode === 'mobile' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div 
              className="bg-slate-50 shadow-2xl overflow-hidden relative border-[12px] border-slate-900 rounded-[2.5rem] transition-all duration-500 flex flex-col"
              style={{ 
                width: '844px', // iPhone 14 Pro landscape width
                height: '390px', // iPhone 14 Pro landscape height
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Speaker/Camera area (Dynamic Island simulation) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-900 rounded-r-md z-50 opacity-50"></div>
              
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {!hideFooter && (
        <footer className="flex justify-between items-center bg-slate-300 h-14 print:hidden">
          {onBack ? (
            <button
              onClick={onBack}
              className="h-full px-6 bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors uppercase tracking-wider text-sm"
            >
              {backLabel}
            </button>
          ) : (
            <div className="w-24"></div>
          )}
          
          {onNext ? (
            <button
              onClick={onNext}
              className="h-full px-6 bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors uppercase tracking-wider text-sm"
            >
              {nextLabel}
            </button>
          ) : (
            <div className="w-24"></div>
          )}
        </footer>
      )}
    </div>
  );
}
