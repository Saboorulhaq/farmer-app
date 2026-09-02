import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function WarningTriangleIcon({
  size = 28,
  color = '#F32735',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        fill={color}
      />
      <Path d="M12 9v4" stroke="white" strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 17h.01" stroke="white" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
