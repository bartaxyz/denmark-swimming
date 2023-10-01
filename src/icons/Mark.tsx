import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

export const Mark = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 12a8 8 0 0 1-8 8m8-8a8 8 0 0 0-8-8m8 8h2m-10 8a8 8 0 0 1-8-8m8 8v2M4 12a8 8 0 0 1 8-8m-8 8H2m10-8V2m3 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </Svg>
);
