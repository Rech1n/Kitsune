import { hybridStreamingService } from "@/lib/hybrid-streaming-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("animeEpisodeId") as string;
    const animeId = searchParams.get("animeId") as string;
    const episodeNumber = parseInt(searchParams.get("episodeNumber") || "1");
    const category = searchParams.get("category") as "sub" | "dub" | "raw";
    const server = searchParams.get("server") as string;
    const serverId = searchParams.get("serverId") as string; // New parameter for server selection

    if (!episodeId) {
      return Response.json({ error: "Episode ID is required" }, { status: 400 });
    }

    // If serverId is specified, get stream from specific server
    if (serverId) {
      try {
        const data = await hybridStreamingService.getStreamByServer(
          episodeId,
          animeId || episodeId,
          episodeNumber,
          serverId,
          category || "sub"
        );

        return Response.json({ 
          data,
          selectedServer: serverId
        });
      } catch (error) {
        console.error(`Error getting stream from server ${serverId}:`, error);
        // Fall back to HiAnime if custom server fails
        if (serverId !== 'hianime') {
          try {
            const fallbackData = await hybridStreamingService.getStreamByServer(
              episodeId,
              animeId || episodeId,
              episodeNumber,
              'hianime',
              category || "sub"
            );
            return Response.json({ 
              data: fallbackData,
              selectedServer: 'hianime',
              fallbackUsed: true,
              originalServerError: error instanceof Error ? error.message : 'Unknown error'
            });
          } catch (fallbackError) {
            console.error('Fallback to HiAnime also failed:', fallbackError);
          }
        }
      }
    }

    // Legacy behavior: if server parameter is provided (old format)
    if (server) {
      try {
        const data = await hybridStreamingService.getEpisodeStreams(
          episodeId,
          animeId || episodeId,
          episodeNumber,
          category || "sub"
        );

        // Return first available stream in HiAnime format
        if (data.availableStreams && data.availableStreams.length > 0) {
          const customStream = data.availableStreams[0];
          const hiAnimeFormat = {
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
          return Response.json({ data: hiAnimeFormat });
        }

        if (data.fallbackStreams && data.fallbackStreams.length > 0) {
          return Response.json({ data: data.fallbackStreams[0] });
        }

        // Return empty structure
        return Response.json({ 
          data: {
            headers: { Referer: "" },
            tracks: [],
            intro: { start: 0, end: 0 },
            outro: { start: 0, end: 0 },
            sources: [],
            anilistID: 0,
            malID: 0
          }
        });

      } catch (error) {
        console.error("Error getting legacy streams:", error);
      }
    }

    // New behavior: return server-organized streams
    const data = await hybridStreamingService.getEpisodeStreamsWithServers(
      episodeId,
      animeId || episodeId,
      episodeNumber,
      category || "sub"
    );

    return Response.json({ 
      data,
      serversAvailable: data.availableServers.map(s => ({
        id: s.id,
        name: s.name,
        priority: s.priority
      }))
    });
    
  } catch (err) {
    console.error(err);
    return Response.json({ error: "something went wrong" }, { status: 500 });
  }
}
