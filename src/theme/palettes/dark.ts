import { lightPalette } from "./light";

export const darkPalette = {
  ...lightPalette,

  isDark: true,
  background: "#000",
  foreground: "#fff",
} satisfies typeof lightPalette;
