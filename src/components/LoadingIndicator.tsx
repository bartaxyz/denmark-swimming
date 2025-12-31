import { FC } from "react";
import { useDenmarkBeachesData } from "../utils/useDenmarkBeachesData";
import { TopIndicator } from "./TopIndicator";

export const LoadingIndicator: FC = () => {
  const { isLoading, retry } = useDenmarkBeachesData();

  if (!isLoading) {
    return null;
  }

  return (
    <TopIndicator
      isLoading={isLoading}
      onPress={retry}
    />
  );
};
