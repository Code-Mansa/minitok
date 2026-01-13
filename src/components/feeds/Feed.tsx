"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { FeedTabs } from "@/components/feeds/FeedTabs";
import { MuteToggle } from "@/components/feeds/MuteToggle";
import { VerticalFeed } from "@/components/feeds/VerticalFeed";
import { FeedType } from "@/types";

export default function Feed() {
  const [feedType, setFeedType] = useState<FeedType>("forYou");

  const [selectedPostId, setSelectedPostId] = useQueryState(
    "post",
    parseAsString.withOptions({
      shallow: true,
      history: "replace",
      scroll: false,
    })
  );

  // 🔥 Prevent clearing ?post= on initial page load
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // ✅ keep deep link on refresh
    }

    // User actually changed feed tab → clear deep link
    setSelectedPostId(null);
  }, [feedType, setSelectedPostId]);

  return (
    <main data-vaul-drawer-wrapper='' className='relative'>
      <FeedTabs feedType={feedType} onChange={setFeedType} />
      <MuteToggle />
      <VerticalFeed
        feedType={feedType}
        initialPostId={selectedPostId ?? undefined}
        onPostChange={setSelectedPostId}
      />
    </main>
  );
}
