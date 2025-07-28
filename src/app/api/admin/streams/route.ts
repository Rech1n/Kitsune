import { hybridStreamingService } from "@/lib/hybrid-streaming-service";
import { NextRequest } from "next/server";

// GET - Get all custom streams for an anime/episode
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    
    if (action === "stats") {
      const stats = hybridStreamingService.getStreamingStats();
      return Response.json({ stats });
    }

    const animeId = searchParams.get("animeId");
    const episodeNumber = searchParams.get("episodeNumber");

    if (!animeId || !episodeNumber) {
      return Response.json({ 
        error: "animeId and episodeNumber are required" 
      }, { status: 400 });
    }

    // This would require implementing getEpisodeStreams in the service
    // For now, we'll return empty array as this is mainly for adding streams
    return Response.json({ 
      streams: [],
      message: "Use POST to add streams" 
    });

  } catch (error) {
    console.error("Error getting streams:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add custom stream
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (body.bulk && Array.isArray(body.streams)) {
      // Bulk add streams
      const addedStreams = hybridStreamingService.bulkAddCustomStreams(body.streams);
      return Response.json({ 
        success: true, 
        message: `Added ${addedStreams.length} streams`,
        streams: addedStreams 
      });
    } else {
      // Single stream
      const { animeId, episodeNumber, streamUrl, quality, language, serverId } = body;

      if (!animeId || !episodeNumber || !streamUrl) {
        return Response.json({ 
          error: "animeId, episodeNumber, and streamUrl are required" 
        }, { status: 400 });
      }

      const stream = hybridStreamingService.addCustomStream(
        animeId,
        episodeNumber,
        streamUrl,
        { quality, language, serverId }
      );

      return Response.json({ 
        success: true, 
        message: "Stream added successfully",
        stream 
      });
    }

  } catch (error) {
    console.error("Error adding stream:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove custom stream
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return Response.json({ 
        error: "streamId is required" 
      }, { status: 400 });
    }

    const removed = hybridStreamingService.removeCustomStream(streamId);

    if (removed) {
      return Response.json({ 
        success: true, 
        message: "Stream removed successfully" 
      });
    } else {
      return Response.json({ 
        error: "Stream not found" 
      }, { status: 404 });
    }

  } catch (error) {
    console.error("Error removing stream:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
