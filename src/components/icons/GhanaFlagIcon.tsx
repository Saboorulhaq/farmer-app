import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function GhanaFlagIcon({
  size = 17,
}: {
  size?: number;
}) {
  const h = (size / 16.875) * 11.25;
  return (
    <Svg width={size} height={h} viewBox="0 0 16.875 11.25" fill="none">
      <Path d="M0 0H16.875V11.25H0" fill="#006B3F" />
      <Path d="M0 0H16.875V7.5H0" fill="#FCD116" />
      <Path d="M0 0H16.875V3.75H0" fill="#CE1126" />
      <Path d="M8.437 3.75L9.656 7.5L6.466 5.182H10.409L7.219 7.5" fill="black" />
    </Svg>
  );
}
