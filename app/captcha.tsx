import { rgba } from "polished";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaptchaWebView } from "../src/components/CaptchaWebView";
import { useBeachDataStore } from "../src/state/useBeachDataStore";
import { usePalette } from "../src/theme/usePalette";
import { transformApiResponse } from "../src/utils/transformApiResponse";

const API_URL = "https://badevand.dk/api/next/beaches";

export default function CaptchaScreen() {
  const { background, foreground, isDark } = usePalette();
  const insets = useSafeAreaInsets();
  const setBeaches = useBeachDataStore((state) => state.setBeaches);
  const [needsCaptcha, setNeedsCaptcha] = useState<boolean | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Try direct fetch first
  useEffect(() => {
    const tryDirectFetch = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].id !== undefined) {
            // Transform the API response to match expected types
            const transformedData = transformApiResponse(data);
            setBeaches(transformedData);
            router.replace("/");
            return;
          }
        }

        // If we get here, we need the captcha
        setNeedsCaptcha(true);
      } catch (error) {
        console.warn("Direct fetch failed, trying WebView:", error);
        setFetchError(String(error));
        setNeedsCaptcha(true);
      }
    };

    tryDirectFetch();
  }, [setBeaches]);

  const handleDataReceived = useCallback(
    (data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        console.log("[Captcha] Received", data.length, "beaches from API");

        // Transform the API response to match expected types
        const transformedData = transformApiResponse(data);

        console.log("[Captcha] Transformed data. First beach:", transformedData[0]?.name);
        console.log("[Captcha] First beach water_quality:", transformedData[0]?.data?.[0]?.water_quality);

        setBeaches(transformedData);
        router.replace("/");
      }
    },
    [setBeaches]
  );

  const handleError = useCallback((error: string) => {
    console.error("Captcha webview error:", error);
  }, []);

  // Still checking if we need captcha
  if (needsCaptcha === null) {
    return (
      <View style={[styles.container, { backgroundColor: background, paddingTop: insets.top }]}>
        <View style={styles.loadingContent}>
          <Text style={[styles.loadingTitle, { color: foreground }]}>
            Denmark Swimming
          </Text>
          <Text style={[styles.loadingSubtitle, { color: rgba(foreground, 0.6) }]}>
            Loading beach data...
          </Text>
          <View style={[styles.loadingIndicator, { backgroundColor: rgba(foreground, isDark ? 0.1 : 0.05) }]}>
            <ActivityIndicator size="small" color={foreground} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <CaptchaWebView
      onDataReceived={handleDataReceived}
      onError={handleError}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  loadingIndicator: {
    padding: 16,
    borderRadius: 16,
  },
});
