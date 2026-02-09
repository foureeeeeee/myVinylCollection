import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, Variants } from 'framer-motion';
import { Vinyl } from '../types';
import { Disc, ChevronLeft, ChevronRight, LayoutGrid, Layers, BarChart2, X, RotateCcw, Maximize2, Music2, Calendar, Star, Activity, Play, Image as ImageIcon, ArrowLeft, ArrowRight, ArrowUpRight, Edit, Trash2, Database, Download, Upload } from 'lucide-react';
import { Theme } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { exportCollection } from '../services/storageService';

interface DashboardProps {
  collection: Vinyl[];
  theme: Theme;
  initialVinylId?: string | null;
  onOpenMediaArchive?: (vinyl: Vinyl) => void;
  onEdit?: (vinyl: Vinyl) => void;
  onDelete?: (id: string) => void;
  onImport?: (collection: Vinyl[]) => void;
}

type ViewMode = 'stand' | 'stack';
type MediaType = 'video' | 'image';

// Helper to calculate image brightness
const getBrightness = (imageSrc: string): Promise<'light' | 'dark'> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('dark'); return; }
        ctx.drawImage(img, 0, 0, 1, 1);
        const { data } = ctx.getImageData(0, 0, 1, 1);
        // HSP Color Model for perceived brightness
        const brightness = Math.sqrt(
          0.299 * (data[0] * data[0]) +
          0.587 * (data[1] * data[1]) +
          0.114 * (data[2] * data[2])
        );
        resolve(brightness > 127.5 ? 'light' : 'dark');
      } catch (e) {
        resolve('dark'); // Fallback on error (e.g. CORS)
      }
    };
    img.onerror = () => resolve('dark');
  });
};

interface CurtainHookProps {
  isOpen: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  theme: Theme;
  isNotification?: boolean;
}

const CurtainHook: React.FC<CurtainHookProps> = ({ isOpen, onClick, icon, label, theme, isNotification }) => {
  const bgColor = theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white';
  
  return (
    <motion.button
      onClick={onClick}
      initial={{ width: '48px' }}
      animate={{ 
        width: isOpen ? 'auto' : '48px',
        paddingRight: isOpen ? '24px' : '0px'
      }}
      whileHover={{ width: 'auto', paddingRight: '24px' }}
      className={`h-12 flex items-center overflow-hidden shadow-lg group relative z-50 rounded-r-full transition-colors ${bgColor}`}
    >
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <motion.span 
          className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest overflow-hidden"
          animate={{ opacity: isOpen ? 1 : 0 }}
        >
            {label}
        </motion.span>
        {isNotification && !isOpen && (
             <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
    </motion.button>
  );
};

interface CardStackItemProps {
  vinyl: Vinyl;
  index: number;
  activeIndex: number;
  viewMode: ViewMode;
  isInspecting: boolean;
  isFlipped: boolean;
  onClick: () => void;
  theme: Theme;
}

const CardStackItem: React.FC<CardStackItemProps> = ({ 
  vinyl, index, activeIndex, viewMode, isInspecting, isFlipped, onClick, theme 
}) => {
  const isActive = index === activeIndex;
  const offset = index - activeIndex;
  
  // 3D Transforms based on mode
  const getVariant = () => {
    if (isInspecting) {
        // Inspect Mode: Active card centered, others hidden or moved away
        if (!isActive) return { opacity: 0, pointerEvents: 'none' };
        return {
          x: '0%', 
          y: '0%', 
          z: 0, 
          rotateY: isFlipped ? 180 : 0, 
          rotateX: 0, 
          scale: 1, 
          zIndex: 100, 
          opacity: 1
        };
    } else if (viewMode === 'stand') {
        // Stand Mode: Horizontal flow
        const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2;
        return {
          x: `${offset * 110}%`, 
          y: '0%',
          z: -Math.abs(offset) * 100, 
          rotateY: offset * -10, 
          rotateX: 0, 
          scale: 1 - Math.abs(offset) * 0.1,
          zIndex: 100 - Math.abs(offset),
          opacity
        };
    } else {
        // Stack Mode: Vertical stack pile
        const opacity = Math.abs(offset) > 5 ? 0 : 1;
        return {
          x: `${offset * 20}px`, 
          y: `${-offset * 20}px`,
          z: -Math.abs(offset) * 50,
          rotateY: -20, 
          rotateX: 10,
          scale: 1 - Math.abs(offset) * 0.05,
          zIndex: 100 - Math.abs(offset),
          opacity
        };
    }
  };
  
  const animateState = getVariant();

  // Cover Art handling
  const hasCover = !!vinyl.coverUrl;
  const tracksA = vinyl.tracksSideA || [];
  const tracksB = vinyl.tracksSideB || [];
  
  return (
    <motion.div
        layout
        onClick={onClick}
        initial={false}
        animate={animateState as any}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
    >
        {/* Front of Jacket */}
        <div 
          className={`absolute inset-0 backface-hidden shadow-2xl rounded-sm overflow-hidden ${theme === 'dark' ? 'bg-[#222]' : 'bg-[#fff]'}`} 
          style={{ backfaceVisibility: 'hidden' }}
        >
             {hasCover ? (
                <img src={vinyl.coverUrl} alt={vinyl.title} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 border-4 border-double border-gray-500">
                    <Disc size={80} strokeWidth={0.5} />
                    <div className="mt-4 text-center font-serif">
                        <h3 className="text-xl font-bold uppercase">{vinyl.title}</h3>
                        <p className="text-sm italic">{vinyl.artist}</p>
                    </div>
                </div>
             )}
             
             {/* Glare/Texture Overlay */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 pointer-events-none mix-blend-overlay" />
             
             {/* Edge highlight */}
             <div className="absolute inset-0 border border-white/10 pointer-events-none" />
        </div>

        {/* Back of Jacket (Only visible during inspection flip) */}
        <div 
            className={`absolute inset-0 backface-hidden shadow-2xl rounded-sm overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'}`}
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
             <div className="w-full h-full p-8 flex flex-col justify-between relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />
                
                <div className="relative z-10 text-center mt-2">
                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{vinyl.title}</h3>
                    <p className={`text-xs font-serif italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{vinyl.artist}</p>
                </div>

                <div className="relative z-10 flex-1 overflow-hidden flex flex-col justify-center py-4">
                     {/* Tracklist Display */}
                     {(tracksA.length > 0 || tracksB.length > 0) ? (
                        <div className="grid grid-cols-2 gap-4 h-full">
                           <div className="border-r border-current pr-2 overflow-y-auto custom-scrollbar">
                              <h4 className={`text-[10px] font-bold uppercase border-b border-current mb-2 pb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Side A</h4>
                              <ol className={`list-decimal list-inside text-[9px] md:text-[10px] font-mono leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                 {tracksA.map((t, i) => (
                                     <li key={i} className="truncate">{t}</li>
                                 ))}
                              </ol>
                           </div>
                           <div className="pl-2 overflow-y-auto custom-scrollbar">
                              <h4 className={`text-[10px] font-bold uppercase border-b border-current mb-2 pb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Side B</h4>
                              <ol className={`list-decimal list-inside text-[9px] md:text-[10px] font-mono leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                 {tracksB.map((t, i) => (
                                     <li key={i} className="truncate">{t}</li>
                                 ))}
                              </ol>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center justify-center h-full opacity-30 text-xs font-mono uppercase">
                           Tracklist Not Archived
                        </div>
                     )}
                </div>
                
                <div className="relative z-10 text-[9px] text-center opacity-50 uppercase tracking-widest mt-2">
                    Groove Vault Archive // {vinyl.year}
                </div>
             </div>
        </div>
        
        {/* Vinyl Record Sliding Out Animation (Only in Stand mode when active) */}
        {!isInspecting && isActive && viewMode === 'stand' && (
           <motion.div 
              initial={{ x: 0 }}
              animate={{ x: 100 }}
              transition={{ delay: 0.3, duration: 1, type: "spring" }}
              className="absolute top-2 bottom-2 right-2 w-[95%] rounded-full bg-[#111] -z-10 flex items-center justify-center shadow-xl"
           >
              {/* Label */}
              <div className="w-1/3 h-1/3 rounded-full bg-orange-500 border-4 border-black/20" />
              {/* Grooves */}
              <div className="absolute inset-0 rounded-full border-[20px] border-white/5 opacity-20" />
              <div className="absolute inset-8 rounded-full border-[20px] border-white/5 opacity-20" />
           </motion.div>
        )}
    </motion.div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ collection, theme, initialVinylId, onOpenMediaArchive, onEdit, onDelete, onImport }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('stand');
  const [showStats, setShowStats] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [jacketFlipped, setJacketFlipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Media Viewer State
  const [mediaView, setMediaView] = useState<{ type: MediaType, index: number } | null>(null);

  // Notification state for View Mode Hook
  const [viewModeNotify, setViewModeNotify] = useState(false);

  // 'light' text mode means the background is dark. 'dark' text mode means background is light.
  const [textContrastMode, setTextContrastMode] = useState<'light' | 'dark'>('light');

  // Initialize with specific vinyl if passed
  useEffect(() => {
    if (initialVinylId && collection.length > 0) {
      const index = collection.findIndex(v => v.id === initialVinylId);
      if (index !== -1) {
        setActiveIndex(index);
        // Set underlying view to stack so closing inspection feels natural
        setViewMode('stack'); 
        setIsInspecting(true); 
      }
    }
  }, [initialVinylId, collection]);

  // Constrain active index
  useEffect(() => {
    if (collection.length > 0 && activeIndex >= collection.length) {
      setActiveIndex(collection.length - 1);
    }
  }, [collection.length]);

  // Reset inspection state
  useEffect(() => {
    setJacketFlipped(false);
  }, [activeIndex]);

  // Calculate contrast based on active image
  useEffect(() => {
    const currentVinyl = collection[activeIndex];
    if (currentVinyl?.coverUrl) {
      getBrightness(currentVinyl.coverUrl).then((brightness) => {
        setTextContrastMode(brightness === 'light' ? 'dark' : 'light');
      });
    } else {
      setTextContrastMode(theme === 'dark' ? 'light' : 'dark');
    }
  }, [activeIndex, collection, theme]);

  // View Mode Notification Logic
  useEffect(() => {
    // When viewMode changes, trigger the notification animation on the hook
    setViewModeNotify(true);
    const timer = setTimeout(() => {
      setViewModeNotify(false);
    }, 2500); // Keep open for 2.5s to read
    return () => clearTimeout(timer);
  }, [viewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close media viewer with Escape
      if (mediaView) {
        if (e.key === 'Escape') setMediaView(null);
        if (mediaView.type === 'image') {
          if (e.key === 'ArrowRight') handleMediaNavigate('next');
          if (e.key === 'ArrowLeft') handleMediaNavigate('prev');
        }
        return;
      }

      if (showStats) {
        if (e.key === 'Escape') setShowStats(false);
        return;
      }

      if (showBackup) {
        if (e.key === 'Escape') setShowBackup(false);
        return;
      }
      
      if (isInspecting) {
        if (e.key === 'Escape') setIsInspecting(false);
        if (e.key === 'ArrowRight') setActiveIndex(prev => Math.min(prev + 1, collection.length - 1));
        if (e.key === 'ArrowLeft') setActiveIndex(prev => Math.max(prev - 1, 0));
        if (e.key === ' ' || e.key === 'Enter') setJacketFlipped(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (viewMode === 'stack') setViewMode('stand');
        return;
      }

      if (e.key === 'ArrowRight') {
        setActiveIndex(prev => Math.min(prev + 1, collection.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (viewMode === 'stand') setViewMode('stack');
        else setIsInspecting(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collection.length, showStats, showBackup, isInspecting, viewMode, mediaView]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (showStats || showBackup || mediaView) return;
    const threshold = 40; 
    if (info.offset.x < -threshold) {
      setActiveIndex(prev => Math.min(prev + 1, collection.length - 1));
    } else if (info.offset.x > threshold) {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'stand' ? 'stack' : 'stand');
  };

  const handleCardClick = (index: number) => {
    if (viewMode === 'stand') {
      if (index !== activeIndex) {
        setActiveIndex(index);
      } else {
        setViewMode('stack');
      }
    } else {
      if (index !== activeIndex) {
        setActiveIndex(index);
      } else {
        setIsInspecting(true);
      }
    }
  };

  const handleMediaNavigate = (direction: 'prev' | 'next') => {
    if (!mediaView || mediaView.type !== 'image' || !currentVinyl.additionalImages) return;
    
    let newIndex = mediaView.index;
    if (direction === 'next') {
        newIndex = (newIndex + 1) % currentVinyl.additionalImages.length;
    } else {
        newIndex = (newIndex - 1 + currentVinyl.additionalImages.length) % currentVinyl.additionalImages.length;
    }
    setMediaView({ ...mediaView, index: newIndex });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && onImport) {
          onImport(json);
          setShowBackup(false);
        } else {
          alert("Invalid backup file.");
        }
      } catch (err) {
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const total = collection.length;
    const genreCounts: Record<string, number> = {};
    const artistCounts: Record<string, number> = {};
    let totalRating = 0;

    collection.forEach(v => {
        genreCounts[v.genre] = (genreCounts[v.genre] || 0) + 1;
        artistCounts[v.artist] = (artistCounts[v.artist] || 0) + 1;
        totalRating += v.rating;
    });

    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const avgRating = total > 0 ? (totalRating / total).toFixed(1) : '0.0';

    const chartData = Object.entries(genreCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); 

    return { total, topGenre, topArtist, avgRating, chartData };
  }, [collection]);

  const bgColor = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#e8e8e8]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const dimColor = theme === 'dark' ? 'text-white/40' : 'text-black/40';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/10';

  // Dynamic Styles for Metadata Panel
  const metadataStyles = useMemo(() => {
    const isLightText = textContrastMode === 'light'; 

    const colors = isLightText ? {
        text: 'text-white',
        dim: 'text-white/60',
        bg: 'rgba(0,0,0,0.65)',
        border: 'rgba(255,255,255,0.2)',
        pill: 'border-white/40 text-white hover:bg-white hover:text-black'
    } : {
        text: 'text-black',
        dim: 'text-black/60',
        bg: 'rgba(255,255,255,0.65)', 
        border: 'rgba(0,0,0,0.1)',
        pill: 'border-black/40 text-black hover:bg-black hover:text-white'
    };

    if (viewMode === 'stack') {
        return {
            textColor: colors.text,
            dimColor: colors.dim,
            bgColor: colors.bg,
            backdropFilter: 'blur(25px) saturate(180%)',
            borderRadius: '24px',
            borderWidth: '1px',
            borderColor: colors.border,
            padding: '32px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
            pillBorder: colors.pill
        };
    } else {
        return {
            textColor: colors.text,
            dimColor: colors.dim,
            bgColor: isLightText ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            borderWidth: '1px',
            borderColor: colors.border,
            padding: '20px 32px',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
            pillBorder: colors.pill
        };
    }
  }, [viewMode, textContrastMode]);

  // Animation Variants
  const sidebarVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
    exit: { opacity: 0 }
  };

  const contentItemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 10 }
  };

  const separatorVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 0.2, transition: { duration: 0.8, ease: "circOut" } }
  };

  const currentVinyl = collection[activeIndex];

  return (
    <div className={`w-full h-screen flex overflow-hidden ${bgColor} relative touch-none selection:bg-transparent transition-colors duration-500`}>
      
      {/* Atmosphere */}
      <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${theme === 'dark' ? 'from-black/80 via-[#0a0a0a]/50 to-[#111]/80' : 'from-white/80 via-[#e8e8e8]/50 to-[#d4d4d4]/80'} opacity-60`} />

      {/* --- Left-Side Curtain Hooks (Global Controls) --- */}
      <AnimatePresence>
        {!isInspecting && (
          <div className="absolute top-32 left-0 z-40 flex flex-col gap-4 pointer-events-auto">
             
             {/* 1. Analytics Hook */}
             <CurtainHook 
                isOpen={showStats}
                onClick={() => { setShowStats(!showStats); setShowBackup(false); }}
                icon={showStats ? <X size={16} /> : <BarChart2 size={16} />}
                label={showStats ? "Close Data" : "Analytics"}
                theme={theme}
             />

             {/* 2. Backup/Data Hook */}
             <CurtainHook 
                isOpen={showBackup}
                onClick={() => { setShowBackup(!showBackup); setShowStats(false); }}
                icon={showBackup ? <X size={16} /> : <Database size={16} />}
                label={showBackup ? "Close Tools" : "Backup Data"}
                theme={theme}
             />

             {/* 3. View Mode Hook */}
             <CurtainHook 
                isOpen={viewModeNotify} 
                onClick={toggleViewMode}
                icon={viewMode === 'stand' ? <Layers size={16} /> : <LayoutGrid size={16} />}
                label={viewMode === 'stand' ? "Switch to Stack" : "Return to Stand"}
                theme={theme}
                isNotification={true}
             />
          </div>
        )}
      </AnimatePresence>

      {/* --- VISUALIZATION AREA --- */}
      <motion.div 
        className="relative h-full flex items-center justify-center"
        animate={{ 
            width: isInspecting ? '60%' : '100%',
            opacity: (showStats || showBackup || mediaView) ? 0.1 : 1, 
            filter: (showStats || showBackup || mediaView) ? 'blur(10px)' : 'blur(0px)',
            scale: (showStats || showBackup || mediaView) ? 0.95 : 1
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
          {/* Draggable Area Wrapper */}
          <motion.div 
            className={`absolute inset-0 z-10 flex items-center justify-center ${isInspecting ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            drag={isInspecting ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* 3D Scene */}
            <div 
              className="relative w-full h-[60vh] flex items-center justify-center"
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
            >
              {collection.length === 0 ? (
                <div className={`flex flex-col items-center justify-center ${dimColor}`}>
                  <Disc size={48} className="mb-4 opacity-20" />
                  <p className="uppercase tracking-widest text-xs">Collection Empty</p>
                </div>
              ) : (
                collection.map((vinyl, index) => {
                  const renderWindow = viewMode === 'stand' ? 4 : 8;
                  if (Math.abs(index - activeIndex) > renderWindow && !isInspecting) return null;
                  if (isInspecting && index !== activeIndex) return null;

                  return (
                    <CardStackItem 
                      key={vinyl.id} 
                      vinyl={vinyl} 
                      index={index} 
                      activeIndex={activeIndex}
                      viewMode={viewMode}
                      isInspecting={isInspecting && index === activeIndex}
                      isFlipped={jacketFlipped && index === activeIndex}
                      onClick={() => handleCardClick(index)}
                      theme={theme}
                    />
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Dynamic Editorial Text Layer */}
          <AnimatePresence>
            {!isInspecting && (
              <motion.div 
                initial={false}
                animate={{ 
                  top: viewMode === 'stack' ? '15%' : '80%',
                  left: viewMode === 'stack' ? '5%' : '55%',
                  backgroundColor: viewMode === 'stack' ? (theme === 'dark' ? 'rgba(20,20,20,0.6)' : 'rgba(255,255,255,0.4)') : 'rgba(0,0,0,0)',
                  backdropFilter: viewMode === 'stack' ? 'blur(20px) saturate(180%)' : 'blur(0px)',
                  borderRadius: viewMode === 'stack' ? '24px' : '0px',
                  borderWidth: '1px',
                  borderColor: viewMode === 'stack' ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)') : 'transparent',
                  padding: viewMode === 'stack' ? '24px 32px' : '0px',
                  boxShadow: viewMode === 'stack' ? '0 8px 32px 0 rgba(0, 0, 0, 0.2)' : 'none',
                }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className={`absolute z-0 select-none pointer-events-none overflow-hidden`}
                style={{ maxWidth: '90vw' }}
              >
                 <div className="flex flex-col relative z-10">
                   <motion.span 
                      animate={{ 
                        opacity: viewMode === 'stack' ? 1 : 0,
                        height: viewMode === 'stack' ? 'auto' : 0,
                        marginBottom: viewMode === 'stack' ? 4 : 0
                      }}
                      className={`text-[10px] font-mono uppercase tracking-widest ${dimColor}`}
                   >
                      Collection Index
                   </motion.span>
                   <motion.h1 
                      className={`font-bold tracking-tighter leading-none whitespace-nowrap ${textColor}`}
                      animate={{ 
                        fontSize: viewMode === 'stack' ? '3rem' : '8rem',
                        opacity: viewMode === 'stack' ? 1 : 0.05,
                        filter: viewMode === 'stack' ? 'none' : 'mix-blend-overlay'
                      }}
                   >
                     ARCHIVE <span className="font-light opacity-50">{String(activeIndex + 1).padStart(3, '0')}</span>
                   </motion.h1>
                 </div>
                 {viewMode === 'stack' && (
                    <motion.div 
                       className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 0.5 }}
                    />
                 )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Floating Metadata */}
          <AnimatePresence>
            {!isInspecting && currentVinyl && (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, x: 0,
                  ...metadataStyles
                }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                    position: 'absolute', right: '3rem', top: viewMode === 'stand' ? '25%' : 'auto', bottom: viewMode === 'stack' ? '3rem' : 'auto', zIndex: 120, textAlign: 'right'
                }}
                transition={{ layout: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }, opacity: { duration: 0.3 } }}
                className="pointer-events-auto"
              >
                  <motion.div layout className="flex flex-col items-end">
                    {viewMode === 'stand' ? (
                       <>
                          <h2 className={`text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-2 ${metadataStyles.textColor}`}>{currentVinyl.title}</h2>
                          <div className={`flex items-center gap-3 ${metadataStyles.dimColor}`}>
                             <div className="flex text-[10px]">
                                {[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < currentVinyl.rating ? "currentColor" : "none"} />))}
                             </div>
                             <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                             <p className="text-lg uppercase tracking-wide font-medium">{currentVinyl.artist}</p>
                          </div>
                       </>
                    ) : (
                       <>
                          <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 transition-colors duration-500 ${metadataStyles.dimColor}`}>Stack Context</p>
                          <h2 className={`text-4xl md:text-6xl font-medium uppercase tracking-tighter leading-none mb-2 transition-colors duration-500 ${metadataStyles.textColor}`}>{currentVinyl.title}</h2>
                          <p className={`text-xl uppercase tracking-wide font-light transition-colors duration-500 ${metadataStyles.dimColor}`}>{currentVinyl.artist}</p>
                          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${metadataStyles.pillBorder}`} onClick={() => setIsInspecting(true)}>
                             <Maximize2 size={12} /> Inspect Record
                          </div>
                       </>
                    )}
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>

      {/* --- INSPECTION SIDEBAR --- */}
      <AnimatePresence>
        {isInspecting && currentVinyl && !mediaView && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute top-0 right-0 w-full md:w-[40%] h-full z-50 shadow-2xl overflow-y-auto backdrop-blur-md border-l ${borderColor} ${theme === 'dark' ? 'bg-black/80' : 'bg-white/90'}`}
          >
             <motion.div className="h-full flex flex-col p-8 md:p-12" initial="hidden" animate="visible" exit="exit" variants={sidebarVariants}>
                <motion.div variants={contentItemVariants} className="flex justify-between items-start mb-12">
                   <button onClick={() => setIsInspecting(false)} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity ${textColor}`}>
                     <ChevronLeft size={14} /> Back to Browse
                   </button>
                   <div className="flex items-center gap-2">
                       <button onClick={() => onEdit?.(currentVinyl)} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${textColor}`} title="Edit Record"><Edit size={16} /></button>
                       <button onClick={() => { if(confirm('Delete this record permanently?')) { onDelete?.(currentVinyl.id); setIsInspecting(false); } }} className={`p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors ${textColor}`} title="Delete Record"><Trash2 size={16} /></button>
                       <div className={`w-px h-4 mx-2 ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}`} />
                       <button onClick={() => setIsInspecting(false)} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${textColor}`}><X size={20} /></button>
                   </div>
                </motion.div>
                {/* Content... (Same as before) */}
                <div className="flex-1">
                     <motion.div variants={contentItemVariants} className="flex items-center gap-2 mb-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>{currentVinyl.genre}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>{currentVinyl.year}</span>
                     </motion.div>
                     <motion.h1 variants={contentItemVariants} className={`text-5xl md:text-7xl font-light uppercase tracking-tighter leading-[0.85] mb-4 ${textColor}`}>{currentVinyl.title}</motion.h1>
                     <motion.p variants={contentItemVariants} className={`text-2xl md:text-3xl font-medium uppercase tracking-tight mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{currentVinyl.artist}</motion.p>
                     <motion.div variants={separatorVariants} className={`w-full h-px mb-8 origin-left ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
                     <motion.div variants={contentItemVariants} className="grid grid-cols-2 gap-8 mb-8">
                        <div><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 opacity-50 ${textColor}`}>Catalog ID</p><p className={`font-mono text-xs ${textColor}`}>{currentVinyl.id.substring(0,8).toUpperCase()}</p></div>
                        <div><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 opacity-50 ${textColor}`}>Rating</p><div className="flex gap-1">{[1,2,3,4,5].map(s => (<Star key={s} size={12} fill={s <= currentVinyl.rating ? 'currentColor' : 'none'} className={textColor} />))}</div></div>
                        <div><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 opacity-50 ${textColor}`}>Date Added</p><div className={`flex items-center gap-2 font-mono text-xs ${textColor}`}><Calendar size={12} />{new Date(currentVinyl.addedAt).toLocaleDateString()}</div></div>
                        <div><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 opacity-50 ${textColor}`}>Format</p><div className={`flex items-center gap-2 font-mono text-xs ${textColor}`}><Music2 size={12} />{currentVinyl.format || '12" Vinyl / 33RPM'}</div></div>
                     </motion.div>
                     {(currentVinyl.videoUrl || (currentVinyl.additionalImages && currentVinyl.additionalImages.length > 0)) && (
                        <motion.div variants={contentItemVariants} className="mb-8">
                            <button onClick={() => onOpenMediaArchive?.(currentVinyl)} className={`group w-full flex items-center justify-between text-left p-4 rounded border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-white/20 hover:border-white hover:bg-white/10' : 'border-black/10 hover:border-black hover:bg-black/5'}`}>
                                <div><h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 ${textColor}`}>Media Archive</h3><p className={`text-[10px] opacity-60 ${textColor}`}>Click to enter full immersive view</p></div>
                                <ArrowUpRight className={`opacity-50 group-hover:opacity-100 transition-opacity ${textColor}`} size={16} />
                            </button>
                            <div className="mt-4 flex gap-2 overflow-hidden opacity-50 grayscale hover:grayscale-0 transition-all pointer-events-none">
                                {currentVinyl.videoUrl && <div className="w-16 h-10 bg-black rounded" />}
                                {currentVinyl.additionalImages?.slice(0, 3).map((img, idx) => (<img key={idx} src={img} className="w-16 h-10 object-cover rounded" />))}
                            </div>
                        </motion.div>
                     )}
                     <motion.div variants={contentItemVariants} className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 opacity-70 ${textColor}`}>Archivist Notes</p>
                        <p className={`text-sm leading-relaxed font-serif ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{currentVinyl.notes || "No specific notes available for this pressing. Standard edition assumed. Condition appears good."}</p>
                     </motion.div>
                </div>
                <motion.div variants={contentItemVariants} className="border-t border-opacity-10 pt-6 mt-auto">
                   <button onClick={() => setJacketFlipped(!jacketFlipped)} className={`w-full py-4 flex items-center justify-center gap-3 rounded-lg border transition-all ${theme === 'dark' ? 'border-white/20 hover:bg-white/10 text-white' : 'border-black/10 hover:bg-black/5 text-black'}`}>
                      <RotateCcw size={16} /> <span className="text-xs font-bold uppercase tracking-widest">{jacketFlipped ? 'View Front Cover' : 'View Back Cover'}</span>
                   </button>
                </motion.div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MEDIA FULLSCREEN OVERLAY --- */}
      <AnimatePresence>
        {mediaView && currentVinyl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[200] flex flex-col ${theme === 'dark' ? 'bg-[#111]' : 'bg-[#f4f4f4]'}`}>
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="relative z-20 flex justify-between items-start p-8 md:p-12 mix-blend-difference text-gray-500">
                    <div><p className="text-[10px] font-mono uppercase tracking-widest">Archive Ref. {currentVinyl.id.substring(0,6)}</p><h2 className={`text-xl font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{currentVinyl.title} &mdash; {mediaView.type === 'video' ? 'Visual Motion' : 'Still Photography'}</h2></div>
                    <button onClick={() => setMediaView(null)} className={`p-2 rounded-full border transition-colors ${theme === 'dark' ? 'border-white/20 hover:bg-white text-white hover:text-black' : 'border-black/20 hover:bg-black text-black hover:text-white'}`}><X size={24} strokeWidth={1} /></button>
                </div>
                <div className="flex-1 relative z-10 flex items-center justify-center p-4 md:p-12 overflow-hidden">
                    {mediaView.type === 'video' ? (
                        <div className="w-full h-full max-w-7xl max-h-[80vh] bg-black shadow-2xl relative"><iframe width="100%" height="100%" src={`${currentVinyl.videoUrl}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                             <div className="absolute top-0 left-0 max-w-xs hidden xl:block p-4"><p className={`text-xs font-mono leading-relaxed mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>On {new Date(currentVinyl.addedAt).toLocaleDateString()}, this record was cataloged...<br/><br/>ARTIST: {currentVinyl.artist}<br/>FORMAT: 12" Vinyl</p></div>
                             <motion.img key={mediaView.index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} src={currentVinyl.additionalImages?.[mediaView.index]} className="max-w-full max-h-full object-contain shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000" />
                             {(currentVinyl.additionalImages?.length || 0) > 1 && (
                                <><button onClick={(e) => { e.stopPropagation(); handleMediaNavigate('prev'); }} className={`absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><ArrowLeft size={32} /></button><button onClick={(e) => { e.stopPropagation(); handleMediaNavigate('next'); }} className={`absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}><ArrowRight size={32} /></button></>
                             )}
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACKUP OVERLAY --- */}
      <AnimatePresence>
        {showBackup && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`absolute inset-0 z-50 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#e8e8e8]'} flex flex-col p-8 md:p-24 overflow-y-auto`}>
             <div className="max-w-4xl mx-auto w-full flex justify-between items-start mb-12">
                <div><h2 className={`text-sm font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Data Management</h2><h1 className={`text-4xl md:text-6xl font-light uppercase tracking-tighter ${textColor}`}>Backup & Restore</h1></div>
                <button onClick={() => setShowBackup(false)} className={`p-2 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}><X size={24} /></button>
             </div>
             <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className={`p-8 border rounded-xl flex flex-col items-center text-center gap-6 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}>
                    <Database size={48} className={dimColor} />
                    <div>
                        <h3 className={`text-xl font-bold uppercase mb-2 ${textColor}`}>Export Collection</h3>
                        <p className={`text-xs opacity-60 max-w-xs mx-auto ${textColor}`}>Download your entire collection as a JSON file. Use this to transfer data between devices or keep a safe backup.</p>
                    </div>
                    <button onClick={() => exportCollection(collection)} className={`mt-auto px-8 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        <Download size={14} /> Download JSON
                    </button>
                </div>
                <div className={`p-8 border rounded-xl flex flex-col items-center text-center gap-6 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}>
                    <Upload size={48} className={dimColor} />
                    <div>
                        <h3 className={`text-xl font-bold uppercase mb-2 ${textColor}`}>Import Collection</h3>
                        <p className={`text-xs opacity-60 max-w-xs mx-auto ${textColor}`}>Restore your collection from a previously exported JSON file. <br/><span className="text-red-500">Warning: This will overwrite current data.</span></p>
                    </div>
                    <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className={`mt-auto px-8 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border transition-all ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white hover:text-black' : 'border-black/20 text-black hover:bg-black hover:text-white'}`}>
                        <Upload size={14} /> Select File
                    </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STATS OVERLAY --- */}
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`absolute inset-0 z-50 ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#e8e8e8]'} flex flex-col p-8 md:p-24 overflow-y-auto`}>
             <div className="max-w-7xl mx-auto w-full flex justify-between items-start mb-12">
                <div><h2 className={`text-sm font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Analytics Module</h2><h1 className={`text-4xl md:text-6xl font-light uppercase tracking-tighter ${textColor}`}>Archive Statistics</h1></div>
                <button onClick={() => setShowStats(false)} className={`p-2 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}><X size={24} /></button>
             </div>
             {/* Stats Body (Chart etc) */}
             <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 flex-1">
                <div className="flex flex-col gap-12">
                   <div className="border-t border-current pt-4">
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Total Records</p>
                      <div className={`text-8xl md:text-9xl font-bold tracking-tighter leading-none ${textColor}`}>{stats.total}</div>
                   </div>
                   <div className="border-t border-current pt-4">
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Avg. Rating</p>
                      <div className={`text-6xl md:text-8xl font-light tracking-tighter leading-none ${textColor}`}>{stats.avgRating}<span className="text-2xl align-top opacity-50">/5</span></div>
                   </div>
                </div>
                {/* ... other stats ... */}
                <div className="flex flex-col gap-12">
                   <div className="border-t border-current pt-4"><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Dominant Genre</p><div className={`text-4xl md:text-6xl font-medium tracking-tight uppercase leading-none break-words ${textColor}`}>{stats.topGenre}</div></div>
                   <div className="border-t border-current pt-4"><p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${dimColor}`}>Top Artist</p><div className={`text-3xl md:text-5xl font-light tracking-tight uppercase leading-none break-words ${textColor}`}>{stats.topArtist}</div></div>
                </div>
                <div className="flex flex-col h-full min-h-[300px]">
                   <div className="border-t border-current pt-4 h-full flex flex-col">
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-6 ${dimColor}`}>Genre Distribution</p>
                      <div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{ fill: theme === 'dark' ? 'white' : 'black', fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }} axisLine={false} tickLine={false} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: '1px solid #333', fontSize: '10px', textTransform: 'uppercase' }} /><Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>{stats.chartData.map((_, index) => <Cell key={`cell-${index}`} fill={theme === 'dark' ? '#fff' : '#000'} />)}</Bar></BarChart></ResponsiveContainer></div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};