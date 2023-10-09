import { rgba } from "polished";
import { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePalette } from "../theme/usePalette";

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  variant?: "normal" | "selected";
  style?: any;
}

export const Button: FC<ButtonProps> = ({
  children,
  onPress,
  leadingIcon,
  trailingIcon,
  variant = "normal",
  style,
}) => {
  const { isDark, foreground } = usePalette();

  const styles = StyleSheet.create({
    button: {
      backgroundColor: rgba(foreground, isDark ? 0.1 : 0),
      padding: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderColor: rgba(
        foreground,
        variant === "selected" ? 1 : isDark ? 0.15 : 0.1
      ),
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    leadingIcon: {
      marginRight: 8,
    },
    trailingIcon: {
      marginLeft: 8,
    },
    label: {
      color: foreground,
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.5 : 1,
        },
        style,
      ]}
    >
      {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}
      <Text style={styles.label}>{children}</Text>
      {trailingIcon && <View style={styles.trailingIcon}>{trailingIcon}</View>}
    </Pressable>
  );
};
