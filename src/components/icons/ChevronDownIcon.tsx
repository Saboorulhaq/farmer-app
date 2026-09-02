import React from 'react';
import Svg, { Path } from 'react-native-svg';

type ChevronDownIconProps = {
  size?: number;
  color?: string;
};

export default function ChevronDownIcon({ size = 24, color = '#444' }: ChevronDownIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
