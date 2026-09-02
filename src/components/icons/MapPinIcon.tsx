import React from 'react';
import Svg, { Path } from 'react-native-svg';

type MapPinIconProps = {
  size?: number;
  color?: string;
};

export default function MapPinIcon({ size = 16, color = '#0B8A3D' }: MapPinIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 14C10.8 10.8 12.2667 8.66667 12.2667 6.93333C12.2667 5.80174 11.8171 4.7165 11.017 3.91634C10.2168 3.11619 9.13159 2.66667 8 2.66667C6.86841 2.66667 5.78317 3.11619 4.98301 3.91634C4.18286 4.7165 3.73333 5.80174 3.73333 6.93333C3.73333 8.66667 5.2 10.8 8 14Z"
        stroke={color}
        strokeWidth={1.06667}
        strokeLinejoin="round"
      />
      <Path
        d="M8 8.4C8.81002 8.4 9.46667 7.74335 9.46667 6.93333C9.46667 6.12332 8.81002 5.46667 8 5.46667C7.18998 5.46667 6.53333 6.12332 6.53333 6.93333C6.53333 7.74335 7.18998 8.4 8 8.4Z"
        stroke={color}
        strokeWidth={1.06667}
      />
    </Svg>
  );
}
