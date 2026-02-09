import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Reorder } from 'framer-motion';
import { Vinyl } from '../types';
import { Disc, MousePointer2, ZoomIn, ZoomOut, GripHorizontal } from 'lucide-react';
import { Theme } from '../App';

interface VinylShelfProps {
  collection: Vinyl[];
  theme: Theme;
  onVinylSelect?: (id: string) => void;
  onReorder?: (newOrder: Vinyl[]) => void;
}

export const VinylShelf: React.FC<VinylShelfProps> = ({ collection, theme, onVinylSelect, onReorder }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedVinyl, setSelectedVinyl] = useState<Vinyl | null>(null);
  const [zoom, setZoom] = useState(1);

  // Background Styles
  const pageBg = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#f4f4f4]'; 
  const textCol = theme === 'dark' ? 'text-gray-100' : 'text-[#1c1c1e]';
  const glassBorder = theme === 'dark' ? 'border-white/10' : 'border-black/5';

  const handleCardClick = (vinyl: Vinyl) => {
    setSelectedVinyl(vinyl);
    
    // Animate to center then trigger navigation
    setTimeout(() => {
        if (onVinylSelect) {
            onVinylSelect(vinyl.id);
        }
    }, 600);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 1.8));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

  // Add Wheel/Pinch support for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(z => Math.min(Math.max(z + delta, 0.5), 1.8));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className={`h-screen w-full relative overflow-hidden ${pageBg} transition-colors duration-500`}>
      {/* Background Gradient / Atmosphere */}
      <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${theme === 'dark' ? 'from-gray-800/10 via-transparent to-transparent' : 'from-gray-300/20 via-transparent to-transparent'}`} />
      
      {/* Noise Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Header (Fixed) */}
      <div className="absolute top-24 left-6 md:left-12 z-20 pointer-events-none mix-blend-difference select-none">
        <h1 className={`text-6xl md:text-8xl font-light uppercase tracking-tighter mb-2 leading-[0.8] ${textCol}`}>
           The<br/><span className="italic font-serif">Shelf</span>
        </h1>
        <div className="flex flex-col gap-1 mt-6 opacity-60">
           <p className={`text-[10px] font-mono uppercase tracking-widest ${textCol}`}>
              // Linear Perspective
           </p>
           <p className={`text-[10px] font-mono uppercase tracking-widest ${textCol}`}>
              // Collection Index
           </p>
           <p className={`text-[10px] font-mono uppercase tracking-widest ${textCol}`}>
              // Drag to Reorder
           </p>
        </div>
      </div>

      {/* Scroll Container */}
      {collection.length === 0 ? (
         <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
            <Disc size={64} strokeWidth={0.5} className={textCol} />
            <p className={`mt-4 text-xs uppercase tracking-widest ${textCol}`}>Shelf Empty</p>
         </div>
      ) : (
        <div 
          ref={containerRef}
          className="h-full w-full overflow-x-auto overflow-y-hidden scroll-smooth flex items-center pb-20 md:pb-0"
          style={{ 
              perspective: '1500px',
              paddingLeft: `calc(10vw + ${150 * zoom}px)`,
              paddingRight: '25vw'
          }}
        >
          <Reorder.Group 
            axis="x" 
            values={collection} 
            onReorder={(newOrder) => onReorder && onReorder(newOrder)}
            className="flex items-center h-full w-max py-32" 
          >
            {collection.map((vinyl, index) => (
              <VinylDraggableItem
                key={vinyl.id}
                vinyl={vinyl}
                index={index}
                total={collection.length}
                theme={theme}
                containerRef={containerRef}
                onClick={() => handleCardClick(vinyl)}
                hidden={selectedVinyl?.id === vinyl.id}
                zoom={zoom}
              />
            ))}
            {/* Spacer */}
            <div className="w-[10vw] flex-shrink-0" />
          </Reorder.Group>
        </div>
      )}

      {/* Expanded Card Overlay (Shared Element) */}
      <AnimatePresence>
        {selectedVinyl && (
            <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                {/* Backdrop Blur Fade In */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 backdrop-blur-md ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'}`} 
                />
                
                {/* The "Flying" Card */}
                <motion.div
                    layoutId={`card-${selectedVinyl.id}`}
                    className="relative w-[400px] md:w-[600px] aspect-square shadow-2xl z-50"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                     {/* Glass Frame Recreated for Expanded State */}
                     <div className={`relative w-full h-full overflow-hidden rounded-md backdrop-blur-xl border ${theme === 'dark' ? 'bg-black/40 border-white/20' : 'bg-white/40 border-white/60'}`}>
                        {selectedVinyl.coverUrl && (
                            <img src={selectedVinyl.coverUrl} className="w-full h-full object-cover" />
                        )}
                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 mix-blend-overlay" />
                     </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Zoom Controls (Floating Bottom Left) */}
      <div className={`absolute bottom-8 left-8 flex items-center gap-2 z-30 ${textCol}`}>
        <button 
            onClick={handleZoomOut}
            className={`p-3 rounded-full border backdrop-blur-md transition-all active:scale-95 ${glassBorder} ${theme === 'dark' ? 'bg-black/20 hover:bg-white/10' : 'bg-white/40 hover:bg-white/80'}`}
        >
            <ZoomOut size={16} />
        </button>
        <div className="font-mono text-[10px] w-12 text-center opacity-60 select-none">
            {Math.round(zoom * 100)}%
        </div>
        <button 
            onClick={handleZoomIn}
            className={`p-3 rounded-full border backdrop-blur-md transition-all active:scale-95 ${glassBorder} ${theme === 'dark' ? 'bg-black/20 hover:bg-white/10' : 'bg-white/40 hover:bg-white/80'}`}
        >
            <ZoomIn size={16} />
        </button>
      </div>

      {/* Floating UI Elements */}
      <div className={`absolute bottom-8 right-8 text-[10px] font-mono uppercase tracking-widest opacity-40 ${textCol}`}>
         {collection.length} Records / Select to Browse
      </div>
    </div>
  );
};

interface VinylDraggableItemProps {
  vinyl: Vinyl;
  index: number;
  total: number;
  theme: Theme;
  containerRef: React.RefObject<HTMLDivElement>;
  onClick: () => void;
  hidden: boolean;
  zoom: number;
}

const VinylDraggableItem: React.FC<VinylDraggableItemProps> = ({ vinyl, index, total, theme, containerRef, onClick, hidden, zoom }) => {
  // Base size calculated from zoom.
  const size = 300 * zoom;

  return (
    <Reorder.Item 
      value={vinyl} 
      className="relative flex-shrink-0 flex items-center justify-center group/item"
      style={{ 
          zIndex: total - index, 
          width: `${size}px`, 
          height: `${size}px`,
          // Instinctive Spacing Logic
          marginRight: `${-size * 0.4 * (1/Math.sqrt(zoom))}px`, 
      }}
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 9999,
        cursor: "grabbing",
      }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        vinyl={vinyl}
        theme={theme}
        containerRef={containerRef}
        onClick={onClick}
        hidden={hidden}
        zoom={zoom}
        index={index}
      />
      
      {/* Drag Handle Overlay */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-2 cursor-grab active:cursor-grabbing ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>
         <GripHorizontal size={24} />
      </div>
    </Reorder.Item>
  );
};

interface GlassCardProps {
  vinyl: Vinyl;
  theme: Theme;
  containerRef: React.RefObject<HTMLDivElement>;
  onClick: () => void;
  hidden: boolean;
  zoom: number;
  index: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ vinyl, theme, containerRef, onClick, hidden, zoom, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position for parallax
  const { scrollXProgress } = useScroll({
    target: cardRef,
    container: containerRef,
    axis: "x",
    offset: ["start end", "end start"] 
  });

  // Vertical Parallax Effect: Left items are lower, right items are higher
  const yRange = 250 * zoom; 
  const y = useTransform(scrollXProgress, [0, 1], [-yRange, yRange]); 

  // Glass Material Definition
  const glassMaterial = theme === 'dark' 
    ? 'bg-black/40 border-white/10' 
    : 'bg-white/40 border-white/50';

  return (
    <div ref={cardRef} className="w-full h-full flex items-center justify-center pointer-events-none">
      <motion.div
        layoutId={`card-${vinyl.id}`}
        style={{
          y,
          opacity: hidden ? 0 : 1, // FORCE VISIBILITY
          transformStyle: 'preserve-3d'
        }}
        className="relative group cursor-pointer w-full h-full pointer-events-auto"
        initial={{ 
            rotateY: -25, 
            rotateX: 5,
            x: 0,
            scale: 1,
            zIndex: 0 
        }}
        whileHover={{ 
            rotateY: 0,   
            rotateX: 0,
            x: -40,       
            scale: 1.1,   
            zIndex: 1000, 
            transition: { duration: 0.4, type: 'spring', stiffness: 250, damping: 20 }
        }}
        onClick={onClick}
      >
        {/* Vinyl Jacket with Glass Material */}
        <div className={`relative w-full h-full shadow-2xl transition-all duration-500 overflow-hidden rounded-sm backdrop-blur-md border ${glassMaterial}`}>
            
            {/* Grain/Noise Layer */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Cover Art (Inside Glass) */}
            {vinyl.coverUrl ? (
                <img 
                    src={vinyl.coverUrl} 
                    alt={vinyl.title} 
                    className="relative z-10 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 mix-blend-hard-light" 
                />
            ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <Disc className="opacity-20" size={80} />
                </div>
            )}

            {/* Glass Sheen/Reflection (Static Specular) */}
            <div className="absolute inset-0 z-20 bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none mix-blend-overlay" />
            
            {/* Dynamic Light Sweep on Hover */}
            <div className="absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-out duration-1000" />

            {/* Inner Shadow for Depth */}
            <div className="absolute inset-0 z-20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none" />

            {/* Hover Badge */}
            <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border ${theme === 'dark' ? 'bg-black/30 border-white/20 text-white' : 'bg-white/30 border-black/10 text-black'}`}>
                   <MousePointer2 size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Inspect</span>
                </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-40 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-white text-xl md:text-2xl font-light uppercase tracking-tighter leading-none">{vinyl.title}</h3>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">{vinyl.artist}</p>
            </div>
        </div>

        {/* Floor Reflection */}
        <div 
            className="absolute -bottom-[20px] left-0 right-0 h-[300px] opacity-20 pointer-events-none"
            style={{ 
                transform: 'scaleY(-1) skewX(0deg)',
                maskImage: 'linear-gradient(transparent, black 10%, transparent 70%)',
                WebkitMaskImage: 'linear-gradient(transparent, black 10%, transparent 70%)'
            }}
        >
             {vinyl.coverUrl && (
                <img 
                   src={vinyl.coverUrl} 
                   className="w-full h-full object-cover blur-[4px]" 
                />
             )}
        </div>
      </motion.div>
    </div>
  );
};