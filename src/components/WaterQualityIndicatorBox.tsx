import { rgba } from "polished";
import { FC } from "react";
import { StyleSheet, View } from "react-native";
import { WaterQuality } from "../../types";
import { useWaterQualityColor } from "../utils/useWaterQualityColor";
import { WaterQualityIndicatorLabel } from "./WaterQualityIndicatorLabel";
import { usePalette } from "../theme/usePalette";

export interface WaterQualityIndicatorBoxProps {
  waterQuality: WaterQuality;
}

export const WaterQualityIndicatorBox: FC<WaterQualityIndicatorBoxProps> = ({
  waterQuality,
}) => {
  const { foreground, isDark } = usePalette();
  const waterQualityColor = useWaterQualityColor(waterQuality);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: rgba(waterQualityColor, 0.1),
      borderColor: rgba(waterQualityColor, isDark ? 0.2 : 0.1),
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      paddingHorizontal: 12,
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <WaterQualityIndicatorLabel waterQuality={waterQuality} />
    </View>
  );
};
