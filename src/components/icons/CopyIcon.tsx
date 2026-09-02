import React from 'react';
import Svg, { Path } from 'react-native-svg';

type CopyIconProps = {
  size?: number;
  color?: string;
};

export default function CopyIcon({ size = 14, color = '#8A9691' }: CopyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M10.0333 5.01667H6.3C5.59123 5.01667 5.01667 5.59123 5.01667 6.3V10.0333C5.01667 10.7421 5.59123 11.3167 6.3 11.3167H10.0333C10.7421 11.3167 11.3167 10.7421 11.3167 10.0333V6.3C11.3167 5.59123 10.7421 5.01667 10.0333 5.01667Z"
        stroke={color}
        strokeWidth={0.933333}
      />
      <Path
        d="M8.98333 3.38333H3.96667C3.65725 3.38333 3.3605 3.50625 3.14171 3.72504C2.92292 3.94383 2.8 4.24058 2.8 4.55V9.56667"
        stroke={color}
        strokeWidth={0.933333}
        strokeLinecap="round"
      />
    </Svg>
  );
}
