import { FC } from "react";
import { useDenmarkBeachesData } from "../utils/useDenmarkBeachesData";
import { TopIndicator } from "./TopIndicator";

export const LoadingIndicator: FC = () => {
  const { isLoading, error, retry } = useDenmarkBeachesData();

  if (!isLoading && !error) {
    return null;
  }

  return (
    <TopIndicator
      title={error ? error?.message || "Loading data failed" : undefined}
      subtitle={error ? "Tap to retry" : undefined}
      isLoading={isLoading}
      onPress={retry}
    />
  );
};
