import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

export default function LoanRequestIcon({
  size = 30,
  color = "white",
  bgColor = "#1D3A70",
}: {
  size?: number;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect width="30" height="30" rx="5" fill={bgColor} />
      <Path
        d="M10 12H13"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.125 12.75H19.1731C17.8348 12.75 16.75 13.7574 16.75 15C16.75 16.2426 17.8348 17.25 19.1731 17.25H21.125C21.1875 17.25 21.2187 17.25 21.2451 17.2484C21.6496 17.2238 21.9718 16.9246 21.9983 16.5491C22 16.5246 22 16.4955 22 16.4375V13.5625C22 13.5045 22 13.4754 21.9983 13.4509C21.9718 13.0754 21.6496 12.7762 21.2451 12.7516C21.2187 12.75 21.1875 12.75 21.125 12.75Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M21.2238 12.75C21.1655 11.3458 20.9775 10.4848 20.3713 9.87868C19.4926 9 18.0784 9 15.25 9L13 9C10.1716 9 8.75736 9 7.87868 9.87868C7 10.7574 7 12.1716 7 15C7 17.8284 7 19.2426 7.87868 20.1213C8.75736 21 10.1716 21 13 21H15.25C18.0784 21 19.4926 21 20.3713 20.1213C20.9775 19.5152 21.1655 18.6542 21.2238 17.25"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M18.9922 15H18.999"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

