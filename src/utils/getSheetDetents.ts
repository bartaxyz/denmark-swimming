import { useWindowDimensions } from "react-native";
import { HEADER_HEIGHT } from "../components/BeachDetailHeader";

export const getSheetDetents = (): [number, number, number] => {
  const { height: windowHeight } = useWindowDimensions();

  return [HEADER_HEIGHT / windowHeight, 0.6, 1];
};
