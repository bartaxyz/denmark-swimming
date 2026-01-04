import { FC, memo } from "react";
import { Polyline as MapPolyline } from "react-native-maps";
import { usePalette } from "../theme/usePalette";
import { useSelectedRoute } from "../utils/useSelectedRoute";

export const Route: FC = memo(
  () => {
    const { foreground } = usePalette();
    const { polylineCoordinates } = useSelectedRoute();

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
        coordinates={polylineCoordinates}
        strokeColor={foreground}
        lineCap="round"
        lineJoin="round"
        strokeWidth={2}
      />
    );
  },
  () => false
);
