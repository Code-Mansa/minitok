"use client";

import { Volume2, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/lib/store";

export function MuteToggle() {
  const { muted, toggleMute } = usePlayerStore();

  return (
    <button
      onClick={toggleMute}
      className='fixed top-6 right-3 z-50 bg-black/60 p-2 rounded-full'>
      {muted ? (
        <VolumeX className='text-white' />
      ) : (
        <Volume2 className='text-white' />
      )}
    </button>
  );
}
