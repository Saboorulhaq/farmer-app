import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

export default function CameraIcon() {
  return (
    <Svg width="26" height="24" viewBox="0 0 26 24" fill="none">
      <Path
        d="M3.66667 5H5C6.47276 5 7.66667 3.80609 7.66667 2.33333C7.66667 1.59695 8.26362 1 9 1H17C17.7364 1 18.3333 1.59695 18.3333 2.33333C18.3333 3.80609 19.5272 5 21 5H22.3333C23.8061 5 25 6.19391 25 7.66667V19.6667C25 21.1394 23.8061 22.3333 22.3333 22.3333H3.66667C2.19391 22.3333 1 21.1394 1 19.6667V7.66667C1 6.19391 2.19391 5 3.66667 5"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Circle
        cx="13"
        cy="13"
        r="4"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}
