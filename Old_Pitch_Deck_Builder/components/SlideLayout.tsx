import React from 'react';
import { motion } from 'framer-motion';

interface SlideLayoutProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
  title?: string;
  subtitle?: string;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({ 
  children, 
  pageNumber, 
  totalPages,
  title,
  subtitle
}) => {
  return (
    <div className="w-full h-full relative flex flex-col p-8 md:p-12 max-w-7xl mx-auto bg-evo-bg">
      {/* Top Border Line */}
      <div className="absolute top-8 left-8 right-8 h-[1px] bg-evo-text" />

      {/* Header */}
      <header className="flex justify-between items-start mt-6 mb-12">
        <div className="flex flex-col">
          {subtitle && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="w-2 h-2 bg-evo-gold rounded-full"></span>
              <span className="text-evo-sub text-xs uppercase tracking-[0.15em] font-mono font-medium">
                {subtitle}
              </span>
            </motion.div>
          )}
          {title && (
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-serif text-evo-text font-normal leading-tight tracking-tight"
            >
              {title}
            </motion.h1>
          )}
        </div>
        <div className="hidden md:block text-right">
           <div className="text-evo-text font-serif text-xl font-bold tracking-tight">
              EVOLUTION<span className="text-evo-gold italic">stables</span>
           </div>
           <div className="text-[10px] uppercase tracking-widest text-evo-sub mt-1">
             Strategic Briefing
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 flex flex-col justify-center">
        {children}
      </main>

      {/* Footer / Pagination */}
      <footer className="mt-8 flex justify-between items-end border-t border-evo-border pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-evo-sub text-[10px] font-mono tracking-wide uppercase">
            Strictly Private & Confidential
          </span>
          <span className="text-evo-border text-[10px] font-mono">
            ID: ES-2025-Q1-REF
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-evo-text font-mono text-sm">
             {String(pageNumber).padStart(2, '0')}
           </span>
           <div className="w-8 h-[1px] bg-evo-border"></div>
           <span className="text-evo-sub font-mono text-sm">
             {String(totalPages).padStart(2, '0')}
           </span>
        </div>
      </footer>
      
      {/* Background Grid (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[size:40px_40px] bg-grid-pattern z-0 mix-blend-multiply"></div>
    </div>
  );
};