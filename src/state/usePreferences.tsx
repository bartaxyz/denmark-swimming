import AsyncStorage from "@react-native-async-storage/async-storage";
import { PROVIDER_GOOGLE, Provider } from "react-native-maps";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TransportationMode =
  | "driving"
  | "walking"
  | "bicycling"
  | "transit";

export const TRANSPORTATION_MODES: Record<TransportationMode, string> = {
  driving: "Driving",
  walking: "Walking",
  bicycling: "Bicycling",
  transit: "Public transport",
};

interface PreferencesState {
  mapsProvider: Provider;
  setMapsProvider: (provider: Provider) => void;
  disableCustomMapStyles: boolean;
  setDisableCustomMapStyles: (disableCustomMapStyles: boolean) => void;
  performanceMode: boolean;
  setPerformanceMode: (performanceMode: boolean) => void;
  transportationMode: TransportationMode;
  setTransportationMode: (transportationMode: TransportationMode) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      mapsProvider: PROVIDER_GOOGLE,
      setMapsProvider: (provider) => set({ mapsProvider: provider }),
      disableCustomMapStyles: false,
      setDisableCustomMapStyles: (disableCustomMapStyles) =>
        set({ disableCustomMapStyles: disableCustomMapStyles }),
      performanceMode: false,
      setPerformanceMode: (performanceMode) =>
        set({ performanceMode: performanceMode }),
      transportationMode: "bicycling",
      setTransportationMode: (transportationMode) =>
        set({ transportationMode: transportationMode }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
