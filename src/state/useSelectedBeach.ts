import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useMapActions } from "./useMapActions";

interface SelectedBeachState {
  selectedBeachId?: number;
  setSelectedBeachId: (beach?: number) => void;
}

export const useSelectedBeach = create<SelectedBeachState>()(
  persist(
    (set, get) => ({
      selectedBeachId: undefined,
      setSelectedBeachId: (beach) => {
        const prev = get().selectedBeachId;
        set({ selectedBeachId: beach });
        if (beach && beach !== prev) {
          useMapActions.getState().recenter();
        }
      },
    }),
    {
      name: "selected-beach",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
