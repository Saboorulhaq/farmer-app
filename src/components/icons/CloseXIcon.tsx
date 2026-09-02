import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CloseXIconProps {
  size?: number;
  color?: string;
}

export default function CloseXIcon({ size = 10, color = '#101010' }: CloseXIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 9.39024 9.39024" fill="none">
      <Path
        d="M5.75801 4.70188L9.37351 9.39024H7.23099L4.60306 5.98544L2.14252 9.39024H0.0167385L3.63223 4.70188L0 0H2.14252L4.78718 3.43183L7.26447 0H9.39024L5.75801 4.70188Z"
        fill={color}
      />
    </Svg>
  );
}
