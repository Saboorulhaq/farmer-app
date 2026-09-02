import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ClipboardCheckIcon({
  size = 20,
  color = '#099453',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 20 22" fill="none">
      <Path
        d="M14 3.002C16.175 3.014 17.353 3.111 18.121 3.879C19 4.758 19 6.172 19 9V15C19 17.829 19 19.243 18.121 20.121C17.242 21 15.828 21 13 21H7C4.172 21 2.757 21 1.879 20.121C1 19.243 1 17.829 1 15V9C1 6.172 1 4.758 1.879 3.879C2.647 3.111 3.825 3.014 6 3.002"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M8.5 13L15 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 13H5.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 9.5H5.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 16.5H5.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8.5 9.5H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8.5 16.5H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M6 2.5C6 1.672 6.672 1 7.5 1H12.5C13.329 1 14 1.672 14 2.5V3.5C14 4.328 13.329 5 12.5 5H7.5C6.672 5 6 4.328 6 3.5V2.5Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
