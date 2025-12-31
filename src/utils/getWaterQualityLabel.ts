import { WaterQuality } from "../../types";

export const getWaterQualityLabel = (waterQuality: WaterQuality) => {
  const waterQualityLabelMap: Record<WaterQuality, string> = {
    [WaterQuality.Bad]: "Bad water quality",
    [WaterQuality.Good]: "Good water quality",
    [WaterQuality.Unknown]: "Unknown water quality",
    [WaterQuality.Closed]: "The beach is closed",
  };

  return waterQualityLabelMap[waterQuality] || "Unknown water quality";
};
