import { create } from "zustand";

interface SheetIndexState {
  index: number;
  setIndex: (index: number) => void;
}

export const useSheetIndex = create<SheetIndexState>((set) => ({
  index: 0,
  setIndex: (index) => set({ index }),
}));
