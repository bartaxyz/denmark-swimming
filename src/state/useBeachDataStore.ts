import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Beaches } from "../../types";

const CACHE_DURATION_MS = 1000 * 60 * 60 * 6; // 6 hours

interface BeachDataState {
  beaches: Beaches;
  lastFetchTimestamp: number | null;
  setBeaches: (beaches: Beaches) => void;
  isCacheValid: () => boolean;
  clearCache: () => void;
}

export const useBeachDataStore = create<BeachDataState>()(
  persist(
    (set, get) => ({
      beaches: [],
      lastFetchTimestamp: null,
      setBeaches: (beaches) =>
        set({
          beaches,
          lastFetchTimestamp: Date.now(),
        }),
      isCacheValid: () => {
        const { lastFetchTimestamp, beaches } = get();
        if (!lastFetchTimestamp || beaches.length === 0) return false;
        return Date.now() - lastFetchTimestamp < CACHE_DURATION_MS;
      },
      clearCache: () =>
        set({
          beaches: [],
          lastFetchTimestamp: null,
        }),
    }),
    {
      name: "beach-data-cache",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
