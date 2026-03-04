import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, FileText } from 'lucide-react';
import { SlideLayout } from '../SlideLayout';
import { deckData } from '../../data/deckData';

export const RegulatorySlide: React.FC<{ page: number, total: number }> = ({ page, total }) => {
  const { regulatory } = deckData;
  const icons = [
    <ShieldCheck className="text-evo-text w-6 h-6" />,
    <Scale className="text-evo-text w-6 h-6" />
  ];

  return (
    <SlideLayout 
      pageNumber={page} 
      totalPages={total} 
      subtitle={regulatory.subtitle} 
      title={regulatory.title}
    >
      <div className="flex flex-col gap-10 h-full justify-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-evo-sub text-lg max-w-3xl border-l-4 border-evo-gold pl-6"
        >
          {regulatory.mainText}
        </motion.p>

        <div className="flex flex-col gap-6">
          {regulatory.blocks.map((block, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.2), duration: 0.6 }}
              className="bg-white border border-evo-border p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-evo-section rounded-full border border-evo-border">
                       {icons[idx]}
                    </div>
                    <h3 className="text-xl font-serif text-evo-text font-bold">{block.title}</h3>
                  </div>
                  <p className="text-evo-sub font-light leading-relaxed text-sm max-w-2xl">
                    {block.text}
                  </p>
                </div>
                
                <div className="flex md:flex-col md:items-end justify-between items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-evo-border md:border-l md:pl-8 min-w-[200px]">
                  <span className="text-xs font-mono text-evo-sub uppercase">{block.statusLabel}</span>
                  <span className="text-xs font-bold text-evo-text bg-evo-section px-3 py-1.5 rounded border border-evo-border">{block.statusValue}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Exemption Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-evo-section p-6 border border-evo-border flex gap-6 items-start mt-4"
        >
           <div className="hidden sm:block p-3 bg-white border border-evo-border rounded-full shrink-0">
             <FileText className="text-evo-text w-5 h-5" />
           </div>
           <div>
             <h4 className="text-evo-text font-serif text-lg mb-2">{regulatory.note.title}</h4>
             <p className="text-evo-sub text-sm font-light leading-relaxed">
               {regulatory.note.text}
             </p>
           </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};