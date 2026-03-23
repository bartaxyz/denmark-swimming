import { useCallback, useEffect, useRef } from "react";
import MapView, { Camera } from "react-native-maps";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { useLocation } from "./useLocation";
import { useDenmarkBeachesData } from "./useDenmarkBeachesData";
import { useSelectedRoute } from "./useSelectedRoute";
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
  BEACH_MIN_ZOOM,
  BEACH_MAX_ALTITUDE,
} from "../constants/map";
import { useSheetIndex } from "../state/useSheetIndex";

type LatLng = { latitude: number; longitude: number };

/** Check if camera is zoomed out too far for viewing a beach */
function isTooFarOut(camera: Camera): boolean {
  if (camera.zoom != null) return camera.zoom < BEACH_MIN_ZOOM;
  if (camera.altitude != null) return camera.altitude > BEACH_MAX_ALTITUDE;
  return false;
}

function didZoomOut(before: Camera, after: Camera): boolean {
  if (before.zoom != null) return (after.zoom ?? 0) < before.zoom;
  if (before.altitude != null) return (after.altitude ?? 0) > before.altitude;
  return false;
}

function preserveZoomProps(camera: Camera) {
  return {
    ...(camera.zoom != null ? { zoom: camera.zoom } : {}),
    ...(camera.altitude != null ? { altitude: camera.altitude } : {}),
  };
}

function getEdgePadding(
  insets: { top: number; right: number; bottom: number; left: number },
  sheetFraction: number,
  screenHeight: number,
) {
  const sheetPixels = sheetFraction * screenHeight;
  return {
    top: MAP_FIT_PADDING + insets.top,
    right: MAP_FIT_PADDING + insets.right,
    bottom: sheetPixels + MAP_FIT_PADDING,
    left: MAP_FIT_PADDING + insets.left,
  };
}

export function useMapRecenter(
  mapRef: React.RefObject<MapView | null>,
  sheetDetents: number[],
) {
  const { beaches } = useDenmarkBeachesData();
  const { location } = useLocation();
  const { polylineCoordinates } = useSelectedRoute();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const prevBeachRef = useRef<number | undefined>(undefined);

  const getSelectedBeach = useCallback((): LatLng | undefined => {
    const id = useSelectedBeach.getState().selectedBeachId;
    return beaches.find((b) => b.id === id);
  }, [beaches]);

  const getSheetFraction = useCallback(
    () => sheetDetents[useSheetIndex.getState().index] ?? 0,
    [sheetDetents],
  );

  /** Pan to the beach offset for the sheet, preserving zoom */
  const panToBeach = useCallback(
    async (beach: LatLng) => {
      const camera = await mapRef.current?.getCamera();
      if (!camera) return;

      const latOffset = getSheetLatitudeOffset(
        camera,
        getSheetFraction(),
        beach.latitude,
      );

      mapRef.current?.animateCamera({
        center: {
          latitude: beach.latitude - latOffset,
          longitude: beach.longitude,
        },
        ...preserveZoomProps(camera),
      });
    },
    [mapRef, getSheetFraction],
  );

  /** Fit coordinates in the visible area above the sheet */
  const fitCoordinates = useCallback(
    (coordinates: LatLng[]) => {
      const edgePadding = getEdgePadding(
        insets,
        getSheetFraction(),
        dimensions.height,
      );

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding,
        animated: true,
      });
    },
    [mapRef, insets, dimensions.height, getSheetFraction],
  );

  /** Zoom to fit beach (+ route or user location), never zooms out */
  const zoomToBeach = useCallback(
    async (beach: LatLng) => {
      const cameraBefore = await mapRef.current?.getCamera();

      if (polylineCoordinates && polylineCoordinates.length > 0) {
        // Route active — fit the entire polyline
        fitCoordinates(polylineCoordinates);
      } else {
        // No route — center on the beach, zoom in if too far out
        const camera = await mapRef.current?.getCamera();
        if (camera && isTooFarOut(camera)) {
          mapRef.current?.animateCamera({
            center: { latitude: beach.latitude, longitude: beach.longitude },
            ...(camera.zoom != null ? { zoom: BEACH_MIN_ZOOM } : {}),
            ...(camera.altitude != null ? { altitude: BEACH_MAX_ALTITUDE } : {}),
          });
        } else {
          panToBeach(beach);
        }
        return;
      }

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
    [mapRef, location, polylineCoordinates, fitCoordinates, panToBeach],
  );

  const recenterMap = useCallback(
    (preserveZoom = false) => {
      const beach = getSelectedBeach();
      if (!beach) return;
      preserveZoom ? panToBeach(beach) : zoomToBeach(beach);
    },
    [getSelectedBeach, panToBeach, zoomToBeach],
  );

  // Zoom-to-fit when a new beach is selected, collapse sheet when deselected
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

  // Recenter (preserve zoom) when the sheet detent changes
  const prevSheetIndex = useRef(0);
  useEffect(() => {
    return useSheetIndex.subscribe(({ index }) => {
      if (index !== prevSheetIndex.current) {
        prevSheetIndex.current = index;
        recenterMap(true);
      }
    });
  }, [recenterMap]);

  return { recenterMap };
}
