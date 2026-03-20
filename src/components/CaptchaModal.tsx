import { rgba } from "polished";
import { FC, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { WEBSITE_URL } from "../constants/api";
import { INJECTED_JAVASCRIPT } from "../constants/injectedJs";
import { useBeachDataStore } from "../state/useBeachDataStore";
import { usePalette } from "../theme/usePalette";
import { transformApiResponse } from "../utils/transformApiResponse";

interface CaptchaModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CaptchaModal: FC<CaptchaModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { foreground, background, isDark } = usePalette();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setBeaches = useBeachDataStore((state) => state.setBeaches);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "DATA_RECEIVED") {
        const beaches = JSON.parse(message.data);
        const transformedData = transformApiResponse(beaches);
        setBeaches(transformedData);
        onSuccess();
      }
    } catch (error) {
      console.error("[CaptchaModal] Error parsing message:", error);
    }
  }, [setBeaches, onSuccess]);

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  const buttonStyle = {
    backgroundColor: rgba(foreground, isDark ? 0.1 : 0.05),
    borderColor: rgba(foreground, isDark ? 0.2 : 0.15),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
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

          <WebView
            ref={webViewRef}
            source={{ uri: WEBSITE_URL }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onMessage={handleMessage}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={Platform.OS === "android"}
            originWhitelist={["https://*", "http://*"]}
            mixedContentMode="compatibility"
            allowsBackForwardNavigationGestures={true}
            cacheEnabled={true}
            incognito={false}
          />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              buttonStyle,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleReload}
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
    </Modal>
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
