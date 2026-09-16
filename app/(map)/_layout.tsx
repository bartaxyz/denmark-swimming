import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Sheet } from "@lodev09/react-native-true-sheet/navigation/expo-router";
import { router } from "expo-router";
import { useRef } from "react";
import { Platform } from "react-native";
import { useMapActions } from "../../src/state/useMapActions";
import { useSheetIndex } from "../../src/state/useSheetIndex";
import { usePalette } from "../../src/theme/usePalette";
import { getSheetDetents } from "../../src/utils/getSheetDetents";
import "../../src/utils/recenter"; // registers recenter into useMapActions

declare const module: {
  hot?: { dispose: (callback: () => void) => void };
};

if (__DEV__) {
  module.hot?.dispose(() => {
    TrueSheet.dismissAll(false).catch(() => {});
  });
}

export default function MapLayout() {
  const detents = getSheetDetents();
  const setIndex = useSheetIndex((s) => s.setIndex);
  const sheetShown = useRef(false);
  const { background } = usePalette();

  return (
    <Sheet
      screenListeners={{
        focus: ({ target }: { target?: string }) => {
          if (!sheetShown.current && target?.startsWith("index")) {
            sheetShown.current = true;
            router.push("/(map)/beach-sheet");
          }
        },
      }}
    >
      <Sheet.Screen name="index" />
      <Sheet.Screen
        name="beach-sheet"
        options={{
          detents,
          grabber: Platform.select({ android: false, default: undefined }),
          dimmed: false,
          dismissible: false,
          style: { flex: 1 },
          backgroundColor: Platform.select({
            android: background,
            default: undefined,
          }),
        }}
        listeners={{
          sheetDetentChange: (e: any) => {
            const previousIndex = useSheetIndex.getState().index;
            const index = e.data?.index ?? 0;
            setIndex(index);

            const sheetExpanded = index > previousIndex;
            const sheetShrunk = index < previousIndex;
            const sheetFullyExpanded = detents[index] >= 1;
            const canRecenterAfterExpand =
              sheetExpanded && !useMapActions.getState().userMovedSinceRecenter;

            if (!sheetFullyExpanded && (sheetShrunk || canRecenterAfterExpand)) {
              useMapActions.getState().recenter();
            }
          },
        }}
      />
    </Sheet>
  );
}
