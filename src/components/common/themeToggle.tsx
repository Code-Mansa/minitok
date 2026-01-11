"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className='size-9 rounded-md border border-transparent' />;
  }

  const isDark = theme === "dark";

  return (
    <Toggle
      variant='outline'
      className='group size-9 data-[state=on]:bg-transparent data-[state=on]:hover:bg-muted'
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <MoonIcon
        size={16}
        className='shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100'
      />

      <SunIcon
        size={16}
        className='absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0'
      />
    </Toggle>
  );
}
