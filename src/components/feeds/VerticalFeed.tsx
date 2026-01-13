// components/feeds/VerticalFeed.tsx
"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VideoCard } from "./VideoCard";
import { useFollowingFeed } from "@/hooks/useFollowingFeed";
import { useForYouFeed } from "@/hooks/useForYouFeed";
import type { FeedType, Post } from "@/types";
import { Loader2 } from "lucide-react";
import { Spinner } from "../kibo-ui/spinner";

type VerticalFeedProps = {
  feedType: FeedType;
  initialPostId?: string;
  onPostChange?: (postId: string | null) => void;
};

export function VerticalFeed({
  feedType,
  initialPostId,
  onPostChange,
}: VerticalFeedProps) {
  const {
    data: followingData,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasNextFollowing,
    isFetchingNextPage: isFetchingFollowing,
  } = useFollowingFeed();

  const { data: forYouData, isLoading: isLoadingForYou } = useForYouFeed();

  const posts: Post[] = useMemo(() => {
    if (feedType === "following") {
      return followingData?.pages.flatMap((page) => page.posts) ?? [];
    }
    return forYouData?.posts ?? [];
  }, [feedType, followingData, forYouData]);

  const initialTargetIndex = useMemo(() => {
    if (!initialPostId) return 0;
    const idx = posts.findIndex((p) => p._id === initialPostId);
    return idx >= 0 ? idx : -1; // -1 = not found yet
  }, [posts, initialPostId]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      axis: "y",
      align: "start",
      skipSnaps: false,
      dragFree: false,
      containScroll: false,
      startIndex: 0, // always safe to start at 0
    },
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  // Single unified select handler
  const handleSelect = useCallback(() => {
    if (!emblaApi) return;

    const index = emblaApi.selectedScrollSnap();
    setActiveIndex(index);

    // Update URL
    if (onPostChange) {
      const currentPost = posts[index];
      if (currentPost?._id) {
        onPostChange(currentPost._id);
      } else if (index >= posts.length - 1) {
        // Near the end, but post not loaded yet → keep current url
        // (prevents aggressive clearing)
      } else {
        onPostChange(null);
      }
    }

    // Infinite scroll trigger
    if (
      feedType === "following" &&
      hasNextFollowing &&
      index >= posts.length - 4
    ) {
      fetchNextFollowing();
    }
  }, [
    emblaApi,
    posts,
    onPostChange,
    feedType,
    hasNextFollowing,
    fetchNextFollowing,
  ]);

  // Subscribe to embla events
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", handleSelect);
    emblaApi.on("settle", handleSelect); // sometimes helpful

    // Initial sync
    handleSelect();

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("settle", handleSelect);
    };
  }, [emblaApi, handleSelect]);

  // ─── IMPROVED INITIAL SCROLL LOGIC ──────────────────────────────────────
  const hasAttemptedInitialScroll = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;
    if (!initialPostId) return;
    if (initialTargetIndex < 0) return;

    emblaApi.scrollTo(initialTargetIndex, true);
  }, [emblaApi, initialPostId, initialTargetIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    if (!initialPostId) {
      // No deep link → just reset
      emblaApi.scrollTo(0, true);
      hasAttemptedInitialScroll.current = true;
      return;
    }

    // Target post already loaded → scroll immediately
    if (initialTargetIndex >= 0) {
      emblaApi.scrollTo(initialTargetIndex, true); // true = instant jump
      hasAttemptedInitialScroll.current = true;
      return;
    }

    // Target not loaded yet → wait & retry when posts grow
    if (!hasAttemptedInitialScroll.current && posts.length > 0) {
      const tryScroll = () => {
        const foundIndex = posts.findIndex((p) => p._id === initialPostId);
        if (foundIndex >= 0 && emblaApi) {
          emblaApi.scrollTo(foundIndex, true);
          hasAttemptedInitialScroll.current = true;
        }
      };

      tryScroll(); // immediate try

      // Progressive retries (increase delay if feed is very long)
      const timers = [
        setTimeout(tryScroll, 300),
        setTimeout(tryScroll, 800),
        setTimeout(tryScroll, 1800), // last hope
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [emblaApi, initialPostId, initialTargetIndex, posts.length, feedType]);

  const isLoading = feedType === "forYou" ? isLoadingForYou : false;

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner variant='ellipsis' className='text-yellow-500' />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className='flex h-screen flex-col items-center justify-center text-white/60'>
        <p className='text-xl'>No posts yet</p>
        {feedType === "following" && (
          <p className='mt-2 text-sm'>
            Start following people to see their posts
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={emblaRef} className='max-h-screen overflow-hidden'>
      <div className='flex flex-col'>
        {posts.map((post, i) => (
          <VideoCard key={post._id} post={post} active={i === activeIndex} />
        ))}

        {isFetchingFollowing && feedType === "following" && (
          <div className='flex h-[80vh] items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-white' />
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import useEmblaCarousel from "embla-carousel-react";
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { VideoCard } from "./VideoCard";
// import { useFollowingFeed } from "@/hooks/useFollowingFeed";
// import { useForYouFeed } from "@/hooks/useForYouFeed";
// import type { FeedType, Post } from "@/types";
// import { Loader2 } from "lucide-react";
// import { Spinner } from "../kibo-ui/spinner";

// export function VerticalFeed({ feedType }: { feedType: FeedType }) {
//   const {
//     data: followingData,
//     fetchNextPage: fetchNextFollowing,
//     hasNextPage: hasNextFollowing,
//     isFetchingNextPage: isFetchingFollowing,
//   } = useFollowingFeed();

//   const { data: forYouData, isLoading: isLoadingForYou } = useForYouFeed();

//   const posts: Post[] = useMemo(() => {
//     if (feedType === "following") {
//       return followingData?.pages.flatMap((page) => page.posts) ?? [];
//     }
//     return forYouData?.posts ?? [];
//   }, [feedType, followingData, forYouData]);

//   const [emblaRef, emblaApi] = useEmblaCarousel({
//     axis: "y",
//     align: "start",
//     skipSnaps: false,
//     dragFree: false,
//     containScroll: false,
//   });

//   const [activeIndex, setActiveIndex] = useState(0);

//   // Stable callback for scroll selection
//   const onSelect = useCallback(() => {
//     if (!emblaApi) return;
//     const index = emblaApi.selectedScrollSnap();
//     setActiveIndex(index);

//     // Trigger infinite scroll when near end
//     if (
//       feedType === "following" &&
//       hasNextFollowing &&
//       index >= posts.length - 3
//     ) {
//       fetchNextFollowing();
//     }
//   }, [emblaApi, posts.length, feedType, hasNextFollowing, fetchNextFollowing]);

//   // Subscribe to select events
//   useEffect(() => {
//     if (!emblaApi) return;

//     onSelect(); // Set initial active index safely
//     emblaApi.on("select", onSelect);

//     return () => {
//       emblaApi.off("select", onSelect);
//     };
//   }, [emblaApi, onSelect]);

//   // Reset scroll on feed type change
//   useEffect(() => {
//     if (!emblaApi) return;

//     emblaApi.scrollTo(0);
//     // Don't call setActive(0) here — wait for "select" event to fire naturally
//     // This avoids synchronous setState warning
//   }, [feedType, emblaApi]);

//   const isLoading = feedType === "forYou" ? isLoadingForYou : false;

//   if (isLoading) {
//     return (
//       <div className='flex h-screen items-center justify-center'>
//         <Spinner variant='ellipsis' className='text-yellow-500' />
//       </div>
//     );
//   }

//   if (posts.length === 0) {
//     return (
//       <div className='flex h-screen flex-col items-center justify-center text-white/60'>
//         <p className='text-xl'>No posts yet</p>
//         {feedType === "following" && (
//           <p className='mt-2 text-sm'>
//             Start following people to see their posts
//           </p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div ref={emblaRef} className='max-h-screen overflow-hidden'>
//       <div className='flex flex-col'>
//         {posts.map((post, i) => (
//           <VideoCard key={post._id} post={post} active={i === activeIndex} />
//         ))}

//         {/* Loading more indicator */}
//         {isFetchingFollowing && feedType === "following" && (
//           <div className='flex h-screen items-center justify-center'>
//             <Loader2 className='h-8 w-8 animate-spin text-white' />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
