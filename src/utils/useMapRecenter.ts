import { useCallback, useEffect, useRef } from "react";
import MapView, { Camera } from "react-native-maps";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { useLocation } from "./useLocation";
import { useDenmarkBeachesData } from "./useDenmarkBeachesData";
import {
  ThresholdType,
  getPassedDistanceThreshold,
} from "./getPassedDistanceThreshold";
import { getSheetLatitudeOffset } from "./getSheetLatitudeOffset";
import {
  MAP_FIT_PADDING,
  BEACH_BBOX_OFFSET,
  ZOOM_CHECK_DELAY,
  SHEET_HEADER_HEIGHT,
} from "../constants/map";

type LatLng = { latitude: number; longitude: number };

/** Check if the camera zoomed out compared to a previous snapshot */
function didZoomOut(before: Camera, after: Camera): boolean {
  if (before.zoom != null) return (after.zoom ?? 0) < before.zoom;
  if (before.altitude != null) return (after.altitude ?? 0) > before.altitude;
  return false;
}

/** Preserve the zoom/altitude from a camera snapshot */
function preserveZoomProps(camera: Camera) {
  return {
    ...(camera.zoom != null ? { zoom: camera.zoom } : {}),
    ...(camera.altitude != null ? { altitude: camera.altitude } : {}),
  };
}

export function useMapRecenter(
  mapRef: React.RefObject<MapView | null>,
  sheetDetents: number[],
  sheetIndexRef: React.RefObject<number>,
) {
  const { beaches } = useDenmarkBeachesData();
  const { location } = useLocation();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const prevBeachRef = useRef<number | undefined>(undefined);

  const getSelectedBeach = useCallback((): LatLng | undefined => {
    const id = useSelectedBeach.getState().selectedBeachId;
    return beaches.find((b) => b.id === id);
  }, [beaches]);

  /** Pan to the beach, offset for the sheet, preserving current zoom */
  const panToBeach = useCallback(
    async (beach: LatLng) => {
      const camera = await mapRef.current?.getCamera();
      if (!camera) return;

      const sheetFraction = sheetDetents[sheetIndexRef.current] ?? 0;
      const latOffset = getSheetLatitudeOffset(camera, sheetFraction, beach.latitude);

      mapRef.current?.animateCamera({
        center: {
          latitude: beach.latitude - latOffset,
          longitude: beach.longitude,
        },
        ...preserveZoomProps(camera),
      });
    },
    [mapRef, sheetDetents, sheetIndexRef],
  );

  /** Zoom to fit beach + user location, never zooms out */
  const zoomToBeach = useCallback(
    async (beach: LatLng) => {
      const cameraBefore = await mapRef.current?.getCamera();

      const userNearby =
        location &&
        !getPassedDistanceThreshold(
          ThresholdType.Zoom,
          [location.coords.longitude, location.coords.latitude],
          [beach.longitude, beach.latitude],
        );

      const coordinates: LatLng[] = [
        beach,
        ...(userNearby
          ? [{ latitude: location!.coords.latitude, longitude: location!.coords.longitude }]
          : [
              { latitude: beach.latitude - BEACH_BBOX_OFFSET, longitude: beach.longitude - BEACH_BBOX_OFFSET },
              { latitude: beach.latitude + BEACH_BBOX_OFFSET, longitude: beach.longitude + BEACH_BBOX_OFFSET },
            ]),
      ];

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: MAP_FIT_PADDING + insets.top,
          right: MAP_FIT_PADDING + insets.right,
          bottom: SHEET_HEADER_HEIGHT + insets.bottom + MAP_FIT_PADDING,
          left: MAP_FIT_PADDING + insets.left,
        },
        animated: true,
      });

      // Revert if it zoomed out
      if (cameraBefore) {
        setTimeout(async () => {
          const cameraAfter = await mapRef.current?.getCamera();
          if (cameraAfter && didZoomOut(cameraBefore, cameraAfter)) {
            panToBeach(beach);
          }
        }, ZOOM_CHECK_DELAY);
      }
    },
    [mapRef, location, insets, panToBeach],
  );

  const recenterMap = useCallback(
    (preserveZoom = false) => {
      const beach = getSelectedBeach();
      if (!beach) return;
      preserveZoom ? panToBeach(beach) : zoomToBeach(beach);
    },
    [getSelectedBeach, panToBeach, zoomToBeach],
  );

  // Zoom-to-fit when a new beach is selected
  useEffect(() => {
    return useSelectedBeach.subscribe(({ selectedBeachId }) => {
      if (selectedBeachId && selectedBeachId !== prevBeachRef.current) {
        prevBeachRef.current = selectedBeachId;
        recenterMap(false);
      } else if (!selectedBeachId) {
        prevBeachRef.current = undefined;
      }
    });
  }, [recenterMap]);

  return { recenterMap };
}
