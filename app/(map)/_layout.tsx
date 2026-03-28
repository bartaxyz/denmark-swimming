import { router, withLayoutContext } from "expo-router";
import { Platform } from "react-native";
import { createTrueSheetNavigator } from "@lodev09/react-native-true-sheet/navigation";
import { getSheetDetents } from "../../src/utils/getSheetDetents";
import { useSheetIndex } from "../../src/state/useSheetIndex";
import { usePalette } from "../../src/theme/usePalette";
import { useRef } from "react";
import { useMapActions } from "../../src/state/useMapActions";
import "../../src/utils/recenter"; // registers recenter into useMapActions

const { Navigator } = createTrueSheetNavigator();

const SheetNavigator = withLayoutContext(Navigator);

export default function MapLayout() {
  const detents = getSheetDetents();
  const setIndex = useSheetIndex((s) => s.setIndex);
  const sheetShown = useRef(false);
  const { background } = usePalette();

  return (
    <SheetNavigator
      screenListeners={{
        focus: ({ target }) => {
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
        }}
        listeners={{
          sheetDetentChange: (e: any) => {
            const index = e.data?.index ?? 0;
            setIndex(index);
            if (detents[index] < 1) {
              useMapActions.getState().recenter();
            }
          },
        }}
      />
    </SheetNavigator>
  );
}
