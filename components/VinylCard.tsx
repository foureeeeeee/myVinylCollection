import React from 'react';
import { motion } from 'framer-motion';
import { Vinyl } from '../types';
import { Disc, Edit2, Trash2 } from 'lucide-react';
import { Theme } from '../App';

interface VinylCardProps {
  vinyl: Vinyl;
  onEdit: (vinyl: Vinyl) => void;
  onDelete: (id: string) => void;
  index: number;
  theme?: Theme; // Optional as standard grid usage might not pass it, but Collection does
}

export const VinylCard: React.FC<VinylCardProps> = ({ vinyl, onEdit, onDelete, index, theme = 'light' }) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="group cursor-pointer flex flex-col gap-4"
      onClick={() => onEdit(vinyl)}
    >
      <div className={`relative aspect-square overflow-hidden ${cardBg} shadow-sm group-hover:shadow-xl transition-shadow duration-500`}>
        {vinyl.coverUrl ? (
          <motion.img 
            src={vinyl.coverUrl} 
            alt={vinyl.title} 
            className="w-full h-full object-cover will-change-transform"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Disc size={40} strokeWidth={1} />
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
        
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
             className={`p-1.5 rounded-full backdrop-blur-md ${theme === 'dark' ? 'bg-black/50 text-white hover:bg-black' : 'bg-white/50 text-black hover:bg-white'}`}
             title="Edit"
          >
             <Edit2 size={12} />
          </button>
          <button 
             onClick={(e) => {
               e.stopPropagation();
               if(confirm('Delete this record?')) onDelete(vinyl.id);
             }}
             className={`p-1.5 rounded-full backdrop-blur-md hover:text-red-500 ${theme === 'dark' ? 'bg-black/50 text-white hover:bg-black' : 'bg-white/50 text-black hover:bg-white'}`}
             title="Delete"
          >
             <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-baseline gap-2">
           <h3 className={`text-sm font-bold uppercase leading-tight truncate ${textColor}`}>{vinyl.title}</h3>
        </div>
        
        <div className={`flex justify-between items-center text-xs ${subTextColor}`}>
          <p className="truncate uppercase tracking-wide max-w-[70%]">{vinyl.artist}</p>
          <span className="font-mono text-[10px] opacity-60">{vinyl.year}</span>
        </div>
        
        <div className={`mt-1 pt-2 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{vinyl.genre}</span>
          <div className={`flex text-[9px] ${textColor}`}>
            {"★".repeat(vinyl.rating)}<span className="text-gray-600">{"★".repeat(5-vinyl.rating)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};