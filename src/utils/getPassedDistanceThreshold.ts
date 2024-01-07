export enum ThresholdType {
  Zoom = "zoom",
  Route = "route",
}

const distanceThresholds: Record<ThresholdType, number> = {
  zoom: 0.1,
  route: 0.2,
};

export const getPassedDistanceThreshold = (
  thresholdType: ThresholdType,
  origin?: GeoJSON.Position | null,
  destination?: GeoJSON.Position | null
) => {
  if (!origin || !destination) {
    return false;
  }

  const [originLongitude, originLatitude] = origin;
  const [destinationLongitude, destinationLatitude] = destination || [0, 0];

  const distance = Math.sqrt(
    Math.pow(destinationLatitude - originLatitude, 2) +
      Math.pow(destinationLongitude - originLongitude, 2)
  );

  return distance > distanceThresholds[thresholdType];
};
