"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { VideoCard } from "./VideoCard";
import { useFollowingFeed } from "@/hooks/useFollowingFeed";
import { useForYouFeed } from "@/hooks/useForYouFeed";
import type { FeedType, Post } from "@/types";
import { Loader2 } from "lucide-react";
import { Spinner } from "../kibo-ui/spinner";

export function VerticalFeed({ feedType }: { feedType: FeedType }) {
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Stable callback for scroll selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setActiveIndex(index);

    // Trigger infinite scroll when near end
    if (
      feedType === "following" &&
      hasNextFollowing &&
      index >= posts.length - 3
    ) {
      fetchNextFollowing();
    }
  }, [emblaApi, posts.length, feedType, hasNextFollowing, fetchNextFollowing]);

  // Subscribe to select events
  useEffect(() => {
    if (!emblaApi) return;

    onSelect(); // Set initial active index safely
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset scroll on feed type change
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.scrollTo(0);
    // Don't call setActive(0) here — wait for "select" event to fire naturally
    // This avoids synchronous setState warning
  }, [feedType, emblaApi]);

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

        {/* Loading more indicator */}
        {isFetchingFollowing && feedType === "following" && (
          <div className='flex h-screen items-center justify-center'>
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
// import { forYouVideos, followingVideos } from "@/data/videos";
// import type { FeedType } from "@/types";

// export function VerticalFeed({ feedType }: { feedType: FeedType }) {
//   const videos = useMemo(
//     () => (feedType === "following" ? followingVideos : forYouVideos),
//     [feedType]
//   );

//   const [active, setActive] = useState(0);

//   const [emblaRef, embla] = useEmblaCarousel({
//     axis: "y",
//     align: "start",
//     skipSnaps: false,
//     dragFree: false,
//     containScroll: false,
//   });

//   // ✅ stable callback
//   const onSelect = useCallback(() => {
//     if (!embla) return;
//     setActive(embla.selectedScrollSnap());
//   }, [embla]);

//   // Subscribe once
//   useEffect(() => {
//     if (!embla) return;
//     embla.on("select", onSelect);
//     return () => {
//       embla.off("select", onSelect);
//     };
//   }, [embla, onSelect]);

//   // ✅ Reset position WITHOUT touching React state
//   useEffect(() => {
//     if (!embla) return;
//     embla.scrollTo(0, false);
//   }, [feedType, embla]);

//   return (
//     <div ref={emblaRef} className='max-h-screen overflow-hidden touch-pan-y'>
//       <div className='flex flex-col h-full'>
//         {videos.map((v, i) => (
//           <VideoCard key={v.id} video={v} active={i === active} />
//         ))}
//       </div>
//     </div>
//   );
// }
