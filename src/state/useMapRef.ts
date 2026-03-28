import { create } from "zustand";
import MapView from "react-native-maps";

interface MapRefState {
  mapView: MapView | null;
  setMapView: (ref: MapView | null) => void;
}

export const useMapRef = create<MapRefState>((set) => ({
  mapView: null,
  setMapView: (mapView) => set({ mapView }),
}));
