import { useEffect, useRef } from "react";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { MapMarker } from "react-native-maps";
import { usePreferences } from "../state/usePreferences";
import { InteractionManager } from "react-native";

export const useStaticMarker = (beachIds: number | number[]) => {
  const mapMarker = useRef<MapMarker>(null);
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

      // Only call redraw, which is the safest method
      // Avoid forceUpdate and render which can cause race conditions
      mapMarker.current?.redraw();
    } catch (error) {
      // Silently ignore - marker may have been unmounted
    }
  };

  useEffect(() => {
    // Clear any pending timeouts from previous renders
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    /**
     * Wait for interactions to complete before forcing a redraw.
     * This prevents race conditions with React Native's view reconciliation.
     */
    InteractionManager.runAfterInteractions(() => {
      // Use a single delayed redraw instead of multiple rapid calls
      const timeout = setTimeout(forceUpdate, 100);
      timeoutRefs.current.push(timeout);
    });

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [selectedBeachId]);

  return { mapMarker, isSelected };
};
