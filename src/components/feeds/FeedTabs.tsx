"use client";

import { FeedType } from "@/types";
import { motion } from "framer-motion";

const tabs: { label: string; value: FeedType }[] = [
  { label: "Following", value: "following" },
  { label: "For You", value: "forYou" },
];

export function FeedTabs({
  feedType,
  onChange,
}: {
  feedType: FeedType;
  onChange: (type: FeedType) => void;
}) {
  return (
    <div className='fixed top-4 left-1/2 z-40 -translate-x-1/2 w-full pl-4'>
      <div className='relative flex gap-6 text-sm text-white/60'>
        {tabs.map((tab) => {
          const active = feedType === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className='relative font-medium'>
              <span className={active ? "text-white" : ""}>{tab.label}</span>

              {active && (
                <motion.div
                  layoutId='feed-tab-indicator'
                  className='absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full'
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
