import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheetScrollViewMethods } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import { BlurView } from "expo-blur";
import { rgba } from "polished";
import { FC, useEffect, useMemo, useRef } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route } from "../icons/Route";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { usePalette } from "../theme/usePalette";
import { useBeachesData } from "../useBeachesData";
import { BeachDetailHeader, HEADER_HEIGHT } from "./BeachDetailHeader";
import { BeachDetailInfo } from "./BeachDetailInfo";
import { Button } from "./Button";

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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetScrollViewRef = useRef<BottomSheetScrollViewMethods>(null);
  const snapPoints = useMemo(
    () => [HEADER_HEIGHT + insets.bottom, "100%"],
    [insets]
  );

  const indexRef = useRef(0);

  const handleSheetChange = (index: number) => {
    indexRef.current = index;
    onChange?.(index);
  };

  const scrollToTop = () => {
    bottomSheetScrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  useEffect(() => {
    scrollToTop();
  }, [selectedBeach]);

  useEffect(() => {
    if (!bottomSheetRef.current) {
      return;
    }

    if (selectedBeach && indexRef.current < 0) {
      bottomSheetRef.current.snapToIndex(0);
    }

    if (!selectedBeach) {
      bottomSheetRef.current.close();
    }
  }, [selectedBeach, bottomSheetRef]);

  const bottomSheetAnimatedIndexInternal = useSharedValue(0);
  const bottomSheetAnimatedIndex =
    bottomSheetAnimatedIndexOverride || bottomSheetAnimatedIndexInternal;

  const bottomSheetAnimatedPositionInternal = useSharedValue(0);
  const bottomSheetAnimatedPosition =
    bottomSheetAnimatedPositionOverride || bottomSheetAnimatedPositionInternal;

  const toggleBeachDetail = () => {
    if (indexRef.current === 0) {
      bottomSheetRef.current?.snapToIndex(1);
      onChange?.(1);
    } else {
      bottomSheetRef.current?.snapToIndex(0);
      onChange?.(0);
    }
  };

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        animatedIndex={bottomSheetAnimatedIndex}
        animatedPosition={bottomSheetAnimatedPosition}
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
        {selectedBeach ? (
          <BeachDetailHeader
            toggleBeachDetail={toggleBeachDetail}
            selectedBeach={selectedBeach}
            bottomSheetAnimatedIndex={bottomSheetAnimatedIndex}
            today={today}
          />
        ) : (
          <View style={styles.emptyHeader}>
            <Text style={[styles.emptyHeaderLabel, { color: foreground }]}>
              Select a beach
            </Text>
          </View>
        )}

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
                    // The `municipality_url` field has a format of
                    // "<a target='_blank' href='http://www.ishoj.dk'>Hjemmeside</a>"
                    // Therefore, we need to find the URL inside the href attribute
                    const url =
                      selectedBeach?.municipality_url.match(
                        /href='(.*)'/
                      )?.[1] || undefined;

                    if (!url) return;

                    Linking.openURL(url);
                  }}
                  style={styles.actionsBarAction}
                >
                  {selectedBeach?.municipality} Website
                </Button>
              )}
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            height: 1,
            backgroundColor: rgba(foreground, 0.1),
            marginLeft: 16,
            marginRight: 16,
            marginTop: 16,
            opacity: bottomSheetAnimatedIndex,
          }}
        />

        <BottomSheetScrollView
          ref={bottomSheetScrollViewRef}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
          }}
        >
          <BeachDetailInfo beach={selectedBeach} />
        </BottomSheetScrollView>
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
  emptyHeader: {
    height: HEADER_HEIGHT,
    paddingLeft: 24,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyHeaderLabel: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.5,
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
    paddingBottom: 0,
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
