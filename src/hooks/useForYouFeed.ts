import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Post } from "@/types";

export function useForYouFeed() {
  return useQuery<{ posts: Post[] }>({
    queryKey: ["feed", "forYou"],
    queryFn: async () => {
      const res = await api.get<{ posts: Post[] }>("/feed/for-you");
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
