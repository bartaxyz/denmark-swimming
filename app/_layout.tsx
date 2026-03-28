import { Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform, useColorScheme } from "react-native";
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
      <StatusBar style={isDark ? "light" : "dark"} />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="(map)"
            options={{ title: "Map", headerBackTitle: "" }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              headerTransparent: Platform.OS === "ios",
              headerStyle: Platform.select({
                android: { backgroundColor: background },
              }),
              headerTitle: "Settings",
              headerTintColor: foreground,
              headerBackButtonDisplayMode: "minimal",
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};
