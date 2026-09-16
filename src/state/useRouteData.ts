import { create } from "zustand";

interface Distance {
  text: string;
  value: number;
}

interface Duration {
  text: string;
  value: number;
}

interface RouteDataState {
  polylineCoordinates: { latitude: number; longitude: number }[] | undefined;
  destination: GeoJSON.Position | undefined;
  distance: Distance | undefined;
  duration: Duration | undefined;
  setRouteData: (data: {
    polylineCoordinates?: { latitude: number; longitude: number }[];
    destination?: GeoJSON.Position;
    distance?: Distance;
    duration?: Duration;
  }) => void;
  clearRouteData: () => void;
}

export const useRouteData = create<RouteDataState>((set) => ({
  polylineCoordinates: undefined,
  destination: undefined,
  distance: undefined,
  duration: undefined,
  setRouteData: (data) => set(data),
  clearRouteData: () =>
    set({
      polylineCoordinates: undefined,
      destination: undefined,
      distance: undefined,
      duration: undefined,
    }),
}));
