import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationStoreState {
  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject) => void;
  status: Location.PermissionStatus | null;
  setStatus: (status: Location.PermissionStatus) => void;
}

const useLocationStore = create<LocationStoreState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      status: null,
      setStatus: (status) => set({ status }),
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useLocation = (options: { autoRequest?: boolean } = {}) => {
  const { location, status, setLocation, setStatus } = useLocationStore();

  const requestPermissions = async () => {
    let { status: locationStatus } =
      await Location.requestForegroundPermissionsAsync();

    setStatus(locationStatus);

    if (locationStatus !== "granted") {
      return false;
    }

    let location = await Location.getCurrentPositionAsync({});

    setLocation(location);

    return location;
  };

  useEffect(() => {
    if (!options.autoRequest) {
      return;
    }

    (async () => {
      await requestPermissions();
    })();
  }, []);

  return {
    location,
    status,
    retryRequestPermissions: requestPermissions,
  };
};
