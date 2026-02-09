import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Disc, ListMusic, FileText } from 'lucide-react';
import { Vinyl } from '../types';
import { GENRES } from '../constants';
import { Theme } from '../App';

interface VinylFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vinyl: Omit<Vinyl, 'id' | 'addedAt'>) => void;
  initialData?: Vinyl;
  theme: Theme;
}

export const VinylForm: React.FC<VinylFormProps> = ({ isOpen, onClose, onSubmit, initialData, theme }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: new Date().getFullYear(),
    genre: GENRES[0],
    rating: 3,
    coverUrl: '',
    notes: '',
    videoUrl: '',
    additionalImages: '',
    format: '12" Vinyl / 33RPM',
    tracksSideA: '',
    tracksSideB: '',
    archiveDescription: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        artist: initialData.artist,
        year: initialData.year,
        genre: initialData.genre,
        rating: initialData.rating,
        coverUrl: initialData.coverUrl || '',
        notes: initialData.notes || '',
        videoUrl: initialData.videoUrl || '',
        additionalImages: initialData.additionalImages ? initialData.additionalImages.join(', ') : '',
        format: initialData.format || '12" Vinyl / 33RPM',
        tracksSideA: initialData.tracksSideA ? initialData.tracksSideA.join('\n') : '',
        tracksSideB: initialData.tracksSideB ? initialData.tracksSideB.join('\n') : '',
        archiveDescription: initialData.archiveDescription || ''
      });
    } else {
      setFormData({
        title: '',
        artist: '',
        year: new Date().getFullYear(),
        genre: GENRES[0],
        rating: 3,
        coverUrl: '',
        notes: '',
        videoUrl: '',
        additionalImages: '',
        format: '12" Vinyl / 33RPM',
        tracksSideA: '',
        tracksSideB: '',
        archiveDescription: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert strings back to arrays
    const imagesArray = formData.additionalImages
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const tracksA = formData.tracksSideA.split('\n').filter(s => s.trim().length > 0);
    const tracksB = formData.tracksSideB.split('\n').filter(s => s.trim().length > 0);

    onSubmit({
      ...formData,
      additionalImages: imagesArray,
      tracksSideA: tracksA,
      tracksSideB: tracksB
    });
    onClose();
  };

  const bgColor = theme === 'dark' ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const labelColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const inputBorder = theme === 'dark' ? 'border-gray-800 focus:border-white' : 'border-gray-300 focus:border-black';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 backdrop-blur-md ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'}`}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 p-8 md:p-12 ${bgColor}`}
          >
            <div className={`flex justify-between items-start mb-8 border-b pb-4 ${theme === 'dark' ? 'border-white' : 'border-black'}`}>
              <h2 className={`text-2xl font-light uppercase tracking-tight ${textColor}`}>
                {initialData ? 'Edit Entry' : 'New Entry'}
              </h2>
              <button 
                onClick={onClose}
                className={`${textColor} hover:opacity-50 transition-opacity`}
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Title</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                        placeholder="ALBUM NAME"
                    />
                    </div>
                    <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Artist</label>
                    <input
                        required
                        type="text"
                        value={formData.artist}
                        onChange={(e) => setFormData({...formData, artist: e.target.value})}
                        className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                        placeholder="ARTIST NAME"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Year</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                    />
                    </div>
                    <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Genre</label>
                    <select
                        value={formData.genre}
                        onChange={(e) => setFormData({...formData, genre: e.target.value})}
                        className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors appearance-none rounded-none ${textColor} ${inputBorder}`}
                    >
                        {GENRES.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                    </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Format</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.format}
                            onChange={(e) => setFormData({...formData, format: e.target.value})}
                            className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors pl-6 ${textColor} ${inputBorder}`}
                            placeholder='12" Vinyl'
                        />
                        <Disc className={`absolute left-0 top-1/2 -translate-y-1/2 ${labelColor}`} size={14} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Cover Image URL</label>
                    <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
                    className={`w-full bg-transparent border-b py-2 text-lg focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                    placeholder="HTTPS://..."
                    />
                </div>
              </div>

              {/* Tracklists */}
              <div className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${labelColor}`}>
                    <ListMusic size={12} /> Back Cover Tracklist
                </h3>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Side A (One per line)</label>
                        <textarea
                            value={formData.tracksSideA}
                            onChange={(e) => setFormData({...formData, tracksSideA: e.target.value})}
                            className={`w-full bg-transparent border p-2 text-sm focus:outline-none transition-colors h-32 font-mono ${textColor} ${inputBorder} ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
                            placeholder="Track 1&#10;Track 2&#10;Track 3"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Side B (One per line)</label>
                        <textarea
                            value={formData.tracksSideB}
                            onChange={(e) => setFormData({...formData, tracksSideB: e.target.value})}
                            className={`w-full bg-transparent border p-2 text-sm focus:outline-none transition-colors h-32 font-mono ${textColor} ${inputBorder} ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
                            placeholder="Track 1&#10;Track 2&#10;Track 3"
                        />
                    </div>
                </div>
              </div>

              {/* Media Archive Description */}
              <div className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${labelColor}`}>
                      <FileText size={12} /> Media Archive Description
                  </h3>
                  <div className="space-y-2">
                      <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Custom Editorial Text</label>
                      <textarea
                          value={formData.archiveDescription}
                          onChange={(e) => setFormData({...formData, archiveDescription: e.target.value})}
                          className={`w-full bg-transparent border p-3 text-sm focus:outline-none transition-colors h-32 leading-relaxed ${textColor} ${inputBorder} ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}
                          placeholder="Leave empty to use auto-generated description..."
                      />
                      <p className={`text-[9px] ${labelColor}`}>Overrides the "ON [DATE], THE ARTIST..." text in the immersive view.</p>
                  </div>
              </div>

              {/* Media Section */}
              <div className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${labelColor}`}>Media Assets</h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 text-[10px] font-mono uppercase ${labelColor}`}>
                            <Video size={12} /> Video URL (YouTube Embed)
                        </label>
                        <input
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                            className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                            placeholder="https://www.youtube.com/embed/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 text-[10px] font-mono uppercase ${labelColor}`}>
                            <ImageIcon size={12} /> Additional Images (Comma separated URLs)
                        </label>
                        <textarea
                            value={formData.additionalImages}
                            onChange={(e) => setFormData({...formData, additionalImages: e.target.value})}
                            className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                            rows={3}
                            placeholder="https://img1.jpg, https://img2.jpg"
                        />
                    </div>
                </div>
              </div>

              {/* Notes & Rating */}
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>General Notes</label>
                    <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={`w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors ${textColor} ${inputBorder}`}
                    rows={2}
                    placeholder="Condition notes, edition details..."
                    />
                </div>

                <div className="space-y-2 pt-2">
                    <label className={`text-[10px] font-mono uppercase ${labelColor}`}>Rating</label>
                    <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className={`text-2xl transition-all hover:scale-110 ${
                            star <= formData.rating ? textColor : 'text-gray-500'
                        }`}
                        >
                        ★
                        </button>
                    ))}
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-8 gap-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${labelColor} hover:text-current transition-colors text-xs tracking-widest uppercase`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-8 py-3 text-xs font-bold tracking-widest transition-colors uppercase ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  {initialData ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};