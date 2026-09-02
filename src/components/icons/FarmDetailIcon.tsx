import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

export default function YieldGrowthIcon({
  size = 30,
  strokeColor = "#DDDDDD",
  bgFill = "white",
  borderColor = "#DDDDDD",
}: {
  size?: number;
  strokeColor?: string;
  bgFill?: string;
  borderColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect x={0.5} y={0.5} width={29} height={29} rx={4.5} fill={bgFill} stroke={borderColor} />
      <Path d="M15 12.6L18.6 9" stroke={strokeColor} strokeWidth={1.5} />
      <Path d="M15 17L20.2 11.8" stroke={strokeColor} strokeWidth={1.5} />
      <Path d="M15 21L21 15" stroke={strokeColor} strokeWidth={1.5} />
      <Path
        d="M15.0016 23C18.5362 23 21.4016 20.0833 21.4016 16.4854C21.4016 12.9156 19.3589 8.75007 16.1719 7.26044C15.8004 7.08681 15.401 7 15.0016 7M15.0016 23C11.4669 23 8.60156 20.0833 8.60156 16.4854C8.60156 12.9156 10.6442 8.75007 13.8312 7.26044C14.2027 7.08681 14.6021 7 15.0016 7M15.0016 23V7"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

