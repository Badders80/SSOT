import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, CreditCard, UserCheck } from 'lucide-react';
import { SlideLayout } from '../SlideLayout';
import { deckData } from '../../data/deckData';

export const PurposeSlide: React.FC<{ page: number, total: number }> = ({ page, total }) => {
  const { purpose } = deckData;

  const icons = [
    <UserCheck className="w-6 h-6 text-evo-text" />,
    <LayoutGrid className="w-6 h-6 text-evo-text" />,
    <CreditCard className="w-6 h-6 text-evo-text" />
  ];

  return (
    <SlideLayout 
      pageNumber={page} 
      totalPages={total} 
      subtitle={purpose.subtitle} 
      title={purpose.title}
    >
      <div className="flex flex-col gap-12 h-full justify-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-xl md:text-2xl text-evo-text font-serif leading-relaxed max-w-4xl border-l-2 border-evo-gold pl-6"
        >
          {purpose.mainText}
        </motion.p>

        <div className="flex flex-col border border-evo-border rounded-sm bg-white">
          {purpose.features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1), duration: 0.6 }}
              className={`group relative p-8 transition-colors duration-500 hover:bg-evo-section ${idx !== purpose.features.length - 1 ? 'border-b border-evo-border' : ''}`}
            >
              <div className="flex items-start md:items-center gap-6">
                <div className="w-12 h-12 border border-evo-border rounded-full flex items-center justify-center bg-evo-bg group-hover:bg-evo-gold group-hover:text-white transition-colors duration-300 shrink-0 shadow-sm">
                  {icons[idx]}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-serif text-evo-text mb-2 font-medium">{item.title}</h3>
                  <p className="text-evo-sub font-sans font-light leading-relaxed text-sm max-w-2xl">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};