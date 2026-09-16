import { Dimensions } from "react-native";
import { Camera } from "react-native-maps";

const { height: screenHeight } = Dimensions.get("window");

/**
 * Calculates a latitude offset to center a point in the visible area above the sheet.
 */
export function getSheetLatitudeOffset(
  camera: Camera,
  sheetFraction: number,
  latitude: number,
): number {
  const sheetHeightPixels = sheetFraction * screenHeight;

  let metersPerPixel: number;
  if (camera.zoom != null) {
    metersPerPixel =
      (156543.03392 * Math.cos((latitude * Math.PI) / 180)) /
      Math.pow(2, camera.zoom);
  } else if (camera.altitude != null) {
    metersPerPixel = camera.altitude / screenHeight;
  } else {
    return 0;
  }

  return ((sheetHeightPixels / 2) * metersPerPixel) / 111320;
}
