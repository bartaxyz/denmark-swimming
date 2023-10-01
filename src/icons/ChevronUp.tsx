import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export const ChevronUp = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 15L12 9L6 15"
    />
  </Svg>
);
