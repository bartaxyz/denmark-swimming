import { create } from "zustand";

interface MapActionsState {
  recenter: () => void;
  setRecenter: (fn: () => void) => void;
}

export const useMapActions = create<MapActionsState>((set) => ({
  recenter: () => {},
  setRecenter: (fn) => set({ recenter: fn }),
}));
