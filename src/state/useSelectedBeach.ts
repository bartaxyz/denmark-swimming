import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SelectedBeachState {
  selectedBeachId?: number;
  setSelectedBeachId: (beach?: number) => void;
}

export const useSelectedBeach = create<SelectedBeachState>()(
  persist(
    (set) => ({
      selectedBeachId: undefined,
      setSelectedBeachId: (beach) => set({ selectedBeachId: beach }),
    }),
    {
      name: "selected-beach",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
