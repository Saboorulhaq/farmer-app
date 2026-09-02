import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

export default function DocumentsIcon({
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
      <Path
        d="M18.4 8.60156C20.1401 8.61125 21.0824 8.68841 21.6971 9.30312C22.4 10.0061 22.4 11.1374 22.4 13.4002V18.2002C22.4 20.4629 22.4 21.5943 21.6971 22.2973C20.9941 23.0002 19.8628 23.0002 17.6 23.0002H12.8C10.5373 23.0002 9.40589 23.0002 8.70295 22.2973C8 21.5943 8 20.4629 8 18.2002V13.4002C8 11.1374 8 10.0061 8.70295 9.30312C9.31765 8.68841 10.26 8.61125 12 8.60156"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      <Path d="M14 16.6001H19.2" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M11.1992 16.6001H11.5992" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M11.1992 13.8H11.5992" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M11.1992 19.4001H11.5992" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 13.7998H19.2" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 19.3999H19.2" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path
        d="M12 8.2C12 7.53726 12.5373 7 13.2 7H17.2C17.8628 7 18.4 7.53726 18.4 8.2V9.00001C18.4 9.66275 17.8628 10.2 17.2 10.2H13.2C12.5373 10.2 12 9.66275 12 9.00001V8.2Z"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

