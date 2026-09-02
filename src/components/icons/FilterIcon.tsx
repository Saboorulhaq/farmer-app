import React from 'react';
import Svg, { Path } from 'react-native-svg';

type FilterIconProps = {
  size?: number;
  color?: string;
};

export default function FilterIcon({ size = 20, color = '#101010' }: FilterIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
        stroke={color}
        strokeWidth={1.67}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
