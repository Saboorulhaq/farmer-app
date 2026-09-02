import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PersonIconProps {
  size?: number;
  color?: string;
}

export default function PersonIcon({ size = 18, color = '#606060' }: PersonIconProps) {
  const w = (15 / 18) * size;
  return (
    <Svg width={w} height={size} viewBox="0 0 15 18" fill="none">
      <Path
        d="M7.5 8.57143C9.89063 8.57143 11.8269 6.65357 11.8269 4.28571C11.8269 1.91786 9.89063 0 7.5 0C5.10937 0 3.17308 1.91786 3.17308 4.28571C3.17308 6.65357 5.10937 8.57143 7.5 8.57143ZM6.42909 10.5714C2.8774 10.5714 0 13.4214 0 16.9393C0 17.525 0.479567 18 1.07091 18H13.9291C14.5204 18 15 17.525 15 16.9393C15 13.4214 12.1226 10.5714 8.57091 10.5714H6.42909Z"
        fill={color}
      />
    </Svg>
  );
}
