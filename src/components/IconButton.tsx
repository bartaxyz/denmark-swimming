import { GlassView } from "expo-glass-effect";
import { rgba } from "polished";
import { forwardRef } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { usePalette } from "../theme/usePalette";

export const ICON_BUTTON_SIZES = { M: 40, L: 48 } as const;

export interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  size?: "M" | "L";
  style?: any;
}

export const IconButton = forwardRef<View, IconButtonProps>(
  ({ children, onPress, size = "M", style }, ref) => {
    const { foreground, background } = usePalette();

    const dimension = ICON_BUTTON_SIZES[size];

    const styles = StyleSheet.create({
      baseStyle: {
        width: dimension,
        height: dimension,
        borderRadius: 64,
        ...Platform.select({
          android: {
            backgroundColor: background,
            elevation: 2,
            overflow: "hidden",
          },
          default: {},
        }),
      },
      glassStyle: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 64,
      },
    });

    return (
      <Pressable
        ref={ref}
        onPress={onPress || ((event) => event.preventDefault())}
        android_ripple={{ color: rgba(foreground, 0.2), foreground: true }}
        style={({ pressed }) => [
          styles.baseStyle,
          Platform.OS === "ios" && { opacity: pressed ? 0.5 : 1 },
          style,
        ]}
      >
        <GlassView
          {...(Platform.OS === "ios" ? { isInteractive: true } : {})}
          style={styles.glassStyle}
        >
          {children}
        </GlassView>
      </Pressable>
    );
  },
);
