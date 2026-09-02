import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface ShoppingBasketIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ShoppingBasketIcon({
  width = 24,
  height = 24,
  color = '#404040',
  style,
}: ShoppingBasketIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M5.757 5.757L4 4M4 4L3 12H21L20 4H4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 22C18.5523 22 19 21.5523 19 21C19 20.4477 18.5523 20 18 20C17.4477 20 17 20.4477 17 21C17 21.5523 17.4477 22 18 22Z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 12L5 17H20L21 12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
