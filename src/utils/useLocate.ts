import { Alert, Linking } from "react-native";
import { useLocation } from "./useLocation";

export function useLocate() {
  const { location, status, retryRequestPermissions } = useLocation();

  const locate = () => {
    if (!location) {
      retryRequestPermissions();

      if (status === "denied") {
        Alert.alert(
          "Enable location permissions",
          "Please enable location permissions in your settings to use this feature",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open settings", onPress: Linking.openSettings },
          ],
        );
      }
    }

  };

  return locate;
}
