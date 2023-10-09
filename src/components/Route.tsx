import { FC, memo } from "react";
import { Polyline as MapPolyline } from "react-native-maps";
import { usePalette } from "../theme/usePalette";
import { useSelectedRoute } from "../utils/useSelectedRoute";

export const Route: FC = memo(
  () => {
    const { foreground } = usePalette();
    const { polylineCoordinates } = useSelectedRoute();

    if (!polylineCoordinates) {
      return null;
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
