import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileAPI } from "@/services/endpoints";
import api from "@/lib/api";

export function useProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => profileAPI.getProfile(username).then((res) => res.data),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => profileAPI.toggleFollow(username),

    onMutate: async (username: string) => {
      await queryClient.cancelQueries({
        queryKey: ["profile", username],
      });

      const previous = queryClient.getQueryData(["profile", username]);

      queryClient.setQueryData(
        ["profile", username],
        (old: any) =>
          old && {
            ...old,
            isFollowing: !old.isFollowing,
            followersCount: old.isFollowing
              ? old.followersCount - 1
              : old.followersCount + 1,
          }
      );

      return { previous, username };
    },

    onError: (_err, username, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["profile", username], context.previous);
      }
    },
  });
}

export function useProfilePosts(username: string, tab: string) {
  return useQuery({
    queryKey: ["profilePosts", username, tab],
    queryFn: async () => {
      const res = await api.get(`/users/${username}/posts?tab=${tab}`);
      return res.data.posts ?? []; // Always return array
    },
    enabled: !!username,
    placeholderData: [], // ← Critical: shows empty grid instead of nothing/flash
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // Keep cache longer
  });
}
