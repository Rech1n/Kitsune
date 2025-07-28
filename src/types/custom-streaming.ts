// Types for custom streaming system
export interface CustomStreamSource {
  id: string;
  animeId: string;
  episodeNumber: number;
  streamUrl: string;
  quality: StreamQuality;
  language: StreamLanguage;
  server: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamQuality {
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4K";
  bitrate?: number;
}

export interface StreamLanguage {
  type: "sub" | "dub" | "raw";
  language?: string; // e.g., "en", "ja", "es"
}

export interface StreamServer {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
}

export interface EpisodeStreamResponse {
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  availableStreams: CustomStreamSource[];
  fallbackStreams?: any[]; // HiAnime streams as fallback
}

export interface StreamMetadata {
  animeTitle: string;
  episodeTitle?: string;
  episodeNumber: number;
  season?: number;
  thumbnail?: string;
  duration?: number;
}
