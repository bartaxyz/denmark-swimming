import { Dimensions } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { useBeachDataStore } from "../state/useBeachDataStore";
import { useLocationStore } from "./useLocation";
import { useMapActions } from "../state/useMapActions";
import { useMapRef } from "../state/useMapRef";
import { useRouteData } from "../state/useRouteData";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { useSheetIndex } from "../state/useSheetIndex";
import { HEADER_HEIGHT } from "../components/BeachDetailHeader";
import { ICON_BUTTON_SIZES } from "../components/IconButton";
import { TOP_INDICATOR_MARGIN_TOP, TOP_INDICATOR_MIN_HEIGHT } from "../components/TopIndicator";
import { useDebugRecenter } from "../state/useDebugRecenter";
import { usePreferences } from "../state/usePreferences";
import { boundingBoxOfDenmark, denmarkCenter } from "../constants";
import { BEACH_BBOX_OFFSET, DENMARK_ZOOM } from "../constants/map";

type LatLng = { latitude: number; longitude: number };

function getSheetDetents(): [number, number, number] {
  const { height } = Dimensions.get("window");
  return [HEADER_HEIGHT / height, 0.6, 1];
}

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

export const EDGE_PADDING = 40;

export async function recenter() {
  const mapView = useMapRef.getState().mapView;
  if (!mapView) return;

  const beaches = useBeachDataStore.getState().beaches;
  const id = useSelectedBeach.getState().selectedBeachId;
  const beach = beaches.find((b) => b.id === id);

  const locationState = useLocationStore.getState();
  const location =
    __DEV__ && locationState.debugLocation
      ? locationState.debugLocation
      : locationState.location;
  const userCoords = location?.coords;
  const userInDenmark = userCoords
    ? isInDenmark(userCoords.latitude, userCoords.longitude)
    : false;

  const { polylineCoordinates, destination: routeDestination } =
    useRouteData.getState();

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
    mapView.animateCamera({
      center: denmarkCenter,
      zoom: DENMARK_ZOOM,
      heading: 0,
      pitch: 0,
    });
    return;
  }

  // Single point: add bbox so fitToCoordinates has a region to work with
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

  // Calculate bottom padding: sheet height + extra breathing room
  const screenHeight = Dimensions.get("window").height;
  const sheetDetents = getSheetDetents();
  const sheetIndex = useSheetIndex.getState().index;
  const sheetFraction = sheetDetents[sheetIndex] ?? 0;
  const sheetPixels = sheetFraction * screenHeight;

  const insets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0 };

  // Buttons are only visible when sheet is at first detent (collapsed)
  const buttonsVisible = sheetIndex === 0;
  const bottomObstruction = buttonsVisible
    ? sheetPixels + ICON_BUTTON_SIZES.L
    : sheetPixels;

  const edgePadding = {
    top: insets.top + TOP_INDICATOR_MARGIN_TOP + TOP_INDICATOR_MIN_HEIGHT + EDGE_PADDING,
    right: EDGE_PADDING,
    bottom: insets.bottom + bottomObstruction + EDGE_PADDING,
    left: EDGE_PADDING,
  };

  // Store debug info
  if (usePreferences.getState().debugMode) {
    const center = {
      latitude:
        fitPoints.reduce((s, p) => s + p.latitude, 0) / fitPoints.length,
      longitude:
        fitPoints.reduce((s, p) => s + p.longitude, 0) / fitPoints.length,
    };
    useDebugRecenter.getState().setDebugInfo({
      fitPoints: [...fitPoints],
      center,
      offsetCenter: center,
      availableHeight: screenHeight - sheetPixels - EDGE_PADDING * 2,
      screenHeight,
      sheetFraction,
      targetZoom: 0,
      currentZoom: 0,
      finalZoom: 0,
      hasRoute: !!routeMatchesBeach && !!polylineCoordinates && polylineCoordinates.length > 0,
      pointCount: points.length,
      edgePadding,
    });
  }

  // Let the map engine calculate the correct zoom natively
  mapView.fitToCoordinates(fitPoints, {
    edgePadding,
    animated: true,
  });
}

// Register so stores can call recenter without importing this module directly
useMapActions.getState().setRecenter(recenter);
