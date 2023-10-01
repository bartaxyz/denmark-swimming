import BottomSheet from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { rgba } from "polished";
import { FC, useEffect, useMemo, useRef } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronUp } from "../icons/ChevronUp";
import { Route } from "../icons/Route";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { usePalette } from "../theme/usePalette";
import { useBeachesData } from "../useBeachesData";
import { getWeatherIcon } from "../utils/getWeatherIcon";
import { BeachDetailHeaderDivider } from "./BeachDetailHeaderDivider";
import { BeachDetailHeaderInfo } from "./BeachDetailHeaderInfo";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { WaterQualityIndicatorLabel } from "./WaterQualityIndicatorLabel";
import { BeachDetailInfo } from "./BeachDetailInfo";

export const HEADER_HEIGHT = 80;
export const SHEET_TOP_PADDING = 256;

export interface BeachDetailProps {
  bottomSheetAnimatedIndex?: Animated.SharedValue<number>;
  bottomSheetAnimatedPosition?: Animated.SharedValue<number>;
  onChange?: (index: number) => void;
}

export const BeachDetail: FC<BeachDetailProps> = ({
  bottomSheetAnimatedIndex: bottomSheetAnimatedIndexOverride,
  bottomSheetAnimatedPosition: bottomSheetAnimatedPositionOverride,
  onChange,
}) => {
  const { foreground, background, isDark } = usePalette();
  const insets = useSafeAreaInsets();

  const { beaches } = useBeachesData();
  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);
  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId
  );

  const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);
  const today = selectedBeach?.data[0];
  const weatherType = today?.weather_type;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [HEADER_HEIGHT + insets.bottom, "100%"], []);

  const indexRef = useRef(0);

  const handleSheetChange = (index: number) => {
    indexRef.current = index;
    onChange?.(index);
  };

  useEffect(() => {
    if (selectedBeach && bottomSheetRef.current && indexRef.current < 0) {
      bottomSheetRef.current.snapToIndex(0);
    }

    if (!selectedBeach && bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  }, [selectedBeach, bottomSheetRef]);

  const bottomSheetAnimatedIndexInternal = useSharedValue(0);
  const bottomSheetAnimatedIndex =
    bottomSheetAnimatedIndexOverride || bottomSheetAnimatedIndexInternal;

  const bottomSheetAnimatedPositionInternal = useSharedValue(0);
  const bottomSheetAnimatedPosition =
    bottomSheetAnimatedPositionOverride || bottomSheetAnimatedPositionInternal;

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
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        animatedIndex={bottomSheetAnimatedIndex}
        animatedPosition={bottomSheetAnimatedPosition}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backgroundComponent={BottomSheetBackground}
        backgroundStyle={{
          borderRadius: 24,
          backgroundColor: rgba(background, Platform.OS === "ios" ? 0.8 : 1),
          overflow: "hidden",
          borderColor: rgba(foreground, 0.1),
          borderWidth: 1,
          marginLeft: -1,
          marginRight: -1,
        }}
        handleHeight={0}
        handleStyle={{ display: "none" }}
        handleIndicatorStyle={{ backgroundColor: foreground }}
        onClose={() => setSelectedBeachId(undefined)}
        enablePanDownToClose={true}
        topInset={insets.top + SHEET_TOP_PADDING}
      >
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
            styles.header,
          ]}
          onPress={() => {
            if (indexRef.current === 0) {
              bottomSheetRef.current?.snapToIndex(1);
            } else {
              bottomSheetRef.current?.snapToIndex(0);
            }
          }}
        >
          <View style={styles.headerInfo}>
            <Text
              style={{ color: foreground, fontSize: 16, fontWeight: "bold" }}
            >
              {selectedBeach?.name || ""}
            </Text>
            <WaterQualityIndicatorLabel
              waterQuality={selectedBeach?.data[0].water_quality!}
            />
          </View>

          <BeachDetailHeaderDivider />

          {today && weatherType ? (
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
            <IconButton>
              <ChevronUp stroke={foreground} />
            </IconButton>
          </Animated.View>
        </Pressable>

        <View style={styles.contentContainer}>
          <Animated.View style={{ opacity: bottomSheetAnimatedIndex }}>
            <View style={styles.actionsBar}>
              <Button
                onPress={() => {
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedBeach?.latitude},${selectedBeach?.longitude}`
                  );
                }}
                leadingIcon={
                  <Route stroke={foreground} width={16} height={16} />
                }
                style={styles.actionsBarAction}
              >
                Directions
              </Button>

              {selectedBeach?.municipality_url && (
                <Button
                  onPress={() => {
                    Linking.openURL(selectedBeach?.municipality_url);
                  }}
                  style={styles.actionsBarAction}
                >
                  {selectedBeach?.municipality} Website
                </Button>
              )}
            </View>
          </Animated.View>
        </View>

        <BeachDetailInfo beach={selectedBeach} />
      </BottomSheet>
    </View>
  );
};

const BottomSheetBackground = ({ style }: any) => {
  const { isDark } = usePalette();

  if (Platform.OS === "ios") {
    return (
      <BlurView
        style={style}
        intensity={25 + Math.random()}
        tint={isDark ? "dark" : "light"}
      />
    );
  }

  return <View style={style} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    pointerEvents: "box-none",
  },
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
  contentContainer: {
    padding: 24,
    paddingTop: 0,
    gap: 4,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  actionsBarAction: {
    flexGrow: 1,
  },
});
