import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Polygon } from "react-native-maps";
import { useDebugRecenter } from "../state/useDebugRecenter";
import { usePreferences } from "../state/usePreferences";
import { useSheetIndex } from "../state/useSheetIndex";

/** Red bordered rectangle on the map showing the fit area */
export const DebugFitAreaPolygon: FC = () => {
  const debugMode = usePreferences((s) => s.debugMode);
  const fitPoints = useDebugRecenter((s) => s.fitPoints);

  if (!debugMode || fitPoints.length < 2) return null;

  const lats = fitPoints.map((p) => p.latitude);
  const lngs = fitPoints.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const corners = [
    { latitude: maxLat, longitude: minLng },
    { latitude: maxLat, longitude: maxLng },
    { latitude: minLat, longitude: maxLng },
    { latitude: minLat, longitude: minLng },
  ];

  return (
    <Polygon
      coordinates={corners}
      strokeColor="rgba(255, 0, 0, 0.8)"
      fillColor="rgba(255, 0, 0, 0.1)"
      strokeWidth={2}
    />
  );
};

/** HUD showing recenter debug info */
export const DebugInfoHUD: FC = () => {
  const debugMode = usePreferences((s) => s.debugMode);
  const sheetIndex = useSheetIndex((s) => s.index);
  const {
    availableHeight,
    screenHeight,
    sheetFraction,
    targetZoom,
    currentZoom,
    finalZoom,
    hasRoute,
    pointCount,
    center,
    offsetCenter,
  } = useDebugRecenter();

  if (!debugMode) return null;

  return (
    <View style={styles.hud}>
      <Text style={styles.title}>Recenter Debug</Text>
      <Text style={styles.line}>points: {pointCount} | route: {hasRoute ? "yes" : "no"}</Text>
      <Text style={styles.line}>sheet: idx={sheetIndex} frac={sheetFraction.toFixed(3)}</Text>
      <Text style={styles.line}>screen: {screenHeight.toFixed(0)}px | avail: {availableHeight.toFixed(0)}px</Text>
      <Text style={styles.line}>zoom: cur={currentZoom.toFixed(2)} tgt={targetZoom.toFixed(2)} fin={finalZoom.toFixed(2)}</Text>
      {center && (
        <Text style={styles.line}>center: {center.latitude.toFixed(5)}, {center.longitude.toFixed(5)}</Text>
      )}
      {offsetCenter && (
        <Text style={styles.line}>offset: {offsetCenter.latitude.toFixed(5)}, {offsetCenter.longitude.toFixed(5)}</Text>
      )}
      {center && offsetCenter && (
        <Text style={styles.line}>lat shift: {((center.latitude - offsetCenter.latitude) * 111320).toFixed(0)}m</Text>
      )}
    </View>
  );
};

/** Screen-space rectangle showing the viewport fitToCoordinates targets */
export const DebugViewportRect: FC = () => {
  const debugMode = usePreferences((s) => s.debugMode);
  const { edgePadding } = useDebugRecenter();

  if (!debugMode) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: edgePadding.top,
        left: edgePadding.left,
        right: edgePadding.right,
        bottom: edgePadding.bottom,
        borderWidth: 2,
        borderColor: "rgba(0, 120, 255, 0.8)",
        backgroundColor: "rgba(0, 120, 255, 0.05)",
        borderStyle: "dashed",
        pointerEvents: "none",
      }}
    />
  );
};

const styles = StyleSheet.create({
  hud: {
    position: "absolute",
    top: 50,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 8,
    padding: 8,
    gap: 2,
    zIndex: 100,
  },
  title: {
    color: "#ff4444",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  line: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "monospace",
  },
});
