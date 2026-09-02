import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

export default function PakistanFlagIcon({
  size = 17,
}: {
  size?: number;
}) {
  const h = (size / 16.875) * 11.25;
  return (
    <Svg width={size} height={h} viewBox="0 0 16.875 11.25" fill="none">
      {/* Green field */}
      <Rect width="16.875" height="11.25" fill="#01411C" />
      {/* White hoist stripe */}
      <Rect width="4.22" height="11.25" fill="#FFFFFF" />
      {/* Crescent (white circle carved by an offset green circle) */}
      <Circle cx="10.9" cy="5.9" r="2.55" fill="#FFFFFF" />
      <Circle cx="11.75" cy="5.35" r="2.25" fill="#01411C" />
      {/* Five-point star */}
      <Path
        d="M12.75 4.15L13.19 5.02L14.15 5.16L13.45 5.84L13.62 6.8L12.75 6.35L11.88 6.8L12.05 5.84L11.35 5.16L12.31 5.02Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}
