import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Collection } from './components/Collection';
import { VinylShelf } from './components/VinylShelf';
import { AIRecommender } from './components/AIRecommender';
import { VinylForm } from './components/VinylForm';
import { MediaArchivePage } from './components/MediaArchivePage';
import { getCollection, saveCollection } from './services/storageService';
import { Vinyl, ViewState } from './types';
import { motion, AnimatePresence } from 'framer-motion';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  // Lazy initialization ensures we read from LocalStorage before the first render/effect cycle
  const [collection, setCollection] = useState<Vinyl[]>(() => getCollection());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVinyl, setEditingVinyl] = useState<Vinyl | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Track specific vinyl to open in Dashboard
  const [activeVinylId, setActiveVinylId] = useState<string | null>(null);

  // Save on change
  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAdd = (data: Omit<Vinyl, 'id' | 'addedAt'>) => {
    const newVinyl: Vinyl = {
      ...data,
      id: crypto.randomUUID(),
      addedAt: Date.now()
    };
    setCollection([newVinyl, ...collection]);
  };

  const handleUpdate = (data: Omit<Vinyl, 'id' | 'addedAt'>) => {
    if (!editingVinyl) return;
    const updated = collection.map(v => 
      v.id === editingVinyl.id ? { ...v, ...data } : v
    );
    setCollection(updated);
    setEditingVinyl(undefined);
  };

  const handleDelete = (id: string) => {
    setCollection(collection.filter(v => v.id !== id));
  };

  const handleImport = (importedCollection: Vinyl[]) => {
    setCollection(importedCollection);
    alert('Collection imported successfully!');
  };

  const openAddForm = () => {
    setEditingVinyl(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (vinyl: Vinyl) => {
    setEditingVinyl(vinyl);
    setIsFormOpen(true);
  };

  // Handle transition from Shelf to Dashboard
  const handleVinylSelect = (id: string) => {
    setActiveVinylId(id);
    setView('dashboard');
  };

  // Clear active ID when switching away manually
  const handleSetView = (newView: ViewState) => {
    if (newView !== 'dashboard' && newView !== 'media-archive') {
      setActiveVinylId(null);
    }
    setView(newView);
  }

  const handleOpenMediaArchive = (vinyl: Vinyl) => {
    setActiveVinylId(vinyl.id); // Ensure state persists
    setView('media-archive');
  };

  // Helper to find the active vinyl object safely
  const activeVinyl = collection.find(v => v.id === activeVinylId);

  return (
    <div className={`min-h-screen font-sans selection:bg-gray-500 selection:text-white overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f4f4f4] text-black'}`}>
      
      {/* Hide Navbar when in immersive Media Archive mode */}
      {view !== 'media-archive' && (
        <Navbar currentView={view} setView={handleSetView} theme={theme} toggleTheme={toggleTheme} />
      )}
      
      <main className="w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full min-h-screen"
          >
            {view === 'dashboard' && (
              <Dashboard 
                collection={collection} 
                theme={theme} 
                initialVinylId={activeVinylId}
                onOpenMediaArchive={handleOpenMediaArchive}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onImport={handleImport}
              />
            )}
            {view === 'collection' && (
              <Collection 
                collection={collection} 
                onEdit={openEditForm} 
                onDelete={handleDelete} 
                onAddNew={openAddForm}
                theme={theme}
              />
            )}
            {view === 'shelf' && (
              <VinylShelf 
                collection={collection} 
                theme={theme} 
                onVinylSelect={handleVinylSelect}
                onReorder={setCollection}
              />
            )}
            {view === 'recommendations' && <AIRecommender collection={collection} theme={theme} />}
            
            {view === 'media-archive' && activeVinyl && (
                <MediaArchivePage 
                    vinyl={activeVinyl} 
                    onClose={() => setView('dashboard')} 
                />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <VinylForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingVinyl ? handleUpdate : handleAdd}
        initialData={editingVinyl}
        theme={theme}
      />
    </div>
  );
};

export default App;