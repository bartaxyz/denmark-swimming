import { Alert, Linking } from "react-native";
import { PROVIDER_GOOGLE } from "react-native-maps";
import { LOCATE_ALTITUDE, LOCATE_ZOOM } from "../constants/map";
import { useMapActions } from "../state/useMapActions";
import { useMapRef } from "../state/useMapRef";
import { usePreferences } from "../state/usePreferences";
import { useLocation } from "./useLocation";

export function useLocate() {
  const { location, status, retryRequestPermissions } = useLocation();
  const mapsProvider = usePreferences((state) => state.mapsProvider);

  const locate = async () => {
    const currentLocation = location || (await retryRequestPermissions());

    if (!currentLocation) {
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
      return;
    }

    useMapActions.getState().markUserMoved();
    useMapRef.getState().mapView?.animateCamera({
      center: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      },
      heading: 0,
      pitch: 0,
      ...(mapsProvider === PROVIDER_GOOGLE
        ? { zoom: LOCATE_ZOOM }
        : { altitude: LOCATE_ALTITUDE }),
    });
  };

  return locate;
}
