import { rgba } from "polished";
import { FC, useMemo } from "react";
import { Pressable, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated from "react-native-reanimated";
import { WaterQuality } from "../../types";
import { usePalette } from "../theme/usePalette";
import {
  HIGHLIGHT_OPACITY_SELECTED,
  HIGHLIGHT_OPACITY_UNSELECTED,
  useAnimatedMarker,
} from "../utils/useAnimatedMarker";
import { useStaticMarker } from "../utils/useStaticMarker";
import { BeachClusterDatum } from "./BeachClusterDatum";

export interface BeachClusterProps {
  id?: string | number;
  pointsCount: number;
  coordinates: GeoJSON.Position;
  waterQualityCounts: Record<WaterQuality, number>;
  beachIds: number[];
  onPress: () => void;
}

export const BeachCluster: FC<BeachClusterProps> = ({
  id,
  pointsCount,
  coordinates,
  beachIds,
  waterQualityCounts,
  onPress,
}) => {
  const [longitude, latitude] = coordinates;

  const { background, foreground } = usePalette();

  const waterQualityKeys = useMemo(
    () => Object.keys(waterQualityCounts) as WaterQuality[],
    [waterQualityCounts]
  );

  const { mapMarker, isSelected } = useStaticMarker(beachIds);
  const { highlightOpacityStyle } = useAnimatedMarker(beachIds);

  return (
    <Marker
      ref={mapMarker}
      identifier={`${id}`}
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <Pressable style={{ padding: 4, paddingHorizontal: 8 }}>
        <View
          style={{
            position: "relative",
            borderColor: rgba(foreground, 0.1),
            borderWidth: 1,
            borderRadius: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: background,
              // scale padding with the number of beaches in the cluster
              padding: 2 + Math.log(pointsCount) * 2,
              paddingHorizontal: 8 + Math.log(pointsCount) * 2,
              borderRadius: 16,
            }}
          >
            {waterQualityKeys.map((key, index) => {
              const waterQualityCount = waterQualityCounts[key as WaterQuality];

              if (waterQualityCount === 0) {
                return null;
              }

              return (
                <BeachClusterDatum
                  key={key}
                  waterQuality={key as WaterQuality}
                  count={waterQualityCount}
                />
              );
            })}
          </View>

          {/* Highlight ring */}
          <Animated.View
            style={[
              {
                position: "absolute",
                zIndex: 64,
                borderRadius: 100,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderWidth: 1,
                borderColor: foreground,
                opacity: isSelected
                  ? HIGHLIGHT_OPACITY_SELECTED
                  : HIGHLIGHT_OPACITY_UNSELECTED,
              },
              highlightOpacityStyle,
            ]}
          />
        </View>
      </Pressable>
    </Marker>
  );
};
