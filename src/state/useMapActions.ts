import { create } from "zustand";

interface MapActionsState {
  recenter: () => void;
  setRecenter: (fn: () => void) => void;
  userMovedSinceRecenter: boolean;
  markUserMoved: () => void;
  markRecentered: () => void;
}

export const useMapActions = create<MapActionsState>((set) => ({
  recenter: () => {},
  setRecenter: (fn) => set({ recenter: fn }),
  userMovedSinceRecenter: false,
  markUserMoved: () => set({ userMovedSinceRecenter: true }),
  markRecentered: () => set({ userMovedSinceRecenter: false }),
}));
