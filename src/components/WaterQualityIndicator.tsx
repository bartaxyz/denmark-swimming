import { rgba } from "polished";
import { FC } from "react";
import { View } from "react-native";
import { WaterQuality } from "../../types";
import { usePalette } from "../theme/usePalette";
import { useWaterQualityColor } from "../utils/useWaterQualityColor";

export interface WaterQualityIndicatorProps {
  waterQuality: WaterQuality;
}

export const WaterQualityIndicator: FC<WaterQualityIndicatorProps> = ({
  waterQuality,
}) => {
  const { foreground } = usePalette();
  const waterQualityColor = useWaterQualityColor(waterQuality);

  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 12,
        backgroundColor: waterQualityColor,
        borderColor: rgba(foreground, 0.2),
        borderWidth: 1,
      }}
    />
  );
};
