import { useCallback, useEffect, useRef } from "react";
import MapView, { Camera } from "react-native-maps";
import { Dimensions } from "react-native";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { useLocation } from "./useLocation";
import { useDenmarkBeachesData } from "./useDenmarkBeachesData";
import { useSelectedRoute } from "./useSelectedRoute";
import { useSheetIndex } from "../state/useSheetIndex";
import { boundingBoxOfDenmark, denmarkCenter } from "../constants";
import { BEACH_BBOX_OFFSET, DENMARK_ZOOM } from "../constants/map";

type LatLng = { latitude: number; longitude: number };

const { height: screenHeight } = Dimensions.get("window");

function isInDenmark(lat: number, lng: number): boolean {
  return (
    lat >= boundingBoxOfDenmark.latitudeSouth &&
    lat <= boundingBoxOfDenmark.latitudeNorth &&
    lng >=
      Math.min(
        boundingBoxOfDenmark.longitudeWest,
        boundingBoxOfDenmark.longitudeEast,
      ) &&
    lng <=
      Math.max(
        boundingBoxOfDenmark.longitudeWest,
        boundingBoxOfDenmark.longitudeEast,
      )
  );
}

/** Calculate the center of a set of coordinates */
function getCenter(points: LatLng[]): LatLng {
  const latSum = points.reduce((s, c) => s + c.latitude, 0);
  const lngSum = points.reduce((s, c) => s + c.longitude, 0);
  return {
    latitude: latSum / points.length,
    longitude: lngSum / points.length,
  };
}

/**
 * Calculate the zoom level needed to fit a set of points,
 * accounting for padding. Returns Google Maps zoom level.
 */
function zoomToFitPoints(
  points: LatLng[],
  screenWidth: number,
  availableHeight: number,
): number {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);

  if (latSpan === 0 && lngSpan === 0) return 15; // single point

  const avgLat = (Math.max(...lats) + Math.min(...lats)) / 2;
  const latZoom =
    latSpan > 0 ? Math.log2((availableHeight * 360) / (latSpan * 256)) : 20;
  const lngZoom =
    lngSpan > 0
      ? Math.log2(
          (screenWidth * 360) /
            (lngSpan * 256 * Math.cos((avgLat * Math.PI) / 180)),
        )
      : 20;

  return Math.min(latZoom, lngZoom);
}

/**
 * Shift the center latitude down so the visual center
 * appears in the visible area above the sheet.
 */
function offsetForSheet(
  center: LatLng,
  camera: Camera,
  sheetFraction: number,
): LatLng {
  const sheetPixels = sheetFraction * screenHeight;

  let metersPerPixel: number;
  if (camera.zoom != null) {
    metersPerPixel =
      (156543.03392 * Math.cos((center.latitude * Math.PI) / 180)) /
      Math.pow(2, camera.zoom);
  } else if (camera.altitude != null) {
    metersPerPixel = camera.altitude / screenHeight;
  } else {
    return center;
  }

  const offsetMeters = (sheetPixels / 2) * metersPerPixel;
  const latOffset = offsetMeters / 111320;

  return {
    latitude: center.latitude - latOffset,
    longitude: center.longitude,
  };
}

export function useMapRecenter(
  mapRef: React.RefObject<MapView | null>,
  sheetDetents: number[],
) {
  const { beaches } = useDenmarkBeachesData();
  const { location } = useLocation();
  const { polylineCoordinates, destination: routeDestination } =
    useSelectedRoute();
  const prevBeachRef = useRef<number | undefined>(undefined);

  const getSheetFraction = useCallback(
    () => sheetDetents[useSheetIndex.getState().index] ?? 0,
    [sheetDetents],
  );

  /**
   * Single recenter logic. Can zoom in, never zooms out.
   *
   * 1. Collect relevant points (polyline, beach, user location)
   * 2. Calculate their center
   * 3. Calculate what zoom would fit them all
   * 4. Take the MAX of current zoom and target zoom (only zoom in)
   * 5. Offset center for sheet position
   * 6. animateCamera — one smooth animation, no callbacks, no timeouts
   */
  const recenter = useCallback(async () => {
    if (!mapRef.current) return;
    const camera = await mapRef.current?.getCamera();
    if (!camera) return;

    const id = useSelectedBeach.getState().selectedBeachId;
    const beach = beaches.find((b) => b.id === id);

    const userCoords = location?.coords;
    const userInDenmark = userCoords
      ? isInDenmark(userCoords.latitude, userCoords.longitude)
      : false;

    // Collect points
    let points: LatLng[] = [];

    const routeMatchesBeach =
      beach &&
      routeDestination &&
      Math.abs(routeDestination[0] - beach.longitude) < 0.001 &&
      Math.abs(routeDestination[1] - beach.latitude) < 0.001;

    if (
      routeMatchesBeach &&
      polylineCoordinates &&
      polylineCoordinates.length > 0
    ) {
      points = [
        ...polylineCoordinates,
        { latitude: beach.latitude, longitude: beach.longitude },
        ...(userCoords && userInDenmark
          ? [{ latitude: userCoords.latitude, longitude: userCoords.longitude }]
          : []),
      ];
    } else {
      if (beach) {
        points.push({ latitude: beach.latitude, longitude: beach.longitude });
      }
      if (userCoords && userInDenmark) {
        points.push({
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
        });
      }
    }

    // Nothing to show
    if (points.length === 0) {
      mapRef.current?.animateCamera({
        center: denmarkCenter,
        zoom: DENMARK_ZOOM,
        heading: 0,
        pitch: 0,
      });
      return;
    }

    // Single point: add bbox so we don't calculate infinite zoom
    const fitPoints =
      points.length === 1
        ? [
            {
              latitude: points[0].latitude - BEACH_BBOX_OFFSET,
              longitude: points[0].longitude - BEACH_BBOX_OFFSET,
            },
            {
              latitude: points[0].latitude + BEACH_BBOX_OFFSET,
              longitude: points[0].longitude + BEACH_BBOX_OFFSET,
            },
          ]
        : points;

    // Calculate target zoom that would fit all points
    const sheetFraction = getSheetFraction();
    const availableHeight = screenHeight * (1 - sheetFraction);
    const screenWidth = Dimensions.get("window").width;
    const targetZoom = zoomToFitPoints(fitPoints, screenWidth, availableHeight);

    // Current zoom (normalize to Google Maps zoom scale)
    const currentZoom =
      camera.zoom ??
      (camera.altitude != null
        ? Math.log2(
            (156543.03392 * Math.cos((points[0].latitude * Math.PI) / 180)) /
              (camera.altitude / screenHeight),
          )
        : 10);

    // Only zoom in, never out
    const finalZoom = Math.max(currentZoom, targetZoom);

    // Calculate center and offset for sheet
    const center = getCenter(points);
    const cameraForOffset: Camera = { ...camera, zoom: finalZoom };
    const offsetCenter = offsetForSheet(center, cameraForOffset, sheetFraction);

    // One animation, no callbacks
    mapRef.current?.animateCamera({
      center: offsetCenter,
      ...(camera.zoom != null ? { zoom: finalZoom } : {}),
      ...(camera.altitude != null
        ? {
            altitude:
              ((156543.03392 * Math.cos((center.latitude * Math.PI) / 180)) /
                Math.pow(2, finalZoom)) *
              screenHeight,
          }
        : {}),
    });
  }, [
    mapRef,
    beaches,
    location,
    polylineCoordinates,
    routeDestination,
    getSheetFraction,
  ]);

  // Recenter on mount
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

  // Recenter when a new polyline arrives
  const prevPolylineRef = useRef<typeof polylineCoordinates>(undefined);
  useEffect(() => {
    if (
      polylineCoordinates &&
      polylineCoordinates.length > 0 &&
      polylineCoordinates !== prevPolylineRef.current
    ) {
      prevPolylineRef.current = polylineCoordinates;
      recenter();
    }
  }, [polylineCoordinates]);

  // Recenter when the sheet detent changes (skip full screen)
  const prevSheetIndex = useRef(0);
  useEffect(() => {
    return useSheetIndex.subscribe(({ index }) => {
      if (index !== prevSheetIndex.current) {
        prevSheetIndex.current = index;
        // Don't recenter when sheet covers the full screen
        if (sheetDetents[index] < 1) {
          recenter();
        }
      }
    });
  }, [recenter, sheetDetents]);

  return { recenter };
}
