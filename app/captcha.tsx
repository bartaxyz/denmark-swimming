import { router } from "expo-router";
import { useCallback } from "react";
import { CaptchaWebView } from "../src/components/CaptchaWebView";
import { useBeachDataStore } from "../src/state/useBeachDataStore";
import { transformApiResponse } from "../src/utils/transformApiResponse";

export default function CaptchaScreen() {
  const setBeaches = useBeachDataStore((state) => state.setBeaches);

  const handleDataReceived = useCallback(
    (data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        setBeaches(transformApiResponse(data));
        router.replace("/");
      }
    },
    [setBeaches]
  );

  const handleError = useCallback((error: string) => {
    console.error("[Captcha] WebView error:", error);
  }, []);

  return (
    <CaptchaWebView
      onDataReceived={handleDataReceived}
      onError={handleError}
    />
  );
}

