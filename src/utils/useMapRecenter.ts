import { useCallback, useEffect, useRef } from "react";
import MapView from "react-native-maps";
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
import { MAP_FIT_PADDING } from "../constants/map";
import { useSheetIndex } from "../state/useSheetIndex";
import { boundingBoxOfDenmark, denmarkCenter } from "../constants";
import { DENMARK_ZOOM, SHEET_HEADER_HEIGHT } from "../constants/map";

type LatLng = { latitude: number; longitude: number };

function isInDenmark(lat: number, lng: number): boolean {
  return (
    lat >= boundingBoxOfDenmark.latitudeSouth &&
    lat <= boundingBoxOfDenmark.latitudeNorth &&
    lng >= Math.min(boundingBoxOfDenmark.longitudeWest, boundingBoxOfDenmark.longitudeEast) &&
    lng <= Math.max(boundingBoxOfDenmark.longitudeWest, boundingBoxOfDenmark.longitudeEast)
  );
}

export function useMapRecenter(
  mapRef: React.RefObject<MapView | null>,
  sheetDetents: number[],
) {
  const { beaches } = useDenmarkBeachesData();
  const { location } = useLocation();
  const { polylineCoordinates, destination: routeDestination } = useSelectedRoute();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const prevBeachRef = useRef<number | undefined>(undefined);

  const getEdgePadding = useCallback(() => {
    const sheetFraction = sheetDetents[useSheetIndex.getState().index] ?? 0;
    const sheetPixels = sheetFraction * dimensions.height;
    return {
      top: MAP_FIT_PADDING + insets.top,
      right: MAP_FIT_PADDING + insets.right,
      bottom: sheetPixels + MAP_FIT_PADDING,
      left: MAP_FIT_PADDING + insets.left,
    };
  }, [sheetDetents, dimensions.height, insets]);

  /**
   * Single centering logic used everywhere:
   * 1. If route polyline exists → fit polyline bounds
   * 2. Else if beach selected + location in Denmark → fit both
   * 3. Else if beach selected → fit just the beach
   * 4. Else if location in Denmark → center on location
   * 5. Else → show all of Denmark
   */
  const recenter = useCallback(() => {
    const id = useSelectedBeach.getState().selectedBeachId;
    const beach = beaches.find((b) => b.id === id);

    const userCoords = location?.coords;
    const userInDenmark = userCoords
      ? isInDenmark(userCoords.latitude, userCoords.longitude)
      : false;

    const points: LatLng[] = [];

    // If route exists and matches the current beach, use the polyline bounds
    const routeMatchesBeach = beach && routeDestination &&
      Math.abs(routeDestination[0] - beach.longitude) < 0.001 &&
      Math.abs(routeDestination[1] - beach.latitude) < 0.001;

    if (routeMatchesBeach && polylineCoordinates && polylineCoordinates.length > 0) {
      mapRef.current?.fitToCoordinates(polylineCoordinates, {
        edgePadding: getEdgePadding(),
        animated: true,
      });
      return;
    }

    // Collect points to fit
    if (beach) {
      points.push({ latitude: beach.latitude, longitude: beach.longitude });
    }

    if (userCoords && userInDenmark) {
      points.push({ latitude: userCoords.latitude, longitude: userCoords.longitude });
    }

    if (points.length > 0) {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: getEdgePadding(),
        animated: true,
      });
    } else {
      // Nothing to show — zoom to Denmark overview
      mapRef.current?.animateCamera({
        center: denmarkCenter,
        zoom: DENMARK_ZOOM,
        heading: 0,
        pitch: 0,
      });
    }
  }, [mapRef, beaches, location, polylineCoordinates, getEdgePadding]);

  // Recenter on mount (handles persisted beach selection + initial location)
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current && beaches.length > 0) {
      hasMounted.current = true;
      const id = useSelectedBeach.getState().selectedBeachId;
      if (id) prevBeachRef.current = id;
      recenter();
    }
  }, [beaches, recenter]);

  // Recenter when a new beach is selected
  useEffect(() => {
    return useSelectedBeach.subscribe(({ selectedBeachId }) => {
      if (selectedBeachId && selectedBeachId !== prevBeachRef.current) {
        prevBeachRef.current = selectedBeachId;
        recenter();
      } else if (!selectedBeachId) {
        prevBeachRef.current = undefined;
      }
    });
  }, [recenter]);

  // Recenter when the sheet detent changes
  const prevSheetIndex = useRef(0);
  useEffect(() => {
    return useSheetIndex.subscribe(({ index }) => {
      if (index !== prevSheetIndex.current) {
        prevSheetIndex.current = index;
        recenter();
      }
    });
  }, [recenter]);

  return { recenter };
}
