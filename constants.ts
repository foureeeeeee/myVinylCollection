import { Vinyl } from './types';

export const INITIAL_COLLECTION: Vinyl[] = [
  {
    id: '1',
    title: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    year: 1973,
    genre: 'Progressive Rock',
    rating: 5,
    coverUrl: 'https://picsum.photos/seed/pinkfloyd/400/400',
    notes: 'Original pressing, minor scratch on side B. Includes the original posters.',
    addedAt: Date.now() - 10000000,
    videoUrl: 'https://www.youtube.com/embed/k9o78-f2mIM?si=8YKdD4qgQ9_1_1_1', // Money Official Video
    additionalImages: [
      'https://picsum.photos/seed/pf1/400/300',
      'https://picsum.photos/seed/pf2/400/300',
      'https://picsum.photos/seed/pf3/300/400'
    ],
    format: '12" Vinyl / 33RPM',
    tracksSideA: ['Speak to Me', 'Breathe', 'On the Run', 'Time', 'The Great Gig in the Sky'],
    tracksSideB: ['Money', 'Us and Them', 'Any Colour You Like', 'Brain Damage', 'Eclipse']
  },
  {
    id: '2',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    year: 2013,
    genre: 'Electronic',
    rating: 5,
    coverUrl: 'https://picsum.photos/seed/daftpunk/400/400',
    notes: '180g vinyl, sounds amazing.',
    addedAt: Date.now() - 5000000,
    videoUrl: 'https://www.youtube.com/embed/IluRBbt4TIY?si=8YKdD4qgQ9_1_1_1', // Instant Crush
    additionalImages: [
       'https://picsum.photos/seed/dp1/400/200'
    ],
    format: '2xLP Vinyl',
    tracksSideA: ['Give Life Back to Music', 'The Game of Love', 'Giorgio by Moroder'],
    tracksSideB: ['Within', 'Instant Crush', 'Lose Yourself to Dance']
  },
  {
    id: '3',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    year: 1959,
    genre: 'Jazz',
    rating: 4,
    coverUrl: 'https://picsum.photos/seed/milesdavis/400/400',
    addedAt: Date.now(),
    format: '12" Vinyl',
    tracksSideA: ['So What', 'Freddie Freeloader', 'Blue in Green'],
    tracksSideB: ['All Blues', 'Flamenco Sketches']
  },
];

export const GENRES = [
  'Rock',
  'Jazz',
  'Electronic',
  'Hip Hop',
  'Classical',
  'Pop',
  'Soul',
  'Reggae',
  'Blues',
  'Metal',
  'Country',
  'Folk',
  'Other'
];