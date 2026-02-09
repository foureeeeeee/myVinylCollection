import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { getAIRecommendations } from '../services/geminiService';
import { Vinyl, RecommendationResponse } from '../types';
import { Theme } from '../App';

interface AIRecommenderProps {
  collection: Vinyl[];
  theme: Theme;
}

export const AIRecommender: React.FC<AIRecommenderProps> = ({ collection, theme }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const topAlbums = collection
        .filter(v => v.rating >= 4)
        .map(v => `${v.title} by ${v.artist}`)
        .slice(0, 5)
        .join(', ');

      const context = topAlbums ? `User likes: ${topAlbums}` : "User is new to collecting.";
      
      const results = await getAIRecommendations(query, context);
      setRecommendations(results);
    } catch (err) {
      setError('Connection refused. Verify API link.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Highest rated albums of all time",
    "Jazz for a rainy Sunday",
    "Obscure 80s Synthpop",
    "Modern psychedelic rock"
  ];

  const bgColor = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const dimColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/10';
  const inputBorder = theme === 'dark' ? 'border-white/10 focus:border-white' : 'border-black/10 focus:border-black';
  const suggestionBorder = theme === 'dark' ? 'border-white/10 hover:border-white' : 'border-gray-200 hover:border-black';

  return (
    <div className={`min-h-screen pt-32 pb-20 px-6 md:px-12 ${bgColor} transition-colors duration-500`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24 max-w-4xl"
      >
        <p className={`${dimColor} font-mono text-[10px] uppercase tracking-widest mb-6`}>AI Research Module</p>
        
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="INPUT QUERY PARAMETERS..." 
            className={`w-full bg-transparent border-b-2 py-6 text-2xl md:text-5xl font-light placeholder-gray-600 focus:outline-none transition-colors uppercase ${textColor} ${inputBorder}`}
          />
          <button 
            type="submit"
            disabled={loading}
            className={`absolute right-0 top-1/2 -translate-y-1/2 hover:opacity-50 transition-opacity ${textColor}`}
          >
            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <ArrowRight className="w-8 h-8" strokeWidth={1} />}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-4">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => { setQuery(s); }}
              className={`text-[10px] ${dimColor} border px-4 py-2 hover:text-current transition-colors uppercase tracking-widest ${suggestionBorder}`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {error && (
        <div className="text-red-500 font-mono text-xs border border-red-200 bg-red-50 p-4 mb-12 uppercase">
          > ERROR: {error}
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 border-t pt-12 ${borderColor}`}>
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`${dimColor} font-mono text-[10px]`}>0{idx + 1}</span>
              <span className={`${dimColor} font-mono text-[10px]`}>{rec.year}</span>
            </div>
            
            <h3 className={`text-2xl font-medium leading-tight mb-1 uppercase ${textColor}`}>{rec.album}</h3>
            <p className={`text-sm mb-6 uppercase tracking-wide ${dimColor}`}>{rec.artist}</p>
            
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm leading-relaxed mb-6 font-light`}>
              {rec.reason}
            </p>
            
            <div className={`flex justify-between items-center border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
               <span className={`text-[10px] font-bold uppercase tracking-widest ${dimColor}`}>
                 {rec.genre}
               </span>
               <button className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest border-b pb-0.5 ${textColor} ${theme === 'dark' ? 'border-white' : 'border-black'}`}>
                 Search External
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};