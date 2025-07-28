import { hybridStreamingService } from "@/lib/hybrid-streaming-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("animeEpisodeId") as string;
    const animeId = searchParams.get("animeId") as string; // Your internal anime ID
    const episodeNumber = parseInt(searchParams.get("episodeNumber") || "1");
    const category = searchParams.get("category") as "sub" | "dub" | "raw";

    if (!episodeId) {
      return Response.json({ error: "Episode ID is required" }, { status: 400 });
    }

    const data = await hybridStreamingService.getEpisodeStreams(
      episodeId,
      animeId || episodeId, // Fallback to episodeId if animeId not provided
      episodeNumber,
      category || "sub"
    );

    return Response.json({ data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "something went wrong" }, { status: 500 });
  }
}
