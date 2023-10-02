import { rgba } from "polished";
import { FC, forwardRef } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { usePalette } from "../theme/usePalette";

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

    const styles = StyleSheet.create({
      button: {
        width: size === "M" ? 40 : 48,
        height: size === "M" ? 40 : 48,
        backgroundColor: rgba(foreground, isDark ? 0.1 : 0),
        borderRadius: 64,
        borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
      },
      buttonSolid: {
        backgroundColor: background,
        shadowColor: "black",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      },
      buttonTransparent: {
        backgroundColor: "transparent",
        borderWidth: 0,
      },
    });

    const buttonStyles: StyleProp<ViewStyle> = [styles.button];

    if (variant === "solid") {
      buttonStyles.push(styles.buttonSolid);
    } else if (variant === "transparent") {
      buttonStyles.push(styles.buttonTransparent);
    }

    /*   if (!onPress) {
      return (
        <View ref={ref} style={[buttonStyles, style]}>
          {children}
        </View>
      );
    } */

    return (
      <Pressable
        ref={ref}
        onPress={onPress || (() => {})}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          buttonStyles,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
);
