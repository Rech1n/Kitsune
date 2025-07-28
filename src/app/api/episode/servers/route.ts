import { hianime } from "@/lib/hianime";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const animeEpisodeId = searchParams.get("animeEpisodeId") as string;

    // Validate required parameter - SRP: Single validation responsibility
    if (!animeEpisodeId || animeEpisodeId.trim() === '') {
      console.error('❌ Missing or empty animeEpisodeId parameter');
      return Response.json(
        { 
          error: "Missing required parameter: animeEpisodeId",
          details: "animeEpisodeId is required to fetch episode servers"
        }, 
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching servers for episode: ${animeEpisodeId}`);

    const data = await hianime.getEpisodeServers(
      decodeURIComponent(animeEpisodeId),
    );
    
    console.log(`✅ Successfully fetched ${data?.servers?.length || 0} servers`);
    return Response.json({ data });
  } catch (err) {
    console.error('❌ Episode servers error:', err);
    
    // Better error handling - provide more context
    if (err instanceof Error) {
      return Response.json({ 
        error: "Failed to fetch episode servers",
        details: err.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return Response.json({ 
      error: "Unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
