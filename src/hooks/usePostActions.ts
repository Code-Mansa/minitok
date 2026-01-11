import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Post } from "@/types";
import api from "@/lib/api";
import { postAPI } from "./../services/endpoints";

export function useLikePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postAPI.toggleLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed", "forYou"] });

      const previous = queryClient.getQueryData<{ posts: Post[] }>([
        "feed",
        "forYou",
      ]);

      queryClient.setQueryData<{ posts: Post[] }>(["feed", "forYou"], (old) => {
        if (!old) return old;
        return {
          posts: old.posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likedByMe: !post.likedByMe,
                  likesCount: post.likedByMe
                    ? post.likesCount - 1
                    : post.likesCount + 1,
                }
              : post
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["feed", "forYou"], context.previous);
      }
    },
    // ← REMOVE onSettled invalidateQueries
  });
}

export function useBookmarkPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postAPI.toggleBookmark(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed", "forYou"] });

      const previous = queryClient.getQueryData<{ posts: Post[] }>([
        "feed",
        "forYou",
      ]);

      queryClient.setQueryData<{ posts: Post[] }>(["feed", "forYou"], (old) => {
        if (!old) return old;
        return {
          posts: old.posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  bookmarkedByMe: !post.bookmarkedByMe,
                  bookmarkCount: post.bookmarkedByMe
                    ? post.bookmarkCount - 1
                    : post.bookmarkCount + 1,
                }
              : post
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["feed", "forYou"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "forYou"] });
    },
  });
}
