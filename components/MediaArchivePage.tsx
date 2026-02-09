import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Vinyl } from '../types';
import { X, ArrowUpRight } from 'lucide-react';

interface MediaArchivePageProps {
  vinyl: Vinyl;
  onClose: () => void;
}

export const MediaArchivePage: React.FC<MediaArchivePageProps> = ({ vinyl, onClose }) => {
  
  // Aggregate all media into a single array for the grid
  const mediaItems = useMemo(() => {
    const items: { type: 'video' | 'image', url: string }[] = [];
    
    // Add Video
    if (vinyl.videoUrl) {
      items.push({ type: 'video', url: vinyl.videoUrl });
    }
    
    // Add Cover (as fallback or primary if no others)
    if (vinyl.coverUrl) {
      items.push({ type: 'image', url: vinyl.coverUrl });
    }

    // Add Additional Images
    if (vinyl.additionalImages) {
      vinyl.additionalImages.forEach(img => {
        items.push({ type: 'image', url: img });
      });
    }

    // Ensure we have an even number for the 50/50 split layout
    // If odd, duplicate the first image/video at the end or add a placeholder
    if (items.length % 2 !== 0 && items.length > 0) {
        items.push(items[0]); 
    }

    return items;
  }, [vinyl]);

  // Description Text Logic: Use custom if available, else generated template
  const descriptionText = useMemo(() => {
     if (vinyl.archiveDescription) return vinyl.archiveDescription;

     return `ON ${new Date(vinyl.addedAt).toLocaleDateString()}, THE ARTIST KNOWN AS ${vinyl.artist} WAS CATALOGED INTO THE SYSTEM. THE RECORD, TITLED "${vinyl.title}", RELEASED IN ${vinyl.year}, REPRESENTS A FRAGMENT OF AUDIO HISTORY PRESERVED IN VINYL FORMAT. THIS VISUAL ARCHIVE DECONSTRUCTS THE PHYSICAL ARTIFACT INTO ITS VISUAL COMPONENTS, STRIPPING AWAY COLOR TO REVEAL TEXTURE, FORM, AND THE RAW AESTHETIC OF THE ERA (${vinyl.genre}).\n\n${vinyl.notes ? `NOTES: ${vinyl.notes.toUpperCase()}` : "NO SPECIFIC ARCHIVAL NOTES ATTACHED."}`;
  }, [vinyl]);

  return (
    <div className="min-h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* 1. Header / Text Section (Pure White) */}
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

      {/* 2. Visual Content Area (50/50 Split) */}
      <section className="relative w-full bg-black z-10">
         {/* Global Grain Overlay for the visual section */}
         <div className="absolute inset-0 opacity-20 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
         
         <div className="flex flex-col w-full">
            {/* Create rows of 2 items */}
            {Array.from({ length: Math.ceil(mediaItems.length / 2) }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex flex-col md:flex-row w-full h-[50vh] md:h-screen">
                    {[0, 1].map((offset) => {
                        const item = mediaItems[rowIndex * 2 + offset];
                        if (!item) return null;

                        return (
                            <div key={offset} className="relative w-full md:w-1/2 h-full overflow-hidden border-b md:border-b-0 border-white/10 grayscale contrast-125 hover:grayscale-0 hover:contrast-100 transition-all duration-700">
                                {item.type === 'video' ? (
                                    <div className="w-full h-full relative">
                                        <iframe 
                                            src={`${item.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.url.split('/').pop()}`}
                                            className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover grayscale brightness-75 contrast-125"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                        {/* Block interaction to keep it atmospheric */}
                                        <div className="absolute inset-0 z-10 bg-transparent" />
                                    </div>
                                ) : (
                                    <motion.img 
                                        initial={{ scale: 1.1 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        src={item.url} 
                                        className="w-full h-full object-cover brightness-90 contrast-125"
                                    />
                                )}
                                
                                {/* Corner Marker */}
                                <div className="absolute bottom-4 left-4 z-20 text-[9px] font-mono text-white/50 uppercase tracking-widest border border-white/20 px-2 py-1">
                                    FIG. {rowIndex * 2 + offset + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
         </div>
      </section>
      
      {/* Footer / End Mark */}
      <div className="w-full py-12 bg-white flex justify-center items-center">
          <div className="w-2 h-2 bg-black rounded-full" />
      </div>
    </div>
  );
};