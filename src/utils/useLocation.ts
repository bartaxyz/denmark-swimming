import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useMapActions } from "../state/useMapActions";

interface LocationStoreState {
  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject) => void;
  status: Location.PermissionStatus | null;
  setStatus: (status: Location.PermissionStatus) => void;
  debugLocation: Location.LocationObject | null;
  setDebugLocation: (location: Location.LocationObject | null) => void;
}

export const useLocationStore = create<LocationStoreState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => {
        set({ location });
        useMapActions.getState().recenter();
      },
      status: null,
      setStatus: (status) => set({ status }),
      debugLocation: null,
      setDebugLocation: (debugLocation) => set({ debugLocation }),
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useLocation = (options: { autoRequest?: boolean } = {}) => {
  const { location: realLocation, status, setLocation, setStatus, debugLocation } = useLocationStore();
  const location = (__DEV__ && debugLocation) ? debugLocation : realLocation;

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
  
  /* Request permissions on mount */
  useEffect(() => {
    if (!options.autoRequest) {
      return;
    }

    (async () => {
      await requestPermissions();
    })();
  }, []);

  /* Watch location position */
  useEffect(() => {
    if (status !== "granted") {
      return;
    }

    let subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        setLocation(location);
      }
    );

    return () => {
      subscription.then((s) => s.remove());
    };
  }, [status]);

  return {
    location,
    status,
    retryRequestPermissions: requestPermissions,
  };
};
