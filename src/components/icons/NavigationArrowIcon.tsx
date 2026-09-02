import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function NavigationArrowIcon({
  width = 18,
  height = 18,
  color = '#010101',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path d="M17.9004 0.108806C17.7993 -0.00187635 17.639 -0.0304394 17.5065 0.0338275L0.201996 8.16716C0.0625555 8.23143 -0.0176226 8.38139 0.00329345 8.53848C0.0242095 8.69558 0.139247 8.81697 0.292632 8.84197L8.05247 10.1737L8.9414 17.6858C8.95883 17.8429 9.07735 17.9679 9.22725 17.9964C9.24817 17.9964 9.2656 18 9.28651 18C9.41898 18 9.54099 17.925 9.60026 17.8001L17.9632 0.515829C18.0294 0.380155 18.005 0.215917 17.9004 0.108806Z" fill={color} />
    </Svg>
  );
}
