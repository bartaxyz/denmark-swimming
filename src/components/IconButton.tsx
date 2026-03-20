import { GlassView } from "expo-glass-effect";
import { rgba } from "polished";
import { FC, forwardRef } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { usePalette } from "../theme/usePalette";

let useGlass = Platform.OS === "ios";

export interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "solid" | "outline-only" | "transparent";
  size?: "M" | "L";
  style?: any;
}

export const IconButton = forwardRef<View, IconButtonProps>(
  ({ children, onPress, variant = "outline-only", size = "M", style }, ref) => {
    const { foreground, background, isDark } = usePalette();

    const dimension = size === "M" ? 40 : 48;

    const baseStyle: ViewStyle = {
      width: dimension,
      height: dimension,
      borderRadius: 64,
      alignItems: "center",
      justifyContent: "center",
    };

    const fallbackStyle: ViewStyle = {
      ...baseStyle,
      backgroundColor: rgba(foreground, isDark ? 0.1 : 0),
      borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
      borderWidth: 1,
    };

    const solidStyle: ViewStyle = {
      backgroundColor: background,
      shadowColor: "black",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    };

    const buttonStyles: StyleProp<ViewStyle> = [
      useGlass ? baseStyle : fallbackStyle,
    ];

    if (variant === "solid" && !useGlass) {
      buttonStyles.push(solidStyle);
    } else if (variant === "transparent") {
      buttonStyles.push({ backgroundColor: "transparent", borderWidth: 0 });
    }

    const content = (
      <Pressable
        ref={ref}
        onPress={onPress || ((event) => event.preventDefault())}
        style={({ pressed }) => [buttonStyles, style]}
      >
        <GlassView isInteractive={true} style={baseStyle}>
          {children}
        </GlassView>
      </Pressable>
    );

    return content;
  },
);
