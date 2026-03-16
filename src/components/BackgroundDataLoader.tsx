import { FC, useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { WEBSITE_URL } from "../constants/api";
import { INJECTED_JAVASCRIPT } from "../constants/injectedJs";
import { useBeachDataStore } from "../state/useBeachDataStore";
import { transformApiResponse } from "../utils/transformApiResponse";

interface BackgroundDataLoaderProps {
  onNeedsCaptcha?: () => void;
  onSuccess?: () => void;
}

export const BackgroundDataLoader: FC<BackgroundDataLoaderProps> = ({
  onNeedsCaptcha,
  onSuccess,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [showWebView, setShowWebView] = useState(false);
  const captchaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasReceivedDataRef = useRef(false);

  const status = useBeachDataStore((state) => state.status);
  const setBeaches = useBeachDataStore((state) => state.setBeaches);
  const setStatus = useBeachDataStore((state) => state.setStatus);
  const isCacheValid = useBeachDataStore((state) => state.isCacheValid);

  const requestRefresh = useCallback(() => {
    if (!isCacheValid()) {
      hasReceivedDataRef.current = false;
      setShowWebView(true);
      setStatus("needs_captcha");
    }
  }, [isCacheValid, setStatus]);

  // When status becomes "needs_captcha", start the WebView timeout
  useEffect(() => {
    if (status !== "needs_captcha" || !showWebView) return;

    captchaTimeoutRef.current = setTimeout(() => {
      if (!hasReceivedDataRef.current) {
        onNeedsCaptcha?.();
      }
    }, 2000);

    return () => {
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    };
  }, [status, showWebView, onNeedsCaptcha]);

  // When fetch succeeds, clean up
  useEffect(() => {
    if (status === "success") {
      setShowWebView(false);
      hasReceivedDataRef.current = true;
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
      onSuccess?.();
    }
  }, [status, onSuccess]);

  // Trigger fetch on mount and app resume
  useEffect(() => {
    requestRefresh();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        requestRefresh();
      }
    });

    return () => subscription.remove();
  }, [requestRefresh]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === "DATA_RECEIVED" && !hasReceivedDataRef.current) {
          const beaches = JSON.parse(message.data);
          setBeaches(transformApiResponse(beaches));
        }
      } catch (error) {
        console.error("[BackgroundLoader] Error parsing message:", error);
      }
    },
    [setBeaches]
  );

  if (!showWebView || status === "success") {
    return null;
  }

  return (
    <View style={styles.offscreenContainer} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        onMessage={handleMessage}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={Platform.OS === "android"}
        originWhitelist={["https://*", "http://*"]}
        mixedContentMode="compatibility"
        cacheEnabled={true}
        incognito={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  offscreenContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    overflow: "hidden",
  },
  webview: {
    width: 400,
    height: 800,
  },
});
