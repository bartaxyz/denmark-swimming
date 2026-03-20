import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { usePalette } from "../src/theme/usePalette";

export default () => {
  const { background, foreground } = usePalette();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background,
      card: background,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <View
        style={{
          flex: 1,
          backgroundColor: background,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="index"
              options={{ title: "Map", headerBackTitle: "" }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: "Settings",
                headerTintColor: foreground,
                headerBackButtonDisplayMode: "minimal",
              }}
            />
          </Stack>
        </View>
        </GestureHandlerRootView>
      </View>
    </ThemeProvider>
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
