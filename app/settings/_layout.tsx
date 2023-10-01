import { Slot } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default () => {
  return (
    <SafeAreaView>
      <Text>Settings</Text>

      <Slot />
    </SafeAreaView>
  );
};
