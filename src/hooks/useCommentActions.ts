import { commentAPI, postAPI } from "@/services/endpoints";
import { Post } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, parent }: { text: string; parent?: string }) =>
      postAPI.postComment(postId, { text, parent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Also update post commentsCount in feeds
      ["feed", "forYou"].forEach((key) =>
        queryClient.setQueryData<{ posts: Post[] }>([key], (old) => {
          if (!old) return old;
          return {
            posts: old.posts.map((p) =>
              p._id === postId
                ? { ...p, commentsCount: p.commentsCount + 1 }
                : p
            ),
          };
        })
      );
    },
  });
}

export function useLikeComment(commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => commentAPI.toggleLike(commentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueryData<any>(["comments"]);

      queryClient.setQueryData(["comments"], (old: any) => {
        if (!old) return old;
        return old.map((c: any) =>
          c._id === commentId
            ? {
                ...c,
                likedByMe: !c.likedByMe,
                likesCount: c.likedByMe ? c.likesCount - 1 : c.likesCount + 1,
              }
            : c
        );
      });

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous)
        queryClient.setQueryData(["comments"], context.previous);
    },
  });
}
