import { WaterQuality } from "../../types";
import { usePalette } from "../theme/usePalette";

export const useWaterQualityColor = (waterQuality: WaterQuality) => {
  const { markers } = usePalette();

  const waterQualityColorMap: Record<WaterQuality, string> = {
    [WaterQuality.Bad]: markers.bad,
    [WaterQuality.Good]: markers.good,
    [WaterQuality.Unknown]: markers.unknown,
    [WaterQuality.Closed]: markers.closed,
  };

  return waterQualityColorMap[waterQuality] || markers.unknown;
};
