import { rgba } from "polished";
import { FC, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { useSelectedBeach } from "../../src/state/useSelectedBeach";
import { Beach } from "../../types";
import { usePalette } from "../theme/usePalette";
import { WaterQualityIndicator } from "./WaterQualityIndicator";

export interface BeachMarkerProps {
  beach: Beach;
}

export const BeachMarker: FC<BeachMarkerProps> = ({ beach }) => {
  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId
  );

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const { background, foreground, isDark } = usePalette();

  useEffect(() => {
    useSelectedBeach.subscribe(({ selectedBeachId }) => {
      if (selectedBeachId === beach.id) {
        opacity.value = withTiming(1, { duration: 100 });
        scale.value = withTiming(1.3, { duration: 100 });
      } else if (selectedBeachId && selectedBeachId !== beach.id) {
        opacity.value = withTiming(0.5, { duration: 100 });
        scale.value = withTiming(1, { duration: 100 });
      } else {
        opacity.value = withTiming(1, { duration: 100 });
        scale.value = withTiming(1, { duration: 100 });
      }
    });
  });

  const today = beach.data[0];

  return (
    <Marker
      identifier={`${beach.id}`}
      coordinate={{
        latitude: beach.latitude,
        longitude: beach.longitude,
      }}
      onPress={() => setSelectedBeachId(beach.id)}
      anchor={{ x: 0.5, y: 0.5 }}
      // tracksViewChanges={false}
    >
      <Pressable style={{ padding: 4, paddingHorizontal: 8 }}>
        <Animated.View
          style={{
            borderColor: rgba(foreground, 0.1),
            borderWidth: 1,
            borderRadius: 16,
            transform: [{ scale: scale }],
            opacity,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: rgba(background, isDark ? 0.5 : 0.8),
              padding: 2,
              paddingHorizontal: 4,
              paddingLeft: 5,
              borderRadius: 16,
            }}
          >
            <WaterQualityIndicator waterQuality={today.water_quality} />

            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: foreground,
              }}
            >
              {today.water_temperature}°C
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Marker>
  );
};
