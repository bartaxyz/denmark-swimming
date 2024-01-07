import Polyline from "@mapbox/polyline";
import { useMemo } from "react";
import { usePreferences } from "../state/usePreferences";
import { useSelectedBeach } from "../state/useSelectedBeach";
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
    if (!location) {
      return;
    }

    return [location.coords.longitude, location.coords.latitude];
  }, [location]);

  const destination: GeoJSON.Position | undefined = useMemo(() => {
    const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);

    if (!selectedBeach) {
      return;
    }

    return [selectedBeach.longitude, selectedBeach.latitude];
  }, [selectedBeachId]);

  const { routeData } = useFetchRoute(origin, destination, transportationMode);

  const route = routeData?.routes[0];

  const coordinates = useMemo(() => {
    if (!route?.overview_polyline.points) {
      return;
    }

    let points = Polyline.decode(route.overview_polyline.points);

    let coords = points.map((point, index) => {
      return {
        latitude: point[0],
        longitude: point[1],
      };
    });

    return coords;
  }, [routeData]);

  return {
    polylineCoordinates: coordinates,
    distance: route?.legs[0].distance,
    duration: route?.legs[0].duration,
  };
};
