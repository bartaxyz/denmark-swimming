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

  const setBeaches = useBeachDataStore((state) => state.setBeaches);
  const isCacheValid = useBeachDataStore((state) => state.isCacheValid);

  const startWebViewFetch = useCallback(() => {
    setShowWebView(true);

    if (captchaTimeoutRef.current) {
      clearTimeout(captchaTimeoutRef.current);
    }

    captchaTimeoutRef.current = setTimeout(() => {
      onNeedsCaptcha?.();
    }, 2000);
  }, [onNeedsCaptcha]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === "DATA_RECEIVED") {
          const beaches = JSON.parse(message.data);
          setBeaches(transformApiResponse(beaches));
          setShowWebView(false);

          if (captchaTimeoutRef.current) {
            clearTimeout(captchaTimeoutRef.current);
          }

          onSuccess?.();
        }
      } catch (error) {
        console.error("[BackgroundLoader] Error parsing message:", error);
      }
    },
    [setBeaches, onSuccess]
  );

  // Refresh on mount and when app returns to foreground
  useEffect(() => {
    if (!isCacheValid()) {
      startWebViewFetch();
    }

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !isCacheValid()) {
        startWebViewFetch();
      }
    });

    return () => {
      subscription.remove();
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    };
  }, [isCacheValid, startWebViewFetch]);

  if (!showWebView) {
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
