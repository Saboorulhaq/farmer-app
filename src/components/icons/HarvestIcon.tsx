import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HarvestIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function HarvestIcon({
  width = 32,
  height = 32,
  color = '#E6A817',
}: HarvestIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <G>
        {/* Wheat stalk left */}
        <Path
          d="M10 28L12 16C12 16 10 14 8 14C6 14 4 16 4 18C4 20 6 22 8 20L10 28Z"
          fill={color}
        />
        {/* Wheat stalk middle */}
        <Path
          d="M16 28L16 12C16 12 14 10 12 10C10 10 8 12 8 14C8 16 10 18 12 16L14 24"
          fill={color}
        />
        <Path
          d="M16 28L16 12C16 12 18 10 20 10C22 10 24 12 24 14C24 16 22 18 20 16L18 24"
          fill={color}
        />
        {/* Wheat stalk right */}
        <Path
          d="M22 28L20 16C20 16 22 14 24 14C26 14 28 16 28 18C28 20 26 22 24 20L22 28Z"
          fill={color}
        />
        {/* Grains left */}
        <Path
          d="M8 4C9.5 4 11 5.5 11 7C11 8.5 9.5 10 8 10C6.5 10 5 8.5 5 7C5 5.5 6.5 4 8 4Z"
          fill={color}
        />
        {/* Grains middle */}
        <Path
          d="M16 2C17.5 2 19 3.5 19 5C19 6.5 17.5 8 16 8C14.5 8 13 6.5 13 5C13 3.5 14.5 2 16 2Z"
          fill={color}
        />
        {/* Grains right */}
        <Path
          d="M24 4C25.5 4 27 5.5 27 7C27 8.5 25.5 10 24 10C22.5 10 21 8.5 21 7C21 5.5 22.5 4 24 4Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}
