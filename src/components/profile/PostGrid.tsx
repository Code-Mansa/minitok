"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "./PostCard";

type Post = {
  _id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  viewsCount?: number;
  type: "video" | "image";
};

type PostGridProps = {
  posts?: Post[];
  isLoading?: boolean;
  activeTab: string;
};

export function PostGrid({
  posts = [],
  isLoading = false,
  activeTab,
}: PostGridProps) {
  // Skeleton placeholders
  const skeletons = Array.from({ length: 9 }, (_, i) => i);

  if (isLoading) {
    return (
      <div className='grid grid-cols-3 gap-px p-px'>
        {skeletons.map((i) => (
          <div key={i} className='aspect-3/4 bg-gray-700 animate-pulse' />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    const messages: Record<string, string> = {
      posts: "No posts yet",
      clips: "No clips yet",
      bookmarks: "No bookmarked posts",
      likes: "No liked posts",
    };

    return (
      <div className='flex flex-col items-center justify-center py-20 text-gray-500'>
        <p className='text-lg'>{messages[activeTab] ?? "Nothing here yet"}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className='grid grid-cols-3 gap-px'>
        {posts.map((post) => (
          <PostCard
            key={post._id}
            mediaUrl={post.mediaUrl}
            thumbnailUrl={post.thumbnailUrl}
            viewsCount={post.viewsCount ?? 0}
            type={post.type}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
