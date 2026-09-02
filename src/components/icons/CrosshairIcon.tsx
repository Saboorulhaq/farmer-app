import React from 'react';
import Svg, { Path } from 'react-native-svg';

type CrosshairIconProps = {
  size?: number;
  color?: string;
};

export default function CrosshairIcon({ size = 16, color = '#14201A' }: CrosshairIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2.26667V4.26667M8 11.7333V13.7333M2.26667 8H4.26667M11.7333 8H13.7333"
        stroke={color}
        strokeWidth={1.125}
        strokeLinecap="round"
      />
      <Path
        d="M8 10.8C9.5464 10.8 10.8 9.5464 10.8 8C10.8 6.4536 9.5464 5.2 8 5.2C6.4536 5.2 5.2 6.4536 5.2 8C5.2 9.5464 6.4536 10.8 8 10.8Z"
        stroke={color}
        strokeWidth={1.125}
      />
    </Svg>
  );
}
