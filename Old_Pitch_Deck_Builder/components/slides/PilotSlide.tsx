import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, HeartHandshake, ArrowRight } from 'lucide-react';
import { SlideLayout } from '../SlideLayout';
import { deckData } from '../../data/deckData';

export const PilotSlide: React.FC<{ page: number, total: number }> = ({ page, total }) => {
  const { pilot } = deckData;
  const icons = [
    <Target className="w-5 h-5" />,
    <Zap className="w-5 h-5" />,
    <HeartHandshake className="w-5 h-5" />
  ];

  return (
    <SlideLayout 
      pageNumber={page} 
      totalPages={total} 
      subtitle={pilot.subtitle} 
      title={pilot.title}
    >
      <div className="flex flex-col h-full justify-between">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 border-b border-evo-border pb-8"
        >
          <p className="text-2xl md:text-3xl text-evo-text font-serif leading-tight">
            {pilot.mainTextPart1}<span className="italic text-evo-gold">{pilot.highlightText}</span>{pilot.mainTextPart2}
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {pilot.grid.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (idx * 0.2), duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-6 border-l-2 border-evo-border hover:border-evo-gold transition-colors bg-white hover:bg-evo-section group"
            >
              <div className="md:w-1/4 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-evo-section rounded-full border border-evo-border text-evo-text group-hover:bg-evo-gold group-hover:text-white transition-colors">
                  {icons[idx]}
                </div>
                <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-evo-text">{item.label}</h3>
              </div>
              <div className="md:w-3/4">
                <p className="text-evo-sub font-serif text-lg leading-relaxed">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-8 flex justify-end items-center gap-6 border-t border-evo-border pt-8"
        >
          <div className="text-right">
             <span className="block text-xs font-mono text-evo-sub uppercase">{pilot.actionLabel}</span>
             <span className="text-lg font-serif text-evo-text font-bold">{pilot.actionValue}</span>
          </div>
          <button className="group flex items-center gap-3 px-8 py-4 bg-evo-text text-white font-mono text-xs font-bold tracking-widest uppercase hover:bg-evo-gold transition-colors duration-300 shadow-lg">
            {pilot.buttonText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </SlideLayout>
  );
};