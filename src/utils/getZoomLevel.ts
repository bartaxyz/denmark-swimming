export const getZoomLevel = (longitudeDelta: number) => {
  const angle = longitudeDelta;
  return Math.round(Math.log(360 / angle) / Math.LN2);
};
