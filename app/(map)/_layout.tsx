import { createTrueSheetNavigator } from "@lodev09/react-native-true-sheet/navigation";
import { Link, router, withLayoutContext } from "expo-router";
import { useRef } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { HEADER_HEIGHT } from "../../src/components/BeachDetailHeader";
import { IconButton } from "../../src/components/IconButton";
import { PlatformIcon } from "../../src/components/PlatformIcon";
import { Mark } from "../../src/icons/Mark";
import { Settings01 } from "../../src/icons/Settings01";
import { useMapActions } from "../../src/state/useMapActions";
import { useSheetIndex } from "../../src/state/useSheetIndex";
import { usePalette } from "../../src/theme/usePalette";
import { getSheetDetents } from "../../src/utils/getSheetDetents";
import { useLocate } from "../../src/utils/useLocate";
import "../../src/utils/recenter"; // registers recenter into useMapActions

const { Navigator } = createTrueSheetNavigator();

const SheetNavigator = withLayoutContext(Navigator);

export default function MapLayout() {
  const detents = getSheetDetents();
  const setIndex = useSheetIndex((s) => s.setIndex);
  const setPosition = useSheetIndex((s) => s.setPosition);
  const sheetIndex = useSheetIndex((s) => s.index);
  const sheetShown = useRef(false);
  const { background, foreground } = usePalette();
  const locate = useLocate();
  const screenHeight = Dimensions.get("window").height;
  const controlsBottom = useSharedValue(HEADER_HEIGHT + 12);
  const controlsStyle = useAnimatedStyle(() => ({
    bottom: controlsBottom.value,
  }));
  const showControls = (detents[sheetIndex] ?? 0) < 1;

  return (
    <>
      <SheetNavigator
      screenListeners={{
        focus: ({ target }: { target?: string }) => {
          if (!sheetShown.current && target?.startsWith("index")) {
            sheetShown.current = true;
            router.push("/(map)/beach-sheet");
          }
        },
      }}
    >
      <SheetNavigator.Screen name="index" />
      <SheetNavigator.Screen
        name="beach-sheet"
        options={{
          detents,
          grabber: Platform.select({ android: false, default: undefined }),
          dimmed: false,
          dismissible: false,
          scrollable: true,
          backgroundColor: Platform.select({
            android: background,
            default: undefined,
          }),
          reanimated: true,
          positionChangeHandler: ({ position }: { position: number }) => {
            "worklet";
            controlsBottom.value = screenHeight - position + 12;
          },
        }}
        listeners={{
          sheetDetentChange: (e: any) => {
            const previousIndex = useSheetIndex.getState().index;
            const index = e.data?.index ?? 0;
            setIndex(index);
            if (typeof e.data?.position === "number") {
              setPosition(e.data.position);
            }

            const sheetExpanded = index > previousIndex;
            const sheetShrunk = index < previousIndex;
            const sheetFullyExpanded = detents[index] >= 1;
            const canRecenterAfterExpand =
              sheetExpanded && !useMapActions.getState().userMovedSinceRecenter;

            if (
              !sheetFullyExpanded &&
              (sheetShrunk || canRecenterAfterExpand)
            ) {
              useMapActions.getState().recenter();
            }
          },
        }}
      />
      </SheetNavigator>

      {showControls && (
        <View style={styles.controlsOverlay} pointerEvents="box-none">
          <Animated.View style={[styles.controlsBar, controlsStyle]}>
            <Link href="/settings" asChild>
              <IconButton size="L">
                <PlatformIcon
                  iosName="gearshape"
                  fallback={<Settings01 stroke={foreground} />}
                  color={foreground}
                />
              </IconButton>
            </Link>

            <IconButton onPress={locate} size="L">
              <PlatformIcon
                iosName="location"
                fallback={<Mark stroke={foreground} />}
                color={foreground}
              />
            </IconButton>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "box-none",
  },
  controlsBar: {
    position: "absolute",
    left: 24,
    right: 24,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    pointerEvents: "box-none",
  },
});
