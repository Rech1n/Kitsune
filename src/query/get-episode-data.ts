import { GET_EPISODE_DATA } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeSource } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeData = async (
  episodeId: string,
  server: string | undefined,
  subOrDub: string,
) => {
  try {
    const res = await api.get("/api/episode/sources", {
      params: {
        animeEpisodeId: decodeURIComponent(episodeId),
        server: server,
        category: subOrDub,
      },
    });
    
    // Asegurarnos de que la respuesta tenga la estructura correcta
    const data = res.data.data as IEpisodeSource;
    
    // Si no hay sources, crear una estructura vacía válida
    if (!data || !data.sources) {
      return {
        headers: { Referer: "" },
        tracks: [],
        intro: { start: 0, end: 0 },
        outro: { start: 0, end: 0 },
        sources: [],
        anilistID: 0,
        malID: 0
      } as IEpisodeSource;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching episode data:", error);
    // Retornar estructura vacía en caso de error
    return {
      headers: { Referer: "" },
      tracks: [],
      intro: { start: 0, end: 0 },
      outro: { start: 0, end: 0 },
      sources: [],
      anilistID: 0,
      malID: 0
    } as IEpisodeSource;
  }
};

export const useGetEpisodeData = (
  episodeId: string,
  server: string | undefined,
  subOrDub: string = "sub",
) => {
  return useQuery({
    queryFn: () => getEpisodeData(episodeId, server, subOrDub),
    queryKey: [GET_EPISODE_DATA, episodeId, server, subOrDub],
    refetchOnWindowFocus: false,
    enabled: server !== "" && episodeId !== "",
    retry: 1, // Solo reintentar una vez
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
