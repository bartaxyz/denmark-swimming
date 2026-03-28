import { Alert, Linking } from "react-native";
import { useMapActions } from "../state/useMapActions";
import { useLocation } from "./useLocation";

export function useLocate() {
  const { location, status, retryRequestPermissions } = useLocation();

  const locate = () => {
    if (!location) {
      retryRequestPermissions()
        .then((newLocation) => {
          if (newLocation) {
            useMapActions.getState().recenter();
          }
        })
        .catch(() => {
          console.error(
            "Error requesting location permissions or getting location",
          );
        });

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

    useMapActions.getState().recenter();
  };

  return locate;
}
