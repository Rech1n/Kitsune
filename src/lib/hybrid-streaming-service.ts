import { hianime } from "@/lib/hianime";
import { customStreamService } from "@/lib/custom-stream-service";
import { 
  EpisodeStreamResponse, 
  StreamMetadata,
  CustomStreamSource 
} from "@/types/custom-streaming";

/**
 * Hybrid streaming service that combines HiAnime metadata with custom streams
 * Follows Single Responsibility Principle and Dependency Inversion
 */
export class HybridStreamingService {
  
  /**
   * Get episode streaming data with custom streams organized by server
   * @param episodeId - HiAnime episode ID
   * @param animeId - Your internal anime ID
   * @param episodeNumber - Episode number
   * @param category - Stream category (sub/dub/raw)
   */
  public async getEpisodeStreamsWithServers(
    episodeId: string,
    animeId: string,
    episodeNumber: number,
    category: "sub" | "dub" | "raw" = "sub"
  ) {
    try {
      // Get custom streams from all servers
      const customStreams = customStreamService.getEpisodeStreams(animeId, episodeNumber);
      const filteredCustomStreams = customStreams.filter(stream => 
        stream.language.type === category && stream.isActive
      );

      // Get available servers
      const availableServers = customStreamService.getActiveServers();

      // Get HiAnime streams as fallback
      let hiAnimeStreams: any = null;
      try {
        const hiAnimeData = await hianime.getEpisodeSources(
          decodeURIComponent(episodeId),
          undefined,
          category
        );
        
        if (hiAnimeData && hiAnimeData.sources && hiAnimeData.sources.length > 0) {
          hiAnimeStreams = hiAnimeData;
        }
      } catch (error) {
        console.warn('HiAnime streams not available:', error);
      }

      // Organize streams by server
      const serverStreams = new Map();

      // Add HiAnime as default server (ALWAYS present)
      // Fix: HiAnime should always appear, even if no streams available
      serverStreams.set('hianime', {
        id: 'hianime',
        name: 'HiAnime (Default)',
        priority: 999, // Highest priority
        isActive: true,
        streamData: hiAnimeStreams || {
          headers: { Referer: "" },
          tracks: [],
          intro: { start: 0, end: 0 },
          outro: { start: 0, end: 0 },
          sources: [],
          anilistID: 0,
          malID: 0
        },
        hasStreams: hiAnimeStreams?.sources?.length > 0 || false
      });

      // Add custom servers with their streams
      availableServers.forEach(server => {
        const serverCustomStreams = filteredCustomStreams.filter(stream => 
          stream.server === server.id
        );

        if (serverCustomStreams.length > 0) {
          serverStreams.set(server.id, {
            id: server.id,
            name: server.name,
            priority: server.priority,
            isActive: server.isActive,
            streams: serverCustomStreams,
            streamData: this.convertCustomStreamToHiAnimeFormat(serverCustomStreams[0])
          });
        }
      });

      // Convert to array and sort by priority
      const serversArray = Array.from(serverStreams.values())
        .sort((a, b) => b.priority - a.priority);

      return {
        episodeId,
        animeId,
        episodeNumber,
        availableServers: serversArray,
        totalServers: serversArray.length,
        hasCustomStreams: filteredCustomStreams.length > 0,
        hasHiAnimeStreams: !!hiAnimeStreams
      };
    } catch (error) {
      console.error('Error getting episode streams with servers:', error);
      throw error;
    }
  }

  /**
   * Get episode streaming data with custom streams prioritized (legacy method)
   * @param episodeId - HiAnime episode ID
   * @param animeId - Your internal anime ID
   * @param episodeNumber - Episode number
   * @param category - Stream category (sub/dub/raw)
   */
  public async getEpisodeStreams(
    episodeId: string,
    animeId: string,
    episodeNumber: number,
    category: "sub" | "dub" | "raw" = "sub"
  ): Promise<EpisodeStreamResponse> {
    try {
      const serverData = await this.getEpisodeStreamsWithServers(episodeId, animeId, episodeNumber, category);
      
      // Convert back to legacy format for compatibility
      const customStreams = [];
      const fallbackStreams = [];
      
      for (const server of serverData.availableServers) {
        if (server.id === 'hianime') {
          fallbackStreams.push(server.streamData);
        } else if (server.streams) {
          customStreams.push(...server.streams);
        }
      }

      return {
        episodeId,
        animeId,
        episodeNumber,
        availableStreams: customStreams,
        fallbackStreams
      };
    } catch (error) {
      console.error('Error getting episode streams:', error);
      throw error;
    }
  }

  /**
   * Get specific server stream for episode
   * @param episodeId - Episode ID
   * @param animeId - Anime ID
   * @param episodeNumber - Episode number
   * @param serverId - Server ID ('hianime', 'yaichi-anime', etc.)
   * @param category - Stream category
   */
  public async getStreamByServer(
    episodeId: string,
    animeId: string,
    episodeNumber: number,
    serverId: string,
    category: "sub" | "dub" | "raw" = "sub"
  ) {
    try {
      const serverData = await this.getEpisodeStreamsWithServers(episodeId, animeId, episodeNumber, category);
      
      const selectedServer = serverData.availableServers.find(server => server.id === serverId);
      
      if (!selectedServer) {
        throw new Error(`Server ${serverId} not found or has no streams available`);
      }

      return selectedServer.streamData;
    } catch (error) {
      console.error(`Error getting stream from server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available servers for an episode
   * @param animeId - Anime ID
   * @param episodeNumber - Episode number
   */
  public async getAvailableServersForEpisode(animeId: string, episodeNumber: number) {
    try {
      // Get custom streams
      const customStreams = customStreamService.getEpisodeStreams(animeId, episodeNumber);
      const activeCustomStreams = customStreams.filter(stream => stream.isActive);
      
      // Get available custom servers
      const availableServers = customStreamService.getActiveServers();
      
      // Filter servers that have streams for this episode
      const serversWithStreams = availableServers.filter(server => 
        activeCustomStreams.some(stream => stream.server === server.id)
      );

      // Always include HiAnime as available
      const allServers = [
        {
          id: 'hianime',
          name: 'HiAnime (Default)',
          priority: 999,
          isActive: true,
          hasStreams: true
        },
        ...serversWithStreams.map(server => ({
          id: server.id,
          name: server.name,
          priority: server.priority,
          isActive: server.isActive,
          hasStreams: true
        }))
      ].sort((a, b) => b.priority - a.priority);

      return allServers;
    } catch (error) {
      console.error('Error getting available servers:', error);
      return [{
        id: 'hianime',
        name: 'HiAnime (Default)',  
        priority: 999,
        isActive: true,
        hasStreams: true
      }];
    }
  }

  /**
   * Get anime information from HiAnime
   * @param animeId - HiAnime anime ID
   */
  public async getAnimeInfo(animeId: string) {
    return await hianime.getInfo(animeId);
  }

  /**
   * Get anime episodes from HiAnime
   * @param animeId - HiAnime anime ID
   */
  public async getAnimeEpisodes(animeId: string) {
    return await hianime.getEpisodes(animeId);
  }

  /**
   * Search anime using HiAnime
   * @param query - Search query
   * @param page - Page number
   * @param filters - Search filters
   */
  public async searchAnime(query: string, page?: number, filters?: any) {
    return await hianime.search(query, page, filters);
  }

  /**
   * Get home page data from HiAnime
   */
  public async getHomePage() {
    return await hianime.getHomePage();
  }

  /**
   * Get episode servers from HiAnime
   * @param episodeId - Episode ID
   */
  public async getEpisodeServers(episodeId: string) {
    return await hianime.getEpisodeServers(episodeId);
  }

  /**
   * Get search suggestions from HiAnime
   * @param title - Anime title
   */
  public async getSearchSuggestions(title: string) {
    return await hianime.searchSuggestions(title);
  }

  /**
   * Get estimated schedule from HiAnime
   * @param date - Date string
   */
  public async getEstimatedSchedule(date: string) {
    return await hianime.getEstimatedSchedule(date);
  }

  /**
   * Add custom stream for an anime episode
   * This is where you'll add your custom stream links
   */
  public addCustomStream(
    animeId: string,
    episodeNumber: number,
    streamUrl: string,
    options?: {
      quality?: "480p" | "720p" | "1080p" | "1440p" | "4K";
      language?: "sub" | "dub" | "raw";
      serverId?: string;
    }
  ): CustomStreamSource {
    return customStreamService.addStreamSource(
      animeId,
      episodeNumber,
      streamUrl,
      { resolution: options?.quality || "1080p" },
      { type: options?.language || "sub" },
      options?.serverId
    );
  }

  /**
   * Bulk add custom streams
   * Useful for adding multiple episodes at once
   */
  public bulkAddCustomStreams(streams: Array<{
    animeId: string;
    episodeNumber: number;
    streamUrl: string;
    quality?: "480p" | "720p" | "1080p" | "1440p" | "4K";
    language?: "sub" | "dub" | "raw";
  }>) {
    return customStreamService.bulkAddStreams(
      streams.map(stream => ({
        animeId: stream.animeId,
        episodeNumber: stream.episodeNumber,
        streamUrl: stream.streamUrl,
        quality: { resolution: stream.quality || "1080p" },
        language: { type: stream.language || "sub" }
      }))
    );
  }

  /**
   * Remove custom stream
   */
  public removeCustomStream(streamId: string): boolean {
    return customStreamService.removeStreamSource(streamId);
  }

  /**
   * Get streaming statistics
   */
  public getStreamingStats() {
    return customStreamService.getStreamStats();
  }

  /**
   * Convert custom stream to HiAnime format for compatibility
   * @param customStream - Custom stream to convert
   */
  private convertCustomStreamToHiAnimeFormat(customStream: CustomStreamSource): any {
    return {
      headers: { Referer: "" },
      tracks: [],
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      sources: [
        {
          url: customStream.streamUrl,
          quality: customStream.quality.resolution,
          isM3U8: customStream.streamUrl.includes('.m3u8')
        }
      ],
      anilistID: 0,
      malID: 0
    };
  }

  /**
   * Get the best available stream for an episode
   * Prioritizes custom streams, falls back to HiAnime
   */
  public async getBestAvailableStream(
    episodeId: string,
    animeId: string,
    episodeNumber: number,
    category: "sub" | "dub" | "raw" = "sub"
  ) {
    try {
      const streamData = await this.getEpisodeStreams(episodeId, animeId, episodeNumber, category);
      
      // If we have custom streams, return the first one in HiAnime format
      if (streamData.availableStreams && streamData.availableStreams.length > 0) {
        return this.convertCustomStreamToHiAnimeFormat(streamData.availableStreams[0]);
      }
      
      // If we have fallback streams, return the first one
      if (streamData.fallbackStreams && streamData.fallbackStreams.length > 0) {
        return streamData.fallbackStreams[0];
      }
      
      // Return empty structure if nothing is available
      return {
        headers: { Referer: "" },
        tracks: [],
        intro: { start: 0, end: 0 },
        outro: { start: 0, end: 0 },
        sources: [],
        anilistID: 0,
        malID: 0
      };
    } catch (error) {
      console.error('Error getting best available stream:', error);
      throw error;
    }
  }

  /**
   * Search anime by title using HiAnime
   * Returns a list of anime results to choose from
   */
  public async searchAnimeByTitle(title: string, page: number = 1) {
    try {
      const searchResults = await hianime.search(title, page);
      return searchResults;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions from HiAnime
   * Useful for autocomplete functionality
   */
  public async getAnimeSearchSuggestions(title: string) {
    try {
      const suggestions = await hianime.searchSuggestions(title);
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hybridStreamingService = new HybridStreamingService();
