import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function ClipboardIcon({
  size = 28,
  backgroundColor = '#1D3A70',
  strokeColor = 'white',
}: {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Rect width="25" height="25" rx="5" fill={backgroundColor} />
      <Path
        d="M15.4 5.60156C17.1401 5.61125 18.0824 5.68841 18.6971 6.30312C19.4 7.00606 19.4 8.13744 19.4 10.4002V15.2002C19.4 17.4629 19.4 18.5943 18.6971 19.2973C17.9941 20.0002 16.8628 20.0002 14.6 20.0002H9.80001C7.53726 20.0002 6.40589 20.0002 5.70295 19.2973C5 18.5943 5 17.4629 5 15.2002V10.4002C5 8.13744 5 7.00606 5.70295 6.30312C6.31765 5.68841 7.25999 5.61125 9.00001 5.60156"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Path
        d="M11 13.5996L16.2 13.5996"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8.19922 13.5996H8.59922"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8.19922 10.8008H8.59922"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8.19922 16.4004H8.59922"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M11 10.8008H16.2"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M11 16.4004H16.2"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M9 5.2C9 4.53726 9.53726 4 10.2 4H14.2C14.8628 4 15.4 4.53726 15.4 5.2V6.00001C15.4 6.66275 14.8628 7.20001 14.2 7.20001H10.2C9.53726 7.20001 9 6.66275 9 6.00001V5.2Z"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </Svg>
  );
}
