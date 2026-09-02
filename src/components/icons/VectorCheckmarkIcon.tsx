import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function VectorCheckmarkIcon({
  size = 28,
  color = '#1D3A70',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={(size * 30) / 24} viewBox="0 0 24 30" fill="none">
      <Path
        d="M12 0L0 5.45455V13.6364C0 21.2045 5.12 28.2818 12 30C18.88 28.2818 24 21.2045 24 13.6364V5.45455L12 0ZM9.33333 21.8182L4 16.3636L5.88 14.4409L9.33333 17.9591L18.12 8.97273L20 10.9091L9.33333 21.8182Z"
        fill={color}
      />
    </Svg>
  );
}
