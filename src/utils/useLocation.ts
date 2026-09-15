import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useMapActions } from "../state/useMapActions";
import { usePreferences } from "../state/usePreferences";

interface LocationStoreState {
  location: Location.LocationObject | null;
  /** Updates location. On the first GPS fix of the session, also recenters the map. */
  setLocation: (location: Location.LocationObject) => void;
  status: Location.PermissionStatus | null;
  setStatus: (status: Location.PermissionStatus) => void;
  debugLocation: Location.LocationObject | null;
  setDebugLocation: (location: Location.LocationObject | null) => void;
  _hasReceivedInitialLocation: boolean;
}

export const useLocationStore = create<LocationStoreState>()(
  persist(
    (set, get) => ({
      location: null,
      _hasReceivedInitialLocation: false,
      setLocation: (location) => {
        const isFirst = !get()._hasReceivedInitialLocation;
        set({ location, _hasReceivedInitialLocation: true });
        if (isFirst) {
          useMapActions.getState().recenter();
        }
      },
      status: null,
      setStatus: (status) => set({ status }),
      debugLocation: null,
      setDebugLocation: (debugLocation) => set({ debugLocation }),
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        status: state.status,
        debugLocation: state.debugLocation,
      }),
    }
  )
);

export const getCurrentLocation = () => {
  const { location, debugLocation } = useLocationStore.getState();
  const debugMode = usePreferences.getState().debugMode;

  return __DEV__ && debugMode && debugLocation ? debugLocation : location;
};

export const useLocation = (options: { autoRequest?: boolean } = {}) => {
  const {
    location: realLocation,
    status,
    setLocation,
    setStatus,
    debugLocation,
  } = useLocationStore();
  const debugMode = usePreferences((s) => s.debugMode);
  const location =
    __DEV__ && debugMode && debugLocation ? debugLocation : realLocation;

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
