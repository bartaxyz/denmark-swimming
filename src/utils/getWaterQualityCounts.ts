import { Beaches, WaterQuality } from "../../types";

export const getWaterQualityCounts = (beaches: Beaches) => {
  const waterQualityCounts = beaches.reduce(
    (acc, beach) => {
      const quality = beach.data?.[0]?.water_quality ?? WaterQuality.Unknown;
      acc[quality] += 1;
      return acc;
    },
    {
      [WaterQuality.Bad]: 0,
      [WaterQuality.Closed]: 0,
      [WaterQuality.Good]: 0,
      [WaterQuality.Unknown]: 0,
    }
  );

  return waterQualityCounts;
};
