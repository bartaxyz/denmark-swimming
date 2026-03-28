import { GlassView } from "expo-glass-effect";
import { rgba } from "polished";
import { forwardRef } from "react";
import {
  Platform,
  Pressable,
  View,
  ViewStyle,
} from "react-native";
import { usePalette } from "../theme/usePalette";

export interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  size?: "M" | "L";
  style?: any;
}

export const IconButton = forwardRef<View, IconButtonProps>(
  ({ children, onPress, size = "M", style }, ref) => {
    const { foreground, background } = usePalette();

    const dimension = size === "M" ? 40 : 48;

    const baseStyle: ViewStyle = {
      width: dimension,
      height: dimension,
      borderRadius: 64,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...Platform.select({
        android: { backgroundColor: background, elevation: 2 },
        default: {},
      }),
    };

    return (
      <Pressable
        ref={ref}
        onPress={onPress || ((event) => event.preventDefault())}
        android_ripple={{ color: rgba(foreground, 0.2), foreground: true }}
        style={({ pressed }) => [
          baseStyle,
          Platform.OS === "ios" && { opacity: pressed ? 0.5 : 1 },
          style,
        ]}
      >
        <GlassView
          {...(Platform.OS === "ios" ? { isInteractive: true } : {})}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {children}
        </GlassView>
      </Pressable>
    );
  },
);
