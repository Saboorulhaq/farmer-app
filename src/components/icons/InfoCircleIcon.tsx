import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface InfoCircleIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function InfoCircleIcon({
  width = 14,
  height = 14,
  color = '#099453',
}: InfoCircleIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6.5" stroke={color} strokeWidth="1" fill="none" />
      <Path
        d="M7 6V10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="7" cy="4" r="0.75" fill={color} />
    </Svg>
  );
}
