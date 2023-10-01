import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePalette } from "../theme/usePalette";

export interface BeachDetailHeaderInfo {
  emoji: string;
  value: string;
}

export const BeachDetailHeaderInfo: FC<BeachDetailHeaderInfo> = ({
  emoji,
  value,
}) => {
  const { foreground } = usePalette();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
    },
    emoji: {
      fontSize: 16,
    },
    value: {
      color: foreground,
      fontSize: 12,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};
