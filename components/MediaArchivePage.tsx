import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vinyl } from '../types';
import { X, Maximize2 } from 'lucide-react';

interface MediaArchivePageProps {
  vinyl: Vinyl;
  onClose: () => void;
}

export const MediaArchivePage: React.FC<MediaArchivePageProps> = ({ vinyl, onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'video' | 'image', url: string } | null>(null);
  
  // Aggregate all media into a single array
  const mediaItems = useMemo(() => {
    const items: { type: 'video' | 'image', url: string }[] = [];
    
    // Add Video - Strict check for valid non-empty string
    if (vinyl.videoUrl && vinyl.videoUrl.trim().length > 0) {
      items.push({ type: 'video', url: vinyl.videoUrl.trim() });
    }
    
    // Add Cover
    if (vinyl.coverUrl && vinyl.coverUrl.trim().length > 0) {
      items.push({ type: 'image', url: vinyl.coverUrl.trim() });
    }

    // Add Additional Images
    if (vinyl.additionalImages) {
      vinyl.additionalImages.forEach(img => {
        if (img && img.trim().length > 0) {
            items.push({ type: 'image', url: img.trim() });
        }
      });
    }

    return items;
  }, [vinyl]);

  // Description Text Logic
  const descriptionText = useMemo(() => {
     if (vinyl.archiveDescription) return vinyl.archiveDescription;

     return `ON ${new Date(vinyl.addedAt).toLocaleDateString()}, THE ARTIST KNOWN AS ${vinyl.artist} WAS CATALOGED INTO THE SYSTEM. THE RECORD, TITLED "${vinyl.title}", RELEASED IN ${vinyl.year}, REPRESENTS A FRAGMENT OF AUDIO HISTORY PRESERVED IN VINYL FORMAT. THIS VISUAL ARCHIVE DECONSTRUCTS THE PHYSICAL ARTIFACT INTO ITS VISUAL COMPONENTS. (${vinyl.genre}).\n\n${vinyl.notes ? `NOTES: ${vinyl.notes.toUpperCase()}` : "NO SPECIFIC ARCHIVAL NOTES ATTACHED."}`;
  }, [vinyl]);

  // Robust YouTube URL parser
  const getVideoSrc = (url: string) => {
    try {
        if (!url) return '';
        
        let videoId = '';
        
        // Handle standard youtube.com/watch?v=ID
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } 
        // Handle youtu.be/ID
        else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        // Handle youtube.com/embed/ID
        else if (url.includes('/embed/')) {
             videoId = url.split('/embed/')[1].split('?')[0];
        }
        // Handle youtube.com/shorts/ID
        else if (url.includes('/shorts/')) {
            videoId = url.split('/shorts/')[1].split('?')[0];
        }
        
        // If we found an ID, construct embed URL.
        if (videoId) {
            // controls=1 allows user to play/pause if autoplay fails. 
            // rel=0 prevents showing unrelated videos at end.
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0`;
        }
        
        // If it's already an embed URL without parameters, return as is or append params
        if (url.includes('youtube.com/embed')) {
            return url;
        }

        return url;
    } catch (e) {
        return url;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* 1. Header / Text Section */}
      <section className="relative w-full px-6 py-12 md:px-12 md:py-24 bg-white z-20">
        
        {/* Navigation / Close */}
        <div className="fixed top-6 right-6 z-50 mix-blend-difference">
             <button 
                onClick={onClose}
                className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
             >
                <span>Close Archive</span>
                <X size={14} className="border border-white rounded-full p-0.5" />
             </button>
        </div>

        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
            {/* Left: Project Title */}
            <div className="flex flex-col justify-between h-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-xs md:text-sm font-bold font-mono uppercase tracking-widest mb-2">
                        GROOVE VAULT ®
                    </h1>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                        ARCHIVE REF: {vinyl.id.slice(0, 8).toUpperCase()}
                    </p>
                </motion.div>
            </div>

            {/* Right: Description Text */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono text-[10px] md:text-xs leading-relaxed md:leading-loose uppercase max-w-xl whitespace-pre-wrap"
            >
                {descriptionText}
            </motion.div>
        </div>
      </section>

      {/* 2. Visual Content Area */}
      <section className="relative w-full bg-black z-10 min-h-screen">
         {/* Global Grain Overlay */}
         <div className="absolute inset-0 opacity-20 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
         
         <div className="grid grid-cols-1 md:grid-cols-2 w-full">
            {mediaItems.map((item, index) => {
               // If total items is odd, make the last one span full width for better layout
               const isLastAndOdd = (index === mediaItems.length - 1) && (mediaItems.length % 2 !== 0);
               
               return (
                   <div 
                     key={index} 
                     className={`relative w-full h-[50vh] md:h-screen overflow-hidden border-b border-white/10 md:border-r ${isLastAndOdd ? 'md:col-span-2 md:border-r-0' : ''}`}
                   >
                        {item.type === 'video' ? (
                            <div className="w-full h-full relative group bg-black">
                                <iframe 
                                    src={getVideoSrc(item.url)}
                                    className="w-full h-full absolute top-0 left-0 object-cover"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`Archive Video ${index + 1}`}
                                />
                                {/* Expand Button for Video */}
                                <button 
                                    onClick={() => setSelectedMedia(item)}
                                    className="absolute top-4 right-4 z-30 p-2.5 bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-105"
                                    title="Expand Video"
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <motion.div 
                                className="w-full h-full relative cursor-zoom-in group"
                                onClick={() => setSelectedMedia(item)}
                            >
                                <motion.img 
                                    initial={{ scale: 1.1 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    src={item.url} 
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                {/* Hover Overlay Hint */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </motion.div>
                        )}
                        
                        {/* Corner Marker */}
                        <div className="absolute bottom-4 left-4 z-20 text-[9px] font-mono text-white/50 uppercase tracking-widest border border-white/20 px-2 py-1 bg-black/50 backdrop-blur-sm pointer-events-none">
                            FIG. {index + 1}
                        </div>
                   </div>
               );
            })}
         </div>

         {mediaItems.length === 0 && (
             <div className="w-full h-screen flex items-center justify-center text-white/30 font-mono text-xs uppercase tracking-widest">
                 No Visual Media Archived
             </div>
         )}
      </section>
      
      {/* Footer / End Mark */}
      <div className="w-full py-12 bg-white flex justify-center items-center">
          <div className="w-2 h-2 bg-black rounded-full" />
      </div>

      {/* --- Fullscreen Modal --- */}
      <AnimatePresence>
        {selectedMedia && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
                onClick={() => setSelectedMedia(null)}
            >
                {/* Close Button */}
                <button 
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] p-2 hover:bg-white/10 rounded-full"
                    onClick={() => setSelectedMedia(null)}
                >
                    <X size={32} strokeWidth={1} />
                </button>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center pointer-events-none"
                >
                    <div 
                        className="w-full h-full flex items-center justify-center pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedMedia.type === 'video' ? (
                            <div className="w-full aspect-video bg-black shadow-2xl border border-white/10">
                                <iframe 
                                    src={getVideoSrc(selectedMedia.url)}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <img 
                                src={selectedMedia.url} 
                                className="max-w-full max-h-full object-contain shadow-2xl"
                                alt="Expanded View"
                            />
                        )}
                    </div>
                </motion.div>
                
                {/* Modal Footer Info */}
                <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
                    <p className="text-white/40 font-mono text-[9px] uppercase tracking-[0.2em]">
                        {selectedMedia.type === 'video' ? 'Video Playback // External Source' : 'High Resolution Asset // Detailed View'}
                    </p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};