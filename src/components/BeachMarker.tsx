import { rgba } from "polished";
import { FC, memo } from "react";
import { Text, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated from "react-native-reanimated";
import { useSelectedBeach } from "../../src/state/useSelectedBeach";
import { Beach } from "../../types";
import { usePalette } from "../theme/usePalette";
import { useAnimatedMarker } from "../utils/useAnimatedMarker";
import { WaterQualityIndicator } from "./WaterQualityIndicator";

export interface BeachMarkerProps {
  beachId: number;
  coordinates: GeoJSON.Position;
  todayWaterQuality: Beach["data"][0]["water_quality"];
  todayWaterTemperature: Beach["data"][0]["water_temperature"];
}

export const BeachMarker = memo<BeachMarkerProps>(
  ({ beachId, coordinates, todayWaterQuality, todayWaterTemperature }) => {
    const [longitude, latitude] = coordinates;

    const { background, foreground, isDark } = usePalette();
    const { scaleStyle, highlightOpacityStyle } = useAnimatedMarker(beachId);
    const setSelectedBeachId = useSelectedBeach(
      (state) => state.setSelectedBeachId
    );

    return (
      <Marker
        identifier={`${beachId}`}
        coordinate={{ latitude, longitude }}
        onPress={() => setSelectedBeachId(beachId)}
        anchor={{ x: 0.5, y: 0.5 }}
        // tracksViewChanges={false}
      >
        <View
          style={{ padding: 4, paddingHorizontal: 8, position: "relative" }}
        >
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
              <WaterQualityIndicator waterQuality={todayWaterQuality} />

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: foreground,
                }}
              >
                {todayWaterTemperature}°C
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
  },
  (prevProps, nextProps) => prevProps.beachId === nextProps.beachId
);
