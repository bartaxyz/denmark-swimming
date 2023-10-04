import { useEffect, useRef } from "react";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { MapMarker } from "react-native-maps";

export const useStaticMarker = (beachIds: number | number[]) => {
  const mapMarker = useRef<MapMarker>(null);

  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);
  const isSelected = Array.isArray(beachIds)
    ? beachIds.some((beach) => beach === selectedBeachId)
    : beachIds === selectedBeachId;

  useEffect(() => {
    /**
     * This is a hack to force the marker to redraw when the selected beach changes.
     * It requires a timeout, otherwise it'd be stuck in previous state.
     */
    setTimeout(() => {
      mapMarker.current?.forceUpdate();
      mapMarker.current?.redraw();
    }, 9);
  }, [selectedBeachId]);

  return { mapMarker, isSelected };
};
