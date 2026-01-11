import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { FeedResponse } from "@/types";

export function useFollowingFeed() {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ["feed", "following"],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<FeedResponse>("/feed/following", {
        params: {
          limit: 10,
          cursor: pageParam,
        },
      });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60, // 1 minute
  });
}
