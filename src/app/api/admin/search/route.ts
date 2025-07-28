import { hybridStreamingService } from "@/lib/hybrid-streaming-service";
import { NextRequest } from "next/server";

// GET - Search anime by title
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type") || "search"; // "search" or "suggestions"

    if (!query) {
      return Response.json({ 
        error: "Query parameter 'q' is required" 
      }, { status: 400 });
    }

    let results;
    
    if (type === "suggestions") {
      // Get quick suggestions for autocomplete
      results = await hybridStreamingService.getAnimeSearchSuggestions(query);
    } else {
      // Full search with pagination
      results = await hybridStreamingService.searchAnimeByTitle(query, page);
    }

    return Response.json({ 
      success: true,
      query,
      page: type === "search" ? page : undefined,
      results
    });

  } catch (error) {
    console.error("Error searching anime:", error);
    return Response.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
