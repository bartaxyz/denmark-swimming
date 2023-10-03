import { rgba } from "polished";
import { FC } from "react";
import { Pressable, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import Supercluster from "supercluster";
import { usePalette } from "../theme/usePalette";
import { WaterQualityIndicator } from "./WaterQualityIndicator";
import { Beaches, WaterQuality } from "../../types";
import Animated from "react-native-reanimated";
import { useAnimatedMarker } from "../utils/useAnimatedMarker";

export interface BeachClusterProps {
  cluster:
    | Supercluster.ClusterFeature<Supercluster.AnyProps>
    | Supercluster.PointFeature<Supercluster.AnyProps>;
  onPress: () => void;
  leaves: Supercluster.PointFeature<Supercluster.AnyProps>[];
}

export const BeachCluster: FC<BeachClusterProps> = ({
  cluster,
  onPress,
  leaves,
}) => {
  const { background, foreground } = usePalette();

  const beaches = leaves.map((leave) => leave.properties.beach) as Beaches;

  const waterQualityCounts = beaches.reduce(
    (acc, beach) => {
      acc[beach.data[0].water_quality] += 1;
      return acc;
    },
    {
      [WaterQuality.Bad]: 0,
      [WaterQuality.Closed]: 0,
      [WaterQuality.Good]: 0,
      [WaterQuality.Unknown]: 0,
    }
  );

  const { highlightOpacity, highlightOpacityStyle } =
    useAnimatedMarker(beaches);

  return (
    <Marker
      identifier={`${cluster.id}`}
      coordinate={{
        latitude: cluster.geometry.coordinates[1],
        longitude: cluster.geometry.coordinates[0],
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      // tracksViewChanges={false}
    >
      <Pressable style={{ padding: 4, paddingHorizontal: 8 }}>
        <Animated.View
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
              padding: 2 + Math.log(cluster.properties.point_count) * 2,
              paddingHorizontal:
                8 + Math.log(cluster.properties.point_count) * 2,
              borderRadius: 16,
            }}
          >
            {Object.keys(waterQualityCounts).map((key, index) => {
              const waterQualityCount = waterQualityCounts[key as WaterQuality];

              if (waterQualityCount === 0) {
                return null;
              }

              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <WaterQualityIndicator
                    key={key}
                    waterQuality={key as WaterQuality}
                  />

                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: foreground,
                    }}
                  >
                    {waterQualityCount}
                  </Text>
                </View>
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
                opacity: 0,
              },
              highlightOpacityStyle,
            ]}
          />
        </Animated.View>
      </Pressable>
    </Marker>
  );
};
