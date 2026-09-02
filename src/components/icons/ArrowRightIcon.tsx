import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowRightIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function ArrowRightIcon({ width = 16, height = 12, color = '#FFFFFF' }: ArrowRightIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 15.75 11.0459" fill="none">
      <Path
        d="M15.5303 6.0533C15.8232 5.76041 15.8232 5.28553 15.5303 4.99264L10.7574 0.21967C10.4645 -0.0732231 9.98959 -0.0732231 9.6967 0.21967C9.40381 0.512564 9.40381 0.987437 9.6967 1.28033L13.9393 5.52297L9.6967 9.76561C9.40381 10.0585 9.40381 10.5334 9.6967 10.8263C9.98959 11.1192 10.4645 11.1192 10.7574 10.8263L15.5303 6.0533ZM0 5.52297V6.27297H15V5.52297V4.77297H0V5.52297Z"
        fill={color}
      />
    </Svg>
  );
}
