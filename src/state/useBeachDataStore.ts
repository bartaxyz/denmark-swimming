import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Beaches } from "../../types";
import { CACHE_DURATION_MS } from "../constants/api";

type FetchStatus = "idle" | "fetching" | "needs_captcha" | "success";

interface BeachDataState {
  beaches: Beaches;
  lastFetchTimestamp: number | null;
  status: FetchStatus;
  _hasHydrated: boolean;
  setBeaches: (beaches: Beaches) => void;
  setStatus: (status: FetchStatus) => void;
  isCacheValid: () => boolean;
  clearCache: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useBeachDataStore = create<BeachDataState>()(
  persist(
    (set, get) => ({
      beaches: [],
      lastFetchTimestamp: null,
      status: "idle" as FetchStatus,
      _hasHydrated: false,
      setBeaches: (beaches) =>
        set({
          beaches,
          lastFetchTimestamp: Date.now(),
          status: "success",
        }),
      setStatus: (status) => set({ status }),
      isCacheValid: () => {
        const { lastFetchTimestamp, beaches } = get();
        if (!lastFetchTimestamp || beaches.length === 0) return false;
        return Date.now() - lastFetchTimestamp < CACHE_DURATION_MS;
      },
      clearCache: () =>
        set({
          beaches: [],
          lastFetchTimestamp: null,
          status: "idle",
        }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "beach-data-cache",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        beaches: state.beaches,
        lastFetchTimestamp: state.lastFetchTimestamp,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
