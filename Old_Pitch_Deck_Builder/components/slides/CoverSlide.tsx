import React from 'react';
import { motion } from 'framer-motion';
import { deckData } from '../../data/deckData';

export const CoverSlide: React.FC<{ page: number; total: number }> = () => {
  const { cover } = deckData;

  return (
    <div className="w-full h-full flex flex-col justify-center items-start relative z-10 pl-8 md:pl-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="mb-6"
      >
        <span className="inline-block px-3 py-1 border border-evo-text text-evo-text text-xs font-mono uppercase tracking-widest mb-6">
          {cover.label}
        </span>
        <h1 className="text-6xl md:text-9xl font-serif font-medium text-evo-text tracking-tighter leading-[0.9]">
          {cover.titleLine1}<br />
          <span className="italic text-evo-gold">{cover.titleLine2}</span>
        </h1>
      </motion.div>

      <motion.div
         initial={{ width: 0 }}
         animate={{ width: 120 }}
         transition={{ delay: 0.8, duration: 1 }}
         className="h-1 bg-evo-text mb-8"
      />

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-evo-sub font-sans font-normal text-xl md:text-2xl max-w-xl leading-relaxed"
      >
        {cover.subtitle}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-16 text-sm font-mono text-evo-sub"
      >
        {cover.footer && <>{cover.footer}<br /></>}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
      </motion.div>
    </div>
  );
};