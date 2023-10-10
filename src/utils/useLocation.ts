import * as Location from "expo-location";
import { useEffect, useState } from "react";

export const useLocation = (options: { autoRequest?: boolean } = {}) => {
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const requestPermissions = async () => {
    let { status: locationStatus } =
      await Location.requestForegroundPermissionsAsync();

    setStatus(locationStatus);

    if (locationStatus !== "granted") {
      return false;
    }

    let location = await Location.getCurrentPositionAsync({});

    setLocation(location);

    return location;
  };

  useEffect(() => {
    if (!options.autoRequest) {
      return;
    }

    (async () => {
      await requestPermissions();
    })();
  }, []);

  return {
    location,
    status,
    retryRequestPermissions: requestPermissions,
  };
};
