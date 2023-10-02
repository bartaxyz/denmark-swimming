import AsyncStorage from "@react-native-async-storage/async-storage";
import { PROVIDER_GOOGLE, Provider } from "react-native-maps";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  mapsProvider: Provider;
  setMapsProvider: (provider: Provider) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      mapsProvider: PROVIDER_GOOGLE,
      setMapsProvider: (provider) => set({ mapsProvider: provider }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
