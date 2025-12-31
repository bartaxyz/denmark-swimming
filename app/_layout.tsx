import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { usePalette } from "../src/theme/usePalette";

export default () => {
  const { background } = usePalette();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: background,
      }}
    >
      <StatusBar style="auto" />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
        </View>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
