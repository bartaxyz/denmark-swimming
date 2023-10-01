import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePalette } from "../theme/usePalette";
import { rgba } from "polished";

export interface BeachDetailHeaderDivider {}

export const BeachDetailHeaderDivider: FC<BeachDetailHeaderDivider> = () => {
  const { foreground, isDark } = usePalette();

  const styles = StyleSheet.create({
    divider: {
      height: 40,
      width: 1,
      backgroundColor: rgba(foreground, isDark ? 0.15 : 0.1),
    },
  });

  return <View style={styles.divider} />;
};
