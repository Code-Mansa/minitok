"use client";

import { useState } from "react";
import { FeedTabs } from "@/components/feeds/FeedTabs";
import { MuteToggle } from "@/components/feeds/MuteToggle";
import { VerticalFeed } from "@/components/feeds/VerticalFeed";
import { FeedType } from "@/types";

export default function Page() {
  const [feedType, setFeedType] = useState<FeedType>("forYou");

  return (
    <main data-vaul-drawer-wrapper='' className='relative'>
      <FeedTabs feedType={feedType} onChange={setFeedType} />
      <MuteToggle />
      <VerticalFeed feedType={feedType} />
    </main>
  );
}
