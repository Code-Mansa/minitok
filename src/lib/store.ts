import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  muted: true,
  toggleMute: () => set((s: any) => ({ muted: !s.muted })),
}));
