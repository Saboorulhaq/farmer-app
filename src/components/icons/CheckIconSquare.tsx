import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

export default function CheckIcon({
  size = 15,
  color = "white",
  backgroundColor = "#099453",
}: {
  size?: number;
  color?: string;
  backgroundColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <Rect width={15} height={15} rx={3} fill={backgroundColor} />
      <Path
        d="M10.2789 5.17402L6.46774 8.5576L4.72148 7.00726C4.45943 6.77461 4.03177 6.77275 3.76973 7.00726C3.50559 7.24176 3.50559 7.61958 3.76973 7.85222L5.99187 9.82505C6.11765 9.93672 6.28955 10 6.46774 10C6.64593 10 6.81783 9.93672 6.94361 9.82505L11.2307 6.02084C11.4948 5.78634 11.4948 5.40852 11.2307 5.17588C10.9665 4.94137 10.541 4.94137 10.2789 5.17588V5.17402Z"
        fill={color}
      />
    </Svg>
  );
}
