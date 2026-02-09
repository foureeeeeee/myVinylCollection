import React, { useState, useMemo } from 'react';
import { Vinyl } from '../types';
import { VinylCard } from './VinylCard';
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react';
import { GENRES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '../App';

interface CollectionProps {
  collection: Vinyl[];
  onEdit: (vinyl: Vinyl) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  theme: Theme;
}

export const Collection: React.FC<CollectionProps> = ({ collection, onEdit, onDelete, onAddNew, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...collection];
    if (filterGenre !== 'All') {
      result = result.filter(v => v.genre === filterGenre);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(lower) || 
        v.artist.toLowerCase().includes(lower)
      );
    }
    result.sort((a, b) => b.addedAt - a.addedAt);
    return result;
  }, [collection, filterGenre, searchTerm]);

  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const dimColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const bgColor = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-[#111] border-gray-800' : 'bg-gray-50 border-gray-200';
  const buttonBorder = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen pt-32 pb-20 px-6 md:px-12 ${bgColor} transition-colors duration-500`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className={`text-4xl md:text-5xl font-light uppercase tracking-tighter mb-2 ${textColor}`}>Index</h1>
          <p className={`text-[10px] font-mono uppercase tracking-widest pl-1 ${dimColor}`}>
            Database_Size: {collection.length} // Filtered: {filteredAndSorted.length}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
          
          {/* Search Bar */}
          <div className="relative group w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search Index..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border-b py-2.5 pl-3 pr-8 text-xs uppercase font-medium placeholder-gray-500 focus:outline-none focus:border-current transition-all ${inputBg} ${textColor}`}
            />
            {searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-current">
                <X size={14} />
              </button>
            ) : (
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border text-[10px] uppercase tracking-widest font-bold transition-all ${showFilters ? 'bg-current text-white border-transparent invert' : `${textColor} ${buttonBorder} hover:border-current`}`}
            >
              <SlidersHorizontal size={12} />
              Filter
            </button>

            <button 
              onClick={onAddNew}
              className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <Plus size={12} />
              Entry
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mb-12"
          >
            <div className={`flex flex-wrap gap-2 pb-4 pt-2 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <button 
                onClick={() => setFilterGenre('All')}
                className={`px-3 py-1 text-[10px] uppercase tracking-widest border rounded-full transition-all ${filterGenre === 'All' ? 'bg-current text-white invert border-transparent' : `bg-transparent ${dimColor} ${buttonBorder} hover:border-current hover:text-current`}`}
              >
                All
              </button>
              {GENRES.map(g => (
                <button 
                  key={g}
                  onClick={() => setFilterGenre(g)}
                  className={`px-3 py-1 text-[10px] uppercase tracking-widest border rounded-full transition-all ${filterGenre === g ? 'bg-current text-white invert border-transparent' : `bg-transparent ${dimColor} ${buttonBorder} hover:border-current hover:text-current`}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12"
      >
        <AnimatePresence mode='popLayout'>
          {filteredAndSorted.map((vinyl, idx) => (
            <VinylCard 
              key={vinyl.id} 
              vinyl={vinyl} 
              index={idx}
              onEdit={onEdit}
              onDelete={onDelete}
              theme={theme}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSorted.length === 0 && (
        <div className={`py-20 text-center flex flex-col items-center justify-center gap-4 ${dimColor}`}>
          <Search size={32} strokeWidth={1} className="opacity-20" />
          <p className="text-xs uppercase tracking-widest">No matching records found in archive.</p>
        </div>
      )}
    </div>
  );
};