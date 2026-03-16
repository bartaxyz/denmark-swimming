import { FC } from "react";
import { useBeachDataStore } from "../state/useBeachDataStore";
import { useDenmarkBeachesData } from "../utils/useDenmarkBeachesData";
import { TopIndicator } from "./TopIndicator";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days === 1 ? "yesterday" : `${days} days ago`;
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  return "just now";
}

export const LoadingIndicator: FC = () => {
  const { isLoading, isCacheValid, forceRefresh, beaches } = useDenmarkBeachesData();
  const lastFetchTimestamp = useBeachDataStore((state) => state.lastFetchTimestamp);

  if (isLoading) {
    return <TopIndicator isLoading />;
  }

  if (!isCacheValid && beaches.length > 0 && lastFetchTimestamp) {
    return (
      <TopIndicator
        title={`Updated ${formatTimeAgo(lastFetchTimestamp)}`}
        subtitle="Tap to refresh"
        onPress={forceRefresh}
      />
    );
  }

  return null;
};
