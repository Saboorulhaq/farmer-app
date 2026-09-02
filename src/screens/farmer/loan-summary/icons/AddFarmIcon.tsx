import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function AddFarmIcon() {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Circle cx="10.5" cy="10.5" r="10.5" fill="#099453" />
      <Path
        d="M10.5 6V15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M6 10.5H15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

