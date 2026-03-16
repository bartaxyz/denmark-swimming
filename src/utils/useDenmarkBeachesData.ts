import { router } from "expo-router";
import { useBeachDataStore } from "../state/useBeachDataStore";

export const useDenmarkBeachesData = () => {
  const cachedBeaches = useBeachDataStore((state) => state.beaches);
  const isCacheValid = useBeachDataStore((state) => state.isCacheValid);
  const clearCache = useBeachDataStore((state) => state.clearCache);
  const hasHydrated = useBeachDataStore((state) => state._hasHydrated);
  const status = useBeachDataStore((state) => state.status);

  const forceRefresh = () => {
    clearCache();
    router.replace("/captcha");
  };

  return {
    beaches: cachedBeaches,
    isLoading: !hasHydrated,
    error: undefined,
    retry: forceRefresh,
    forceRefresh,
    isCacheValid: isCacheValid(),
    hasHydrated,
    status,
  };
};
