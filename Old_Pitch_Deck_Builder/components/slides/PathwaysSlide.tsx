import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { SlideLayout } from '../SlideLayout';
import { deckData } from '../../data/deckData';

export const PathwaysSlide: React.FC<{ page: number, total: number }> = ({ page, total }) => {
  const { pathways } = deckData;

  return (
    <SlideLayout 
      pageNumber={page} 
      totalPages={total} 
      subtitle={pathways.subtitle} 
      title={pathways.title}
    >
      <div className="flex flex-col h-full justify-center">
        <div className="border-t border-evo-border">
          {pathways.options.map((opt, idx) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
              className={`group py-6 border-b border-evo-border flex flex-col md:flex-row gap-6 md:items-center relative hover:bg-evo-section transition-colors px-4 -mx-4 ${opt.highlight ? 'bg-amber-50/40 hover:bg-amber-50/70' : ''}`}
            >
              {/* ID & Title */}
              <div className="flex items-center gap-4 md:w-1/3 shrink-0">
                 <span className="text-2xl font-serif text-evo-border font-bold opacity-40 group-hover:text-evo-gold transition-colors">{opt.id}</span>
                 <h3 className="text-xl font-serif text-evo-text font-medium">{opt.title}</h3>
                 {opt.highlight && <CheckCircle2 className="w-5 h-5 text-evo-gold ml-2" />}
              </div>
              
              {/* Description */}
              <div className="md:w-1/2">
                <p className="text-evo-sub text-sm font-light leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              {/* Meta / Timeline */}
              <div className="md:w-1/6 flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-1 border-t md:border-t-0 border-dashed border-evo-border pt-2 md:pt-0 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-evo-gold" />
                  <span className="text-xs font-mono font-medium text-evo-text uppercase">
                    {opt.timeline}
                  </span>
                </div>
                <span className="text-[10px] text-evo-sub uppercase tracking-wider">{opt.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};