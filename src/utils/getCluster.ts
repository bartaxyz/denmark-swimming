import { Region } from "react-native-maps";
import Supercluster from "supercluster";
import { Beaches } from "../../types";
import { getZoomLevel } from "./getZoomLevel";
import { Platform } from "react-native";

export const getCluster = (
  beaches?: Beaches,
  region?: Region,
  performanceMode?: boolean
) => {
  if (!beaches || beaches.length === 0 || !region) {
    return {
      markers: [],
      cluster: null,
    };
  }

  const cluster = new Supercluster({
    radius: performanceMode ? 0 : 32,
    maxZoom: 16,
  });

  let markers: ReturnType<typeof cluster.getClusters> = [];

  try {
    const padding = 0;

    cluster.load(
      beaches.map((beach) => ({
        type: "Feature",
        properties: { beach },
        geometry: {
          type: "Point",
          coordinates: [beach.longitude, beach.latitude],
        },
      }))
    );

    markers = cluster.getClusters(
      [
        region.longitude - region.longitudeDelta * (0.5 + padding),
        region.latitude - region.latitudeDelta * (0.5 + padding),
        region.longitude + region.longitudeDelta * (0.5 + padding),
        region.latitude + region.latitudeDelta * (0.5 + padding),
      ],
      getZoomLevel(region.longitudeDelta)
    );
  } catch (e) {
    console.debug("failed to create cluster", e);
  }

  return {
    markers,
    cluster,
  };
};
