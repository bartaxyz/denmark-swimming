import { create } from "zustand";

export interface SelectedDayState {
  selectedDay?: string;
  setSelectedDay: (day?: string) => void;
}

export const useSelectedDay = create<SelectedDayState>((set) => ({
  selectedDay: undefined,
  setSelectedDay: (day) => set({ selectedDay: day }),
}));
