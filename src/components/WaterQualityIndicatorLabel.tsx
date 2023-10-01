import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WaterQuality } from "../../types";
import { getWaterQualityLabel } from "../utils/getWaterQualityLabel";
import { useWaterQualityColor } from "../utils/useWaterQualityColor";
import { WaterQualityIndicator } from "./WaterQualityIndicator";

export interface WaterQualityIndicatorLabelProps {
  waterQuality: WaterQuality;
}

export const WaterQualityIndicatorLabel: FC<
  WaterQualityIndicatorLabelProps
> = ({ waterQuality }) => {
  const waterQualityColor = useWaterQualityColor(waterQuality);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      color: waterQualityColor,
      fontSize: 12,
      marginLeft: 4,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      <WaterQualityIndicator waterQuality={waterQuality} />
      <Text style={styles.label}>{getWaterQualityLabel(waterQuality)}</Text>
    </View>
  );
};
