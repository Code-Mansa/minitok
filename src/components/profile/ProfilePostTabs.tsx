"use client";

import { motion } from "framer-motion";
import { Grid3X3, Heart, Play, Bookmark } from "lucide-react";

const visitorTabs = [
  { key: "posts", icon: Grid3X3 },
  { key: "clips", icon: Play },
];

const ownerTabs = [
  { key: "posts", icon: Grid3X3 },
  { key: "clips", icon: Play },
  { key: "bookmarks", icon: Bookmark },
  { key: "likes", icon: Heart },
];

export function ProfilePostTabs({
  active,
  onChange,
  isMe,
}: {
  active: string;
  onChange: (tab: string) => void;
  isMe: boolean;
}) {
  const tabs = isMe ? ownerTabs : visitorTabs;

  return (
    <div className='sticky top-[72px] z-30 bg-black border-b border-white/10'>
      <div className='relative flex justify-around'>
        {tabs.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className='relative py-3 flex-1 flex justify-center'>
            <Icon
              size={22}
              className={active === key ? "text-white" : "text-white/40"}
            />

            {active === key && (
              <motion.div
                layoutId='profile-tab-indicator'
                className='absolute bottom-0 h-0.5 w-8 bg-white rounded-full'
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
