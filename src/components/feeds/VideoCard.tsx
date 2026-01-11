import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share } from "lucide-react";
import { usePlayerStore } from "@/lib/store";
import { TbMessage } from "react-icons/tb";
import { CommentsDrawer } from "./CommentsDrawer";
import { Post } from "@/types";
import { useBookmarkPost, useLikePost } from "@/hooks/usePostActions";

export function VideoCard({ post, active }: { post: Post; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const { muted } = usePlayerStore();
  const { user } = useAuth();

  const likeMutation = useLikePost(post._id);
  const bookmarkMutation = useBookmarkPost(post._id);

  // Optimistic local state for instant UI feedback
  const [isLiked, setIsLiked] = useState(() => !!post.likedByMe);
  const [isBookmarked, setIsBookmarked] = useState(() => !!post.bookmarkedByMe);

  // Counts from props (updated via optimistic cache + refetch)
  const likesCount = post.likesCount ?? "";
  const bookmarkCount = post.bookmarkCount ?? "";

  const [comments] = useState(post.commentsCount ?? "");
  const [openComments, setOpenComments] = useState(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState(0);

  // Instant optimistic toggle on click
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    likeMutation.mutate();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
    bookmarkMutation.mutate();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (!isLiked) {
        setIsLiked(true);
        likeMutation.mutate();
      }
    }
    setLastTap(now);
  };

  // Video play/pause
  useEffect(() => {
    if (post.type !== "video") return;
    if (!videoRef.current || !bgVideoRef.current) return;

    if (active) {
      videoRef.current.play().catch(() => {});
      bgVideoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      bgVideoRef.current.pause();
    }
  }, [active, post.type]);

  // Caption collapsed height
  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      setCollapsedHeight(lineHeight);
    }
  }, []);

  const isVideo = post.type === "video";

  return (
    <>
      <motion.div
        layout
        className='relative h-dvh w-full bg-black overflow-hidden flex flex-col shrink-0'
        onClick={handleDoubleTap}>
        <motion.div layout className='relative flex-1'>
          {isVideo ? (
            <video
              ref={bgVideoRef}
              src={post.mediaUrl}
              muted
              loop
              playsInline
              className='absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-40'
            />
          ) : (
            <div
              className='absolute inset-0 h-full w-full bg-cover bg-center blur-2xl scale-110 opacity-40'
              style={{ backgroundImage: `url(${post.mediaUrl})` }}
            />
          )}

          {isVideo ? (
            <video
              ref={videoRef}
              src={post.mediaUrl}
              muted={muted}
              loop
              playsInline
              className='relative z-10 h-full w-full object-contain'
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current?.paused) {
                  videoRef.current.play();
                } else {
                  videoRef.current?.pause();
                }
              }}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.caption || "Post"}
              className='relative z-10 h-full w-full object-contain'
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {!openComments && (
            <div className='absolute bottom-17 left-4 z-20 text-white space-y-2 max-w-[80%]'>
              <p className='font-semibold'>{post.author.username}</p>
              <motion.div layout className='text-sm opacity-90 max-w-full'>
                <motion.div
                  initial={false}
                  animate={{ height: expanded ? "auto" : collapsedHeight }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  className='overflow-hidden'>
                  <p ref={textRef} className='leading-snug'>
                    {post.caption}
                  </p>
                </motion.div>

                {post.caption?.length > 60 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                    className='text-white font-medium'>
                    {expanded ? "less" : "... more"}
                  </button>
                )}
              </motion.div>
            </div>
          )}

          {!openComments ||
            (user && (
              <div className='absolute right-4 bottom-30 z-20 flex flex-col items-center gap-6 text-white'>
                {/* Like */}
                <motion.button whileTap={{ scale: 1.4 }} onClick={handleLike}>
                  <Heart
                    className={
                      isLiked ? "fill-red-500 text-red-500" : "text-white"
                    }
                  />
                  {likesCount > 0 && (
                    <span className='text-xs mt-1'>{likesCount}</span>
                  )}
                </motion.button>

                {/* Comment */}
                <button onClick={() => setOpenComments(true)}>
                  <TbMessage size={24} />
                  {comments > 0 && (
                    <span className='text-xs mt-1 block text-center'>
                      {comments}
                    </span>
                  )}
                </button>

                {/* Bookmark */}
                <motion.button
                  whileTap={{ scale: 1.4 }}
                  onClick={handleBookmark}>
                  <motion.svg
                    animate={{ scale: isBookmarked ? 1 : [1, 1.4, 1] }}
                    transition={{ duration: 0.25 }}
                    className={
                      isBookmarked
                        ? "fill-yellow-400 drop-shadow-md"
                        : "fill-white"
                    }
                    width='28'
                    height='28'
                    viewBox='0 0 24 24'>
                    <path d='M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z' />
                  </motion.svg>
                  {bookmarkCount > 0 && (
                    <span className='text-xs mt-1'>{bookmarkCount}</span>
                  )}
                </motion.button>

                {/* Share */}
                <button>
                  <Share size={24} />
                </button>
              </div>
            ))}
        </motion.div>

        <CommentsDrawer
          open={openComments}
          onOpenChange={setOpenComments}
          postId={post._id}
          commentsCount={comments}
        />
      </motion.div>
    </>
  );
}
