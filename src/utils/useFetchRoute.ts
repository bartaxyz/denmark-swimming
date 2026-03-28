import Polyline from "@mapbox/polyline";
import useSWR, { Fetcher } from "swr";
import env from "../env";
import { TransportationMode } from "../state/usePreferences";
import { useMapActions } from "../state/useMapActions";
import { useRouteData } from "../state/useRouteData";
import {
  ThresholdType,
  getPassedDistanceThreshold,
} from "./getPassedDistanceThreshold";

interface Distance {
  text: string;
  value: number;
}
interface Duration {
  text: string;
  value: number;
}

interface ResponseLegs {
  distance: Distance;
  duration: Duration;
  end_address: string;
  end_location: object;
  start_address: string;
  start_location: object;
  steps: any[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

interface Response {
  geocoded_waypoints: any;
  status: "OK" | string;
  routes: {
    overview_polyline: {
      points: string;
    };
    legs: ResponseLegs[];
  }[];
}

const denmarkBeachesFetcher: Fetcher<Response, string> = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

export const useFetchRoute = (
  origin?: GeoJSON.Position,
  destination?: GeoJSON.Position,
  transportationMode?: TransportationMode
) => {
  const hasPassedDistanceThreshold = getPassedDistanceThreshold(
    ThresholdType.Route,
    origin,
    destination
  );

  const shouldFetch = origin && destination && !hasPassedDistanceThreshold;
  const key = shouldFetch
    ? `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&key=${env.googleMapsApiKey}&mode=${transportationMode}`
    : null;

  const { setRouteData, clearRouteData } = useRouteData();

  const { data: routeData, ...args } = useSWR<Response>(
    key,
    denmarkBeachesFetcher,
    {
      onSuccess: (data) => {
        const route = data?.routes[0];
        if (!route?.overview_polyline.points) {
          clearRouteData();
          return;
        }

        const points = Polyline.decode(route.overview_polyline.points);
        const coords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        // Only recenter when the route actually changed
        const prevCoords = useRouteData.getState().polylineCoordinates;
        const changed =
          !prevCoords || prevCoords.length !== coords.length;

        setRouteData({
          polylineCoordinates: coords,
          destination,
          distance: route.legs[0].distance,
          duration: route.legs[0].duration,
        });

        if (changed) {
          useMapActions.getState().recenter();
        }
      },
    }
  );

  return { routeData, ...args };
};
