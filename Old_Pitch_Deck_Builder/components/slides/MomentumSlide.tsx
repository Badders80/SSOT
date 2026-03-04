import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe2 } from 'lucide-react';
import { SlideLayout } from '../SlideLayout';
import { deckData } from '../../data/deckData';

export const MomentumSlide: React.FC<{ page: number, total: number }> = ({ page, total }) => {
  const { momentum } = deckData;
  const icons = [
    <TrendingUp className="text-evo-gold w-5 h-5" />,
    <Globe2 className="text-evo-gold w-5 h-5" />
  ];

  return (
    <SlideLayout 
      pageNumber={page} 
      totalPages={total} 
      subtitle={momentum.subtitle} 
      title={momentum.title}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full">
        
        {/* Left Column: Narrative */}
        <div className="space-y-8 pr-8 border-r border-evo-border h-full">
           <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
           >
             <h3 className="text-2xl font-serif text-evo-text mb-4">{momentum.leftCol.heading}</h3>
             <p className="text-evo-sub font-sans leading-relaxed text-lg">
               {momentum.leftCol.text}
             </p>
           </motion.div>

           <div className="space-y-6 pt-8 border-t border-evo-border">
             {momentum.leftCol.stats.map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.2), duration: 0.6 }}
                  className="flex gap-4 items-start"
                >
                    <div className="p-2 border border-evo-border rounded-sm shrink-0 bg-evo-section">
                      {icons[idx]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-serif text-evo-text mb-1">{stat.label}</h4>
                      <p className="text-sm text-evo-sub font-light max-w-md">{stat.text}</p>
                    </div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* Right Column: Upcoming */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative h-full flex flex-col justify-start"
        >
          <div className="bg-evo-section border border-evo-border p-8 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-evo-border">
              <h3 className="text-xl font-serif text-evo-text uppercase tracking-wide">{momentum.rightCol.heading}</h3>
              <span className="text-xs font-mono text-evo-sub">{momentum.rightCol.subHeading}</span>
            </div>
            
            <ul className="space-y-4">
              {momentum.rightCol.listings.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center py-4 border-b border-evo-border last:border-0 hover:bg-white px-2 transition-colors cursor-pointer group">
                  <span className="text-evo-text font-serif text-lg group-hover:text-evo-gold transition-colors">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-evo-sub font-mono text-xs uppercase tracking-wide">{item.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};