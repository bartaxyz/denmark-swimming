import { router } from "expo-router";
import { Beaches } from "../../types";
import { useBeachDataStore } from "../state/useBeachDataStore";

export const useDenmarkBeachesData = () => {
  const cachedBeaches = useBeachDataStore((state) => state.beaches);
  const isCacheValid = useBeachDataStore((state) => state.isCacheValid);
  const clearCache = useBeachDataStore((state) => state.clearCache);

  const forceRefresh = () => {
    clearCache();
    router.replace("/captcha");
  };

  return {
    beaches: cachedBeaches,
    isLoading: false,
    error: undefined,
    retry: forceRefresh,
    forceRefresh,
    isCacheValid: isCacheValid(),
  };
};
