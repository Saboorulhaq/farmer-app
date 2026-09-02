import React from 'react';
import Svg, { Circle, Ellipse } from 'react-native-svg';

export default function ProfileIcon({
  width = 24,
  height = 24,
  color = '#2F2B3D',
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="4" fill={color} />
      <Circle cx="12" cy="6" r="4" fill={color} />
      <Ellipse cx="12" cy="17" rx="7" ry="4" fill={color} />
      <Ellipse cx="12" cy="17" rx="7" ry="4" fill={color} />
    </Svg>
  );
}
