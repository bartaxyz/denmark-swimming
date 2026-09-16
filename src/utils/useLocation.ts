import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { usePreferences } from "../state/usePreferences";

export const DEFAULT_DEBUG_LOCATION: Location.LocationObject = {
  coords: {
    latitude: 55.6761,
    longitude: 12.5683,
    altitude: 0,
    accuracy: 10,
    altitudeAccuracy: 10,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
};

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
      setLocation: (location) => set({ location }),
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

  return __DEV__ && debugMode
    ? (debugLocation ?? DEFAULT_DEBUG_LOCATION)
    : location;
};

const LOCATION_TIMEOUT_MS = 8000;

const describeLocationError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function getCurrentPositionWithFallback() {
  try {
    const currentLocation = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Timed out while getting current location")),
          LOCATION_TIMEOUT_MS,
        ),
      ),
    ]);

    return currentLocation;
  } catch (error) {
    console.warn(
      "Could not get current location, falling back to last known location:",
      describeLocationError(error),
    );

    return Location.getLastKnownPositionAsync({
      maxAge: 5 * 60 * 1000,
      requiredAccuracy: 2000,
    });
  }
}

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
    __DEV__ && debugMode
      ? (debugLocation ?? DEFAULT_DEBUG_LOCATION)
      : realLocation;

  const requestPermissions = async () => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        console.warn("Location services are disabled.");
        return false;
      }

      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      setStatus(locationStatus);

      if (locationStatus !== "granted") {
        return false;
      }

      const location = await getCurrentPositionWithFallback();
      if (!location) {
        console.warn("No current or recent last-known location is available.");
        return false;
      }

      setLocation(location);

      return location;
    } catch (error) {
      console.warn(
        "Error requesting location permissions or getting location:",
        describeLocationError(error),
      );
      return false;
    }
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

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        setLocation(location);
      },
      (error) => {
        console.warn("Location watch error:", error);
      },
    )
      .then((newSubscription) => {
        if (cancelled) {
          newSubscription.remove();
        } else {
          subscription = newSubscription;
        }
      })
      .catch((error) => {
        console.warn(
          "Could not start location watch:",
          describeLocationError(error),
        );
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [status]);

  return {
    location,
    status,
    retryRequestPermissions: requestPermissions,
  };
};
