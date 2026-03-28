import { FC, memo, useState } from "react";
import { Polyline as MapPolyline } from "react-native-maps";
import { useFocusEffect } from "expo-router";
import { usePalette } from "../theme/usePalette";
import { useSelectedRoute } from "../utils/useSelectedRoute";

export const Route: FC = memo(
  () => {
    const { foreground } = usePalette();
    const { polylineCoordinates } = useSelectedRoute();
    // Force Polyline to remount after navigation (Android drops native overlays)
    const [renderKey, setRenderKey] = useState(0);
    useFocusEffect(() => {
      setRenderKey((k) => k + 1);
    });

    // Don't return null - return an empty polyline instead to avoid
    // react-native-maps Google provider crash on iOS when inserting nil subviews
    if (!polylineCoordinates || polylineCoordinates.length === 0) {
      return (
        <MapPolyline
          coordinates={[]}
          strokeColor="transparent"
          strokeWidth={0}
        />
      );
    }

    return (
      <MapPolyline
        key={renderKey}
        coordinates={polylineCoordinates}
        strokeColor={foreground}
        lineCap="round"
        lineJoin="round"
        strokeWidth={2}
      />
    );
  },
);
