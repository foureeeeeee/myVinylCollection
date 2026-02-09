import { Vinyl } from '../types';
import { INITIAL_COLLECTION } from '../constants';

const STORAGE_KEY = 'groovevault_collection';
const VERSION_KEY = 'groovevault_version';
// Increment this whenever the data structure of INITIAL_COLLECTION changes significantly
// to ensure users get the new fields (like tracklists, formats) merged into their saved data.
const CURRENT_VERSION = 2; 

export const getCollection = (): Vinyl[] => {
  const storedStr = localStorage.getItem(STORAGE_KEY);
  const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0');

  if (!storedStr) {
    // Initialize with sample data if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COLLECTION));
    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    return INITIAL_COLLECTION;
  }

  let collection: Vinyl[] = [];
  try {
    collection = JSON.parse(storedStr);
  } catch (e) {
    console.error("Failed to parse collection", e);
    // Fallback reset if data is corrupt
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COLLECTION));
    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    return INITIAL_COLLECTION;
  }

  // Migration Logic
  if (storedVersion < CURRENT_VERSION) {
    console.log(`Migrating data from version ${storedVersion} to ${CURRENT_VERSION}`);
    
    const updatedCollection = collection.map(storedItem => {
       // Find if this is one of our default records
       const freshItem = INITIAL_COLLECTION.find(i => i.id === storedItem.id);
       
       if (freshItem) {
          // Merge Strategy:
          // 1. Start with 'freshItem' (contains new fields like tracksSideA, format, videoUrl).
          // 2. Overwrite with 'storedItem' (contains user's rating, notes, or edits).
          // This ensures new schema fields are added, but user data is preserved.
          return { ...freshItem, ...storedItem };
       }
       
       // Keep user-created items as is
       return storedItem;
    });

    // Persist the migration
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCollection));
    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    
    return updatedCollection;
  }

  return collection;
};

export const saveCollection = (collection: Vinyl[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
};

export const exportCollection = (collection: Vinyl[]) => {
  try {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collection, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `groove_vault_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (e) {
    console.error("Export failed", e);
  }
};
