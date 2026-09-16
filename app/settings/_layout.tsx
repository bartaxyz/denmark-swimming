import { Slot } from "expo-router";
import { View } from "react-native";
import { usePalette } from "../../src/theme/usePalette";

export default () => {
  const { background } = usePalette();

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Slot />
    </View>
  );
};
