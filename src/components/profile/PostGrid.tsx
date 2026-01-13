"use client";

import Link from "next/link";
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

export function PostGrid({ posts, isLoading, activeTab }: PostGridProps) {
  const skeletons = Array.from({ length: 9 }, (_, i) => i);

  if (isLoading || posts === undefined) {
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
          <Link
            key={post._id}
            href={`/?post=${post._id}`}
            scroll={false} // important for feed UX
          >
            <PostCard {...post} />
          </Link>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
