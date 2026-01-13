import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  muted: false,
  toggleMute: () => set((s: any) => ({ muted: !s.muted })),
}));
