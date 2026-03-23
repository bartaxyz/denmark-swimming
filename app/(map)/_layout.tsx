import { withLayoutContext } from "expo-router";
import { createTrueSheetNavigator } from "@lodev09/react-native-true-sheet/navigation";
import { getSheetDetents } from "../../src/utils/getSheetDetents";
import { useSheetIndex } from "../../src/state/useSheetIndex";

const { Navigator } = createTrueSheetNavigator();

const SheetNavigator = withLayoutContext(Navigator);

export default function MapLayout() {
  const detents = getSheetDetents();
  const setIndex = useSheetIndex((s) => s.setIndex);

  return (
    <SheetNavigator>
      <SheetNavigator.Screen name="index" />
      <SheetNavigator.Screen
        name="beach-detail"
        options={{
          detents,
          grabber: true,
          dimmed: false,
          dismissible: false,
          scrollable: true,
        }}
        listeners={{
          sheetDetentChange: (e: any) => {
            setIndex(e.data?.index ?? 0);
          },
        }}
      />
    </SheetNavigator>
  );
}
