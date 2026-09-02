import React from "react";
import Svg, { Rect, Circle, Path } from "react-native-svg";

export default function PersonalDetailIcon({
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
      <Rect
        x={0.5}
        y={0.5}
        width={29}
        height={29}
        rx={4.5}
        fill={bgFill}
        stroke={borderColor}
      />
      <Circle cx={14.1} cy={9.6} r={3.6} stroke={strokeColor} strokeWidth={1.5} />
      <Circle cx={19.4984} cy={18.6} r={3.6} stroke={strokeColor} strokeWidth={1.5} />
      <Path
        d="M18.2969 18.6003L19.047 19.5003L20.6969 17.8003"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.7984 16.1943C15.9646 16.0044 15.0532 15.8999 14.0984 15.8999C10.122 15.8999 6.89844 17.7131 6.89844 19.9499C6.89844 22.1867 6.89844 23.9999 14.0984 23.9999C19.2171 23.9999 20.6968 23.0834 21.1245 21.7499"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

