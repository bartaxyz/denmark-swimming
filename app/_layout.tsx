import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default () => {
  return (
    <>
      <StatusBar style="auto" />

      <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </View>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
