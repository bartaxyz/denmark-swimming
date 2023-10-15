import { useEffect, useRef } from "react";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { MapMarker } from "react-native-maps";
import { usePreferences } from "../state/usePreferences";

export const useStaticMarker = (beachIds: number | number[]) => {
  const mapMarker = useRef<MapMarker>(null);

  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);
  const isSelected = Array.isArray(beachIds)
    ? beachIds.some((beach) => beach === selectedBeachId)
    : beachIds === selectedBeachId;

  const forceUpdate = () => {
    try {
      if (usePreferences.getState().mapsProvider !== "google") {
        return;
      }

      mapMarker.current?.forceUpdate();
      mapMarker.current?.redraw();
      mapMarker.current?.render();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    /**
     * This is a hack to force the marker to redraw when the selected beach changes.
     * It requires a timeout, otherwise it'd be stuck in previous state.
     *
     * It's running multiple times as the first one might not necessarily catch the change.
     */
    setTimeout(forceUpdate, 9);
    setTimeout(forceUpdate, 64);
    setTimeout(forceUpdate, 256);
  }, [selectedBeachId]);

  return { mapMarker, isSelected };
};
