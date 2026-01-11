// src/hooks/useInactivityLogout.ts
import { useEffect, useRef } from "react";
import { authAPI } from "@/services/endpoints";

const DEFAULT_INACTIVITY_MINUTES = 30;

const events = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
];

export function useInactivityLogout(enabled: boolean = true) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getInactivityTimeout = () => {
    const minutes =
      Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MINUTES) ||
      DEFAULT_INACTIVITY_MINUTES;
    return minutes * 60 * 1000;
  };

  const logout = async () => {
    // Don't run if already on login
    if (window.location.pathname.includes("/login")) return;

    try {
      await authAPI.logout();
    } catch {
      // ignore
    } finally {
      window.location.href = "/login?reason=inactivity";
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!enabled || window.location.pathname.includes("/login")) return;

    timeoutRef.current = setTimeout(logout, getInactivityTimeout());
  };

  useEffect(() => {
    if (!enabled || window.location.pathname.includes("/login")) return;

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled]);
}
