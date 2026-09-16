import { create } from "zustand";

interface SheetIndexState {
  index: number;
  position?: number;
  setIndex: (index: number) => void;
  setPosition: (position: number) => void;
}

export const useSheetIndex = create<SheetIndexState>((set) => ({
  index: 0,
  position: undefined,
  setIndex: (index) => set({ index }),
  setPosition: (position) => set({ position }),
}));
