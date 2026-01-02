import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { API_URL, WEBSITE_URL } from "../constants/api";
import { useBeachDataStore } from "../state/useBeachDataStore";
import { transformApiResponse } from "../utils/transformApiResponse";

type LoaderStatus = "idle" | "fetching" | "webview" | "needs_captcha" | "success";

interface BackgroundDataLoaderProps {
  onStatusChange?: (status: LoaderStatus) => void;
  onNeedsCaptcha?: () => void;
  onSuccess?: () => void;
}

const CAPTCHA_DETECTION_TIMEOUT_MS = 8000;

const INJECTED_JAVASCRIPT = `
  (function() {
    console.log('[BackgroundLoader] Injected JS starting...');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Injected JS initialized' }));

    function isBeachData(text) {
      try {
        const data = JSON.parse(text);
        const isValid = Array.isArray(data) && data.length > 0 &&
               data[0].id !== undefined && data[0].latitude !== undefined;
        return isValid;
      } catch (e) {
        return false;
      }
    }

    function checkForData() {
      const url = window.location.href;
      if (url.includes('badevand.dk/api/next/beaches') || url.includes('api/next/beaches')) {
        const bodyText = document.body.innerText || document.body.textContent;
        if (isBeachData(bodyText)) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DATA_RECEIVED',
            data: bodyText
          }));
        }
      }
    }

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0];
      const response = await originalFetch.apply(this, args);

      if (typeof url === 'string' && (url.includes('badevand.dk/api/next/beaches') || url.includes('api/next/beaches'))) {
        try {
          const clone = response.clone();
          const text = await clone.text();
          if (isBeachData(text)) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'DATA_RECEIVED',
              data: text
            }));
          }
        } catch (e) {}
      }
      return response;
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._url = url;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      const originalOnReadyStateChange = xhr.onreadystatechange;

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr._url && xhr._url.includes('api/next/beaches')) {
          try {
            if (xhr.status === 200 && isBeachData(xhr.responseText)) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DATA_RECEIVED',
                data: xhr.responseText
              }));
            }
          } catch (e) {}
        }
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments);
        }
      };

      return originalXHRSend.apply(this, args);
    };

    // Check periodically
    setInterval(checkForData, 2000);
    window.addEventListener('load', checkForData);

    // Check on URL changes
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(checkForData, 500);
      }
    }, 500);
  })();
  true;
`;

export const BackgroundDataLoader: FC<BackgroundDataLoaderProps> = ({
  onStatusChange,
  onNeedsCaptcha,
  onSuccess,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [status, setStatus] = useState<LoaderStatus>("idle");
  const [showWebView, setShowWebView] = useState(false);
  const captchaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasReceivedDataRef = useRef(false);

  const setBeaches = useBeachDataStore((state) => state.setBeaches);
  const isCacheValid = useBeachDataStore((state) => state.isCacheValid);

  const updateStatus = useCallback((newStatus: LoaderStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const handleDataReceived = useCallback((data: any[]) => {
    if (hasReceivedDataRef.current) return;
    hasReceivedDataRef.current = true;

    if (captchaTimeoutRef.current) {
      clearTimeout(captchaTimeoutRef.current);
    }

    const transformedData = transformApiResponse(data);
    setBeaches(transformedData);
    updateStatus("success");
    onSuccess?.();
  }, [setBeaches, updateStatus, onSuccess]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "LOG") {
        console.log("[BackgroundLoader]", message.message);
        return;
      }

      if (message.type === "DATA_RECEIVED") {
        const beaches = JSON.parse(message.data);
        handleDataReceived(beaches);
      }
    } catch (error) {
      console.error("[BackgroundLoader] Error parsing message:", error);
    }
  }, [handleDataReceived]);

  const triggerCaptchaNeeded = useCallback(() => {
    if (hasReceivedDataRef.current) return;
    updateStatus("needs_captcha");
    onNeedsCaptcha?.();
  }, [updateStatus, onNeedsCaptcha]);

  // Main effect: try to load data
  useEffect(() => {
    // Skip if cache is already valid
    if (isCacheValid()) {
      updateStatus("success");
      return;
    }

    const tryDirectFetch = async () => {
      updateStatus("fetching");

      try {
        const response = await fetch(API_URL, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].id !== undefined && data[0].beachName) {
            handleDataReceived(data);
            return;
          }
        }

        // Direct fetch failed, try WebView
        startWebViewFetch();
      } catch (error) {
        console.warn("[BackgroundLoader] Direct fetch failed:", error);
        startWebViewFetch();
      }
    };

    const startWebViewFetch = () => {
      updateStatus("webview");
      setShowWebView(true);

      // Start timeout for captcha detection
      captchaTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedDataRef.current) {
          triggerCaptchaNeeded();
        }
      }, CAPTCHA_DETECTION_TIMEOUT_MS);
    };

    tryDirectFetch();

    return () => {
      if (captchaTimeoutRef.current) {
        clearTimeout(captchaTimeoutRef.current);
      }
    };
  }, [isCacheValid, handleDataReceived, updateStatus, triggerCaptchaNeeded]);

  // Reload WebView (can be called externally via ref if needed)
  const reloadWebView = useCallback(() => {
    hasReceivedDataRef.current = false;
    webViewRef.current?.reload();

    // Reset timeout
    if (captchaTimeoutRef.current) {
      clearTimeout(captchaTimeoutRef.current);
    }
    captchaTimeoutRef.current = setTimeout(() => {
      if (!hasReceivedDataRef.current) {
        triggerCaptchaNeeded();
      }
    }, CAPTCHA_DETECTION_TIMEOUT_MS);
  }, [triggerCaptchaNeeded]);

  if (!showWebView || status === "success") {
    return null;
  }

  // Render WebView off-screen (zero size, but still active)
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
