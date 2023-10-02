import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export const ArrowLeft = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 12H5M5 12L12 19M5 12L12 5"
    />
  </Svg>
);
