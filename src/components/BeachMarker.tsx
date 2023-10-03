import { rgba } from "polished";
import { FC, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { useSelectedBeach } from "../../src/state/useSelectedBeach";
import { Beach } from "../../types";
import { usePalette } from "../theme/usePalette";
import { useAnimatedMarker } from "../utils/useAnimatedMarker";
import { WaterQualityIndicator } from "./WaterQualityIndicator";

export interface BeachMarkerProps {
  beach: Beach;
}

export const BeachMarker: FC<BeachMarkerProps> = ({ beach }) => {
  const { background, foreground, isDark } = usePalette();

  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId
  );
  const { scale, highlightOpacity, scaleStyle, highlightOpacityStyle } =
    useAnimatedMarker(beach, true);

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
      <View style={{ padding: 4, paddingHorizontal: 8, position: "relative" }}>
        <Animated.View
          style={[
            {
              position: "relative",
              borderColor: rgba(foreground, 0.1),
              borderWidth: 1,
              borderRadius: 16,
            },
            scaleStyle,
          ]}
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
      </View>
    </Marker>
  );
};
