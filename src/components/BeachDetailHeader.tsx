import { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Beach } from "../../types";
import { ChevronUp } from "../icons/ChevronUp";
import { usePalette } from "../theme/usePalette";
import { getWeatherIcon } from "../utils/getWeatherIcon";
import { BeachDetailHeaderDivider } from "./BeachDetailHeaderDivider";
import { BeachDetailHeaderInfo } from "./BeachDetailHeaderInfo";
import { IconButton } from "./IconButton";
import { WaterQualityIndicatorLabel } from "./WaterQualityIndicatorLabel";

export const HEADER_HEIGHT = 80;

export interface BeachDetailHeaderProps {
  toggleBeachDetail: () => void;
  bottomSheetAnimatedIndex: Animated.SharedValue<number>;
  selectedBeach: Beach;
  today?: Beach["data"][number];
}

export const BeachDetailHeader: FC<BeachDetailHeaderProps> = ({
  toggleBeachDetail,
  selectedBeach,
  today,
  bottomSheetAnimatedIndex,
}) => {
  const { foreground } = usePalette();

  const weatherType = today?.weather_type;

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${bottomSheetAnimatedIndex.value * 180}deg`,
        },
      ],
    };
  });

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
        },
        styles.header,
      ]}
      onPress={toggleBeachDetail}
    >
      <View style={styles.headerInfo}>
        <Text
          style={{
            color: foreground,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {selectedBeach?.name || ""}
        </Text>

        <WaterQualityIndicatorLabel
          waterQuality={selectedBeach?.data[0].water_quality!}
        />
      </View>

      <BeachDetailHeaderDivider />

      {today && (weatherType || today.air_temperature) ? (
        <BeachDetailHeaderInfo
          emoji={getWeatherIcon(weatherType)}
          value={`${today.air_temperature} °C`}
        />
      ) : null}

      <BeachDetailHeaderDivider />

      {today?.water_temperature ? (
        <BeachDetailHeaderInfo
          emoji="💧"
          value={`${today?.water_temperature} °C`}
        />
      ) : null}

      <Animated.View style={chevronAnimatedStyle}>
        <IconButton onPress={toggleBeachDetail}>
          <ChevronUp stroke={foreground} />
        </IconButton>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    paddingLeft: 24,
    paddingRight: 16,
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfo: {
    flexDirection: "column",
    gap: 4,
    flexGrow: 1,
  },
});
