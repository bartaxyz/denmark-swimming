import { useMemo } from "react";
import { usePreferences } from "../state/usePreferences";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { useRouteData } from "../state/useRouteData";
import { useDenmarkBeachesData } from "./useDenmarkBeachesData";
import { useFetchRoute } from "./useFetchRoute";
import { useLocation } from "./useLocation";

export const useSelectedRoute = () => {
  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);
  const { beaches } = useDenmarkBeachesData();
  const { location } = useLocation();
  const transportationMode = usePreferences(
    (state) => state.transportationMode
  );

  const origin = useMemo(() => {
    if (!location) return;
    return [location.coords.longitude, location.coords.latitude];
  }, [location]);

  const destination: GeoJSON.Position | undefined = useMemo(() => {
    const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);
    if (!selectedBeach) return;
    return [selectedBeach.longitude, selectedBeach.latitude];
  }, [selectedBeachId]);

  // Triggers the fetch — onSuccess stores data in useRouteData
  useFetchRoute(origin, destination, transportationMode);

  // Read from the store
  const polylineCoordinates = useRouteData((s) => s.polylineCoordinates);
  const distance = useRouteData((s) => s.distance);
  const duration = useRouteData((s) => s.duration);

  return {
    polylineCoordinates,
    destination,
    distance,
    duration,
  };
};
