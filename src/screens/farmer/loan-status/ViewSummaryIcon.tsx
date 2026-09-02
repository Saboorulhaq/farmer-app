import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ViewSummaryIcon({
  width = 20,
  height = 20,
  color = '#101010',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 23 25" fill="none">
      <Path
        d="M15.9168 3.08594C18.4543 3.10006 19.8285 3.21259 20.725 4.10907C21.7501 5.13424 21.7501 6.78422 21.7501 10.0842V17.0844C21.7501 20.3844 21.7501 22.0344 20.725 23.0595C19.6999 24.0847 18.0499 24.0847 14.7501 24.0847H7.75004C4.45019 24.0847 2.80027 24.0847 1.77513 23.0595C0.750001 22.0344 0.750001 20.3844 0.750001 17.0844V10.0842C0.750001 6.78422 0.750001 5.13424 1.77513 4.10907C2.67159 3.21259 4.04582 3.10006 6.58337 3.08594"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path d="M9.5 14.75L17.0834 14.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.41553 14.75H5.99886" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.41553 10.668H5.99886" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.41553 18.8359H5.99886" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M9.5 10.668H17.0834" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M9.5 18.8359H17.0834" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path
        d="M6.5835 2.50007C6.5835 1.53353 7.367 0.75 8.33351 0.75H14.1669C15.1334 0.75 15.9169 1.53353 15.9169 2.50007V3.66678C15.9169 4.63331 15.1334 5.41684 14.1669 5.41684H8.33351C7.367 5.41684 6.5835 4.63331 6.5835 3.66678V2.50007Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}
