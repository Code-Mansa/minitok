"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function PostCard({
  mediaUrl,
  thumbnailUrl,
  viewsCount = 0,
  type,
}: {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  viewsCount?: number;
  type: "video" | "image";
}) {
  const displayUrl = thumbnailUrl || mediaUrl;
  const views =
    viewsCount > 1000
      ? `${(viewsCount / 1000).toFixed(1)}K`
      : viewsCount.toString();

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className='relative aspect-3/4 bg-black overflow-hidden'>
      <img
        src={displayUrl}
        alt=''
        className='h-full w-full object-cover'
        loading='lazy'
      />

      {/* Video indicator */}
      {type === "video" && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <Play
            size={32}
            className='text-white/70 drop-shadow-lg'
            fill='white'
          />
        </div>
      )}

      {/* Views count */}
      <div className='absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded'>
        <Play size={12} />
        {views}
      </div>
    </motion.div>
  );
}
