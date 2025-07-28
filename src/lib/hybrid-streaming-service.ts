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
   * Get episode streaming data with custom streams prioritized
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
      // Get custom streams first (prioritized)
      const customStreams = customStreamService.getEpisodeStreams(animeId, episodeNumber);
      
      // Filter custom streams by language category
      const filteredCustomStreams = customStreams.filter(stream => 
        stream.language.type === category && stream.isActive
      );

      // Get HiAnime streams as fallback
      let fallbackStreams: any[] = [];
      try {
        const hiAnimeData = await hianime.getEpisodeSources(
          decodeURIComponent(episodeId),
          undefined,
          category
        );
        fallbackStreams = hiAnimeData.sources || [];
      } catch (error) {
        console.warn('HiAnime fallback failed:', error);
      }

      return {
        episodeId,
        animeId,
        episodeNumber,
        availableStreams: filteredCustomStreams,
        fallbackStreams
      };
    } catch (error) {
      console.error('Error getting episode streams:', error);
      throw error;
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
