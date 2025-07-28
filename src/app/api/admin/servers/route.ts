import { hybridStreamingService } from "@/lib/hybrid-streaming-service";
import { NextRequest } from "next/server";

// GET - Get available servers for an episode
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const animeId = searchParams.get("animeId");
    const episodeNumber = parseInt(searchParams.get("episodeNumber") || "1");
    const episodeId = searchParams.get("episodeId");
    const category = searchParams.get("category") as "sub" | "dub" | "raw" || "sub";

    if (!animeId) {
      return Response.json({ 
        error: "animeId parameter is required" 
      }, { status: 400 });
    }

    // Get available servers for this episode
    const servers = await hybridStreamingService.getAvailableServersForEpisode(animeId, episodeNumber);

    // If episodeId is provided, also get the complete server data with streams
    let serverStreams = null;
    if (episodeId) {
      try {
        serverStreams = await hybridStreamingService.getEpisodeStreamsWithServers(
          episodeId,
          animeId,
          episodeNumber,
          category
        );
      } catch (error) {
        console.warn('Could not get server streams:', error);
      }
    }

    return Response.json({ 
      success: true,
      animeId,
      episodeNumber,
      servers,
      serverStreams
    });

  } catch (error) {
    console.error("Error getting available servers:", error);
    return Response.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
