export interface IEpisodes {
  totalEpisodes: number;
  episodes: Episode[];
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface IEpisodeSource {
  headers: {
    Referer: string;
  };
  tracks: Track[];
  intro: Intro;
  outro: Outro;
  sources: Source[];
  anilistID: number;
  malID: number;
}

// Nueva interfaz para respuesta híbrida
export interface IHybridEpisodeResponse {
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  availableStreams: CustomStreamSource[];
  fallbackStreams?: IEpisodeSource[];
}

// Interfaz para streams personalizados
export interface CustomStreamSource {
  id: string;
  animeId: string;
  episodeNumber: number;
  streamUrl: string;
  quality: {
    resolution: "480p" | "720p" | "1080p" | "1440p" | "4K";
    bitrate?: number;
  };
  language: {
    type: "sub" | "dub" | "raw";
    language?: string;
  };
  server: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEpisodeServers {
  episodeId: string;
  episodeNo: string;
  sub: {
    serverId: number;
    serverName: string;
  }[];
  dub: {
    serverId: number;
    serverName: string;
  }[];
  raw: {
    serverId: number;
    serverName: string;
  }[];
}

export interface Track {
  lang: string;
  url: string;
}

export interface Intro {
  start: number;
  end: number;
}

export interface Outro {
  start: number;
  end: number;
}

export interface Source {
  url: string;
  type: string;
}
