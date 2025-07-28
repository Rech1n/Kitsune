import { GET_EPISODE_SERVERS } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeServers } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeServers = async (episodeId: string) => {
  // Validate episode ID - SRP: Single validation responsibility
  if (!episodeId || episodeId.trim() === '') {
    throw new Error('Episode ID is required to fetch servers');
  }

  console.log(`🔍 Fetching servers for episode: ${episodeId}`);
  
  const res = await api.get("/api/episode/servers", {
    params: {
      animeEpisodeId: decodeURIComponent(episodeId),
    },
  });
  
  return res.data.data as IEpisodeServers;
};

export const useGetEpisodeServers = (episodeId: string) => {
  return useQuery({
    queryFn: () => getEpisodeServers(episodeId),
    queryKey: [GET_EPISODE_SERVERS, episodeId],
    refetchOnWindowFocus: false,
    // Don't run query if episodeId is empty - Defensive programming
    enabled: Boolean(episodeId && episodeId.trim() !== ''),
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error
      if (error instanceof Error && error.message.includes('Episode ID is required')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
