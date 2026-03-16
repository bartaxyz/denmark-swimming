import { rgba } from "polished";
import { FC, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Beaches } from "../../types";
import { WEBSITE_URL } from "../constants/api";
import { INJECTED_JAVASCRIPT } from "../constants/injectedJs";
import { usePalette } from "../theme/usePalette";

interface CaptchaWebViewProps {
  onDataReceived: (data: Beaches) => void;
  onError: (error: string) => void;
}

export const CaptchaWebView: FC<CaptchaWebViewProps> = ({
  onDataReceived,
  onError,
}) => {
  const { foreground, background, isDark } = usePalette();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        // Log all messages from WebView
        if (message.type === "LOG") {
          console.log("[WebView LOG]", message.message);
          return;
        }

        console.log("[WebView] Received message type:", message.type);

        if (message.type === "DATA_RECEIVED") {
          console.log("[WebView] DATA_RECEIVED, data length:", message.data?.length);
          const beaches: Beaches = JSON.parse(message.data);
          console.log("[WebView] Parsed beaches count:", beaches?.length);
          // Log first beach structure to understand the data
          if (beaches?.length > 0) {
            console.log("[WebView] First beach sample:", JSON.stringify(beaches[0], null, 2));
            if (beaches[0].data?.length > 0) {
              console.log("[WebView] First beach data[0]:", JSON.stringify(beaches[0].data[0], null, 2));
            }
          }
          onDataReceived(beaches);
        }
      } catch (error) {
        console.error("[WebView] Error parsing message:", error, "Raw data:", event.nativeEvent.data?.substring(0, 200));
      }
    },
    [onDataReceived]
  );

  const handleNavigateToApi = () => {
    console.log("[WebView] Fetch button pressed - reloading page to trigger API call");
    webViewRef.current?.injectJavaScript(`
      console.log('[CaptchaWebView] Reloading page to trigger API...');
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Reloading page to get fresh data...' }));
      window.location.reload();
      true;
    `);
  };

  const handleNavigationStateChange = (navState: any) => {
    console.log("[WebView] Navigation state changed:", {
      url: navState.url,
      loading: navState.loading,
      title: navState.title,
    });
  };

  const handleRetry = () => {
    setLoadError(null);
    webViewRef.current?.reload();
  };

  const buttonStyle = {
    backgroundColor: rgba(foreground, isDark ? 0.1 : 0.05),
    borderColor: rgba(foreground, isDark ? 0.2 : 0.15),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: foreground }]}>
          Verification Required
        </Text>
        <Text style={[styles.subtitle, { color: rgba(foreground, 0.6) }]}>
          Complete the verification below, then tap "Load Beach Data"
        </Text>
      </View>

      <View style={[styles.webviewContainer, { borderColor: rgba(foreground, isDark ? 0.15 : 0.1) }]}>
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: rgba(background, 0.8) }]}>
            <ActivityIndicator size="large" color={foreground} />
          </View>
        )}

        {loadError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: foreground }]}>
              {loadError}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                buttonStyle,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleRetry}
            >
              <Text style={[styles.buttonText, { color: foreground }]}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: WEBSITE_URL }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(e) => {
              // Ignore TLS errors and let the webview continue
              const errorDesc = e.nativeEvent.description || "";
              if (errorDesc.toLowerCase().includes("tls") ||
                  errorDesc.toLowerCase().includes("ssl") ||
                  errorDesc.toLowerCase().includes("certificate") ||
                  errorDesc.toLowerCase().includes("secure connection")) {
                console.warn("Captcha webview TLS warning:", errorDesc);
                return;
              }
              setLoadError(errorDesc || "Failed to load page");
              onError(errorDesc || "WebView error");
            }}
            onHttpError={(e) => {
              console.warn("HTTP error:", e.nativeEvent.statusCode);
            }}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={Platform.OS === "android"}
            originWhitelist={["https://*", "http://*"]}
            mixedContentMode="compatibility"
            allowsBackForwardNavigationGestures={true}
            allowsInlineMediaPlayback={true}
            allowsLinkPreview={false}
            contentMode="mobile"
            cacheEnabled={true}
            incognito={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            buttonStyle,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleNavigateToApi}
        >
          <Text style={[styles.buttonText, { color: foreground }]}>
            Load Beach Data
          </Text>
        </Pressable>
        <Text style={[styles.footerHint, { color: rgba(foreground, 0.5) }]}>
          Complete the captcha first if prompted
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  webviewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  footerHint: {
    fontSize: 12,
    marginTop: 10,
  },
});
