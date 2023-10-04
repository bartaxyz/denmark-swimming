import { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WaterQuality } from "../../types";
import { usePalette } from "../theme/usePalette";
import { WaterQualityIndicator } from "./WaterQualityIndicator";

export interface BeachClusterDatumProps {
  waterQuality: WaterQuality;
  count?: number;
}

export const BeachClusterDatum: FC<BeachClusterDatumProps> = ({
  waterQuality,
  count,
}) => {
  const { foreground } = usePalette();

  const labelStyle = useMemo(
    () => [
      styles.label,
      {
        color: foreground,
      },
    ],
    [foreground]
  );

  if (count === undefined || count === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <WaterQualityIndicator waterQuality={waterQuality} />
      <Text style={labelStyle}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
