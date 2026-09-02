import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

type CreditCardIconProps = {
  width?: number;
  height?: number;
};

export default function CreditCardIcon({ width = 34, height = 23 }: CreditCardIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 34 23" fill="none">
      <Rect width={34} height={23} rx={4} fill="#2196F3" />
      <Rect x={3} y={6} width={10} height={7} rx={1} fill="#FFC107" opacity={0.8} />
      <Path
        d="M3 14H31"
        stroke="#1976D2"
        strokeWidth={2}
      />
      <Circle cx={25} cy={11} r={4} fill="#1E88E5" opacity={0.6} />
      <Circle cx={29} cy={11} r={4} fill="#42A5F5" opacity={0.4} />
    </Svg>
  );
}
