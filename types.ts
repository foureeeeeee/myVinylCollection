export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  coverUrl?: string;
  rating: number; // 1-5
  notes?: string;
  addedAt: number;
  // New Media Fields
  additionalImages?: string[]; // Array of URLs for posters/back covers/inserts
  videoUrl?: string; // URL for YouTube embed or similar
  
  // Customizable Fields
  format?: string;
  tracksSideA?: string[];
  tracksSideB?: string[];
  archiveDescription?: string;
}

export type ViewState = 'dashboard' | 'collection' | 'shelf' | 'recommendations' | 'media-archive';

export interface RecommendationResponse {
  album: string;
  artist: string;
  year: string;
  genre: string;
  reason: string;
}

export interface StatData {
  name: string;
  value: number;
}