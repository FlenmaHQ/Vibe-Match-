import { TOP_100_LANGUAGES } from './data/languages';

export type LanguageOption = string;

export const WORLD_LANGUAGES: string[] = [
  'All Languages',
  ...TOP_100_LANGUAGES.map((l) => l.name),
];

export type DestinationOption =
  | 'Instagram Story'
  | 'Instagram Post'
  | 'Reel'
  | 'WhatsApp Status'
  | 'Other';

export type VibeLabel =
  | 'Dreamy'
  | 'Romantic'
  | 'Cinematic'
  | 'Peaceful'
  | 'Confident'
  | 'Mysterious'
  | 'Happy'
  | 'Nostalgic'
  | 'Cute'
  | 'Elegant'
  | 'Energetic'
  | 'Dark'
  | 'Travel'
  | 'Friendship';

export interface Song {
  id: string;
  title: string;
  artist: string;
  language: string;
  countryOrRegion?: string;
  genre: string;
  subgenre?: string;
  mood: VibeLabel;
  secondaryMood?: VibeLabel;
  energy: number; // 0 - 100
  tempo: number; // BPM
  vibeTags: string[];
  lyricalThemes: string[];
  romanceScore: number; // 0 - 100
  nostalgiaScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  cinematicScore: number; // 0 - 100
  peacefulScore: number; // 0 - 100
  danceScore: number; // 0 - 100
  darknessScore: number; // 0 - 100
  popularity?: number; // 0 - 100
  listenUrl: string;
  previewUrl: string | null;
  artworkUrl?: string | null;
  source: string; // e.g. 'itunes-verified' | 'curated-editorial'
  duration: string;
  audioToneType?: 'dreamy' | 'chill' | 'cinematic' | 'upbeat' | 'acoustic' | 'ambient' | 'dark' | 'synth';
  bpm?: number;
  matchReason?: string;
  matchScore?: number;
  scoreBreakdown?: {
    moodScore: number;
    vectorScore: number;
    destinationScore: number;
    themeScore: number;
    languageScore: number;
  };
}

export interface ColorPaletteItem {
  hex: string;
  name: string;
}

export interface DetectedVibeData {
  primaryVibe: VibeLabel;
  secondaryVibe: VibeLabel;
  secondaryVibes: string[];
  energy: number; // 0 - 100
  softness: number; // 0 - 100
  nostalgia: number; // 0 - 100
  romance: number; // 0 - 100
  cinematic: number; // 0 - 100
  confidence: number; // 0 - 100
  darkness: number; // 0 - 100
  visualStyle: string; // e.g. "warm vintage portrait"
  description: string;
  palette: ColorPaletteItem[];
  lighting: 'Golden Hour' | 'Moody Shadows' | 'Soft Pastel' | 'Vivid Electric' | 'Natural Sunlight' | 'Deep Night';
  aestheticDescriptor: string;
  energyLevel: 'Calm & Flowing' | 'Atmospheric & Deep' | 'High Energy & Bold' | 'Warm & Nostalgic';
  setting?: string;
  emotionalResonance?: string[];
  analysisSource?: 'gemini-vision' | 'optical-heuristics' | 'curated-vision';
}

export interface MatchingDiagnostics {
  photoVibeProfile: Partial<DetectedVibeData>;
  totalCandidatesConsidered: number;
  languageFilter: string;
  excludedSongIdsCount: number;
  excludedSongIds: string[];
  candidatePoolCount: number;
  rankedCandidatesCount: number;
  topScoringFactors: {
    songId: string;
    title: string;
    artist: string;
    finalScore: number;
    moodScore: number;
    vectorScore: number;
    destinationScore: number;
    themeScore: number;
    languageScore: number;
    hasPreview: boolean;
  }[];
}

export interface SamplePhoto {
  id: string;
  title: string;
  label: string;
  url: string;
  aspect: string;
}

