import useSWR, { Fetcher } from "swr";
import env from "../env";
import { TransportationMode } from "../state/usePreferences";
import {
  ThresholdType,
  getPassedDistanceThreshold,
} from "./getPassedDistanceThreshold";

interface Distance {
  text: string;
  value: 44390;
}
interface Duration {
  text: string;
  value: 2423;
}

interface ResponseLegs {
  distance: Distance;
  duration: Duration;
  end_address: "Strandalleen 2, 3000 Helsingør, Denmark";
  end_location: object;
  start_address: "Rådmandsgade 53B, 2200 København, Denmark";
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
  /**
   * Avoid fetching long routes. They're not practical for the user anyway.
   */
  const hasPassedDistanceThreshold = getPassedDistanceThreshold(
    ThresholdType.Route,
    origin,
    destination
  );

  const shouldFetch = origin && destination && !hasPassedDistanceThreshold;
  const key = shouldFetch
    ? `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&key=${env.googleMapsApiKey}&mode=${transportationMode}`
    : null;

  const { data: routeData, ...args } = useSWR<Response>(
    key,
    denmarkBeachesFetcher
  );

  return { routeData, ...args };
};
