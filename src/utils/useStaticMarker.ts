import { useEffect, useRef } from "react";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { Marker } from "react-native-maps";
import { usePreferences } from "../state/usePreferences";

export const useStaticMarker = (beachIds: number | number[]) => {
  const mapMarker = useRef<InstanceType<typeof Marker>>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);
  const isSelected = Array.isArray(beachIds)
    ? beachIds.some((beach) => beach === selectedBeachId)
    : beachIds === selectedBeachId;

  const forceUpdate = () => {
    try {
      if (usePreferences.getState().mapsProvider !== "google") {
        return;
      }

      mapMarker.current?.redraw();
    } catch (error) {
      // Silently ignore - marker may have been unmounted
    }
  };

  useEffect(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Use requestIdleCallback to defer redraw until the browser is idle,
    // then add a small delay to avoid race conditions with view reconciliation
    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(() => {
        const timeout = setTimeout(forceUpdate, 100);
        timeoutRefs.current.push(timeout);
      });
      return () => {
        cancelIdleCallback(idleId);
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
      };
    } else {
      // Fallback for environments without requestIdleCallback
      const timeout = setTimeout(forceUpdate, 150);
      timeoutRefs.current.push(timeout);
      return () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
      };
    }
  }, [selectedBeachId]);

  return { mapMarker, isSelected };
};
