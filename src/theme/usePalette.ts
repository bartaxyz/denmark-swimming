import { useColorScheme } from "react-native";
import { darkPalette } from "./palettes/dark";
import { lightPalette } from "./palettes/light";

export const usePalette = () => {
  const colorScheme = useColorScheme();

  return colorScheme === "dark" ? darkPalette : lightPalette;
};
