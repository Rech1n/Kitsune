import { 
  CustomStreamSource, 
  StreamServer, 
  EpisodeStreamResponse,
  StreamQuality,
  StreamLanguage 
} from "@/types/custom-streaming";

/**
 * Service for managing custom stream sources
 * Follows Single Responsibility Principle - only handles stream management
 */
export class CustomStreamService {
  private streams: Map<string, CustomStreamSource[]> = new Map();
  private servers: Map<string, StreamServer> = new Map();

  constructor() {
    this.initializeDefaultServers();
  }

  /**
   * Initialize default servers
   * Following Open/Closed Principle - easy to extend with new servers
   */
  private initializeDefaultServers(): void {
    const defaultServers: StreamServer[] = [
      {
        id: "yaichi-anime",
        name: "Yaichi",
        baseUrl: "http://yaichi-anime.ddns.net:8080",
        isActive: true,
        priority: 3
      },
      {
        id: "bluease",
        name: "Bluease", 
        baseUrl: "http://bluease.example.com:8080",
        isActive: true,
        priority: 2
      },
      {
        id: "custom-server-1",
        name: "Custom Server 1",
        baseUrl: "http://custom1.example.com:8080", 
        isActive: false,
        priority: 1
      }
    ];

    defaultServers.forEach(server => {
      this.servers.set(server.id, server);
    });
  }

  /**
   * Add a custom stream source for an episode
   * @param animeId - The anime identifier
   * @param episodeNumber - Episode number
   * @param streamUrl - The custom stream URL
   * @param quality - Stream quality settings
   * @param language - Stream language settings
   */
  public addStreamSource(
    animeId: string,
    episodeNumber: number,
    streamUrl: string,
    quality: StreamQuality = { resolution: "1080p" },
    language: StreamLanguage = { type: "sub" },
    serverId: string = "yaichi-anime"
  ): CustomStreamSource {
    const streamId = this.generateStreamId(animeId, episodeNumber, serverId);
    const episodeKey = this.getEpisodeKey(animeId, episodeNumber);

    const streamSource: CustomStreamSource = {
      id: streamId,
      animeId,
      episodeNumber,
      streamUrl,
      quality,
      language,
      server: serverId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!this.streams.has(episodeKey)) {
      this.streams.set(episodeKey, []);
    }

    const episodeStreams = this.streams.get(episodeKey)!;
    
    // Remove existing stream with same server/quality/language to avoid duplicates
    const filteredStreams = episodeStreams.filter(stream => 
      !(stream.server === serverId && 
        stream.quality.resolution === quality.resolution && 
        stream.language.type === language.type)
    );

    filteredStreams.push(streamSource);
    this.streams.set(episodeKey, filteredStreams);

    return streamSource;
  }

  /**
   * Get all stream sources for a specific episode
   * @param animeId - The anime identifier  
   * @param episodeNumber - Episode number
   */
  public getEpisodeStreams(animeId: string, episodeNumber: number): CustomStreamSource[] {
    const episodeKey = this.getEpisodeKey(animeId, episodeNumber);
    return this.streams.get(episodeKey) || [];
  }

  /**
   * Remove a stream source
   * @param streamId - The stream identifier
   */
  public removeStreamSource(streamId: string): boolean {
    for (const [episodeKey, streams] of this.streams.entries()) {
      const filteredStreams = streams.filter(stream => stream.id !== streamId);
      if (filteredStreams.length !== streams.length) {
        this.streams.set(episodeKey, filteredStreams);
        return true;
      }
    }
    return false;
  }

  /**
   * Add a new server
   * @param server - Server configuration
   */
  public addServer(server: StreamServer): void {
    this.servers.set(server.id, server);
  }

  /**
   * Get all active servers sorted by priority
   */
  public getActiveServers(): StreamServer[] {
    return Array.from(this.servers.values())
      .filter(server => server.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Bulk add streams from configuration
   * Useful for initializing multiple streams at once
   */
  public bulkAddStreams(streamConfigs: Array<{
    animeId: string;
    episodeNumber: number;
    streamUrl: string;
    quality?: StreamQuality;
    language?: StreamLanguage;
    serverId?: string;
  }>): CustomStreamSource[] {
    return streamConfigs.map(config => 
      this.addStreamSource(
        config.animeId,
        config.episodeNumber,
        config.streamUrl,
        config.quality,
        config.language,
        config.serverId
      )
    );
  }

  /**
   * Helper methods - Following DRY principle
   */
  private generateStreamId(animeId: string, episodeNumber: number, serverId: string): string {
    return `${animeId}-${episodeNumber}-${serverId}-${Date.now()}`;
  }

  private getEpisodeKey(animeId: string, episodeNumber: number): string {
    return `${animeId}-${episodeNumber}`;
  }

  /**
   * Get stream statistics for monitoring
   */
  public getStreamStats(): {
    totalStreams: number;
    activeStreams: number;
    streamsByServer: Record<string, number>;
  } {
    let totalStreams = 0;
    let activeStreams = 0;
    const streamsByServer: Record<string, number> = {};

    for (const streams of this.streams.values()) {
      for (const stream of streams) {
        totalStreams++;
        if (stream.isActive) activeStreams++;
        
        streamsByServer[stream.server] = (streamsByServer[stream.server] || 0) + 1;
      }
    }

    return {
      totalStreams,
      activeStreams,
      streamsByServer
    };
  }
}

// Singleton instance following best practices
export const customStreamService = new CustomStreamService();
