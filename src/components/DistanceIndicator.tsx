import { FC } from "react";
import { TransportationMode, usePreferences } from "../state/usePreferences";
import { useSelectedRoute } from "../utils/useSelectedRoute";
import { TopIndicator } from "./TopIndicator";

const labelMap: Record<TransportationMode, string> = {
  driving: "by car",
  walking: "on foot",
  bicycling: "by bike",
  transit: "by public transport",
};

export const DistanceIndicator: FC = () => {
  const { distance, duration } = useSelectedRoute();
  const transportationMode = usePreferences(
    (state) => state.transportationMode
  );

  if (!distance || !duration) {
    return null;
  }

  return (
    <TopIndicator
      title={`${distance.text} • ${duration.text} ${labelMap[transportationMode]}`}
    />
  );
};
