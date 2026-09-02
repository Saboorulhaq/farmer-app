import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function PdfFileIcon({
  width = 16,
  height = 20,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 20" fill="none">
      {/* Document body */}
      <Path
        d="M1 2C1 1.44772 1.44772 1 2 1H10L15 6V18C15 18.5523 14.5523 19 14 19H2C1.44772 19 1 18.5523 1 18V2Z"
        fill="#FF3B2F"
      />
      {/* Folded corner triangle (dog-ear) */}
      <Path
        d="M10 1L15 6H11C10.4477 6 10 5.55228 10 5V1Z"
        fill="#FF8A80"
      />
      {/* "PDF" label area - white background band */}
      <Rect x="1" y="8" width="14" height="7" rx="0" fill="#CC1F14" />
      {/* PDF text lines (simplified white strokes) */}
      <Path d="M3.5 10.5H6M3.5 12.5H6" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <Path d="M7.5 10.5V12.5M7.5 10.5H9C9.55 10.5 9.55 11.5 9 11.5H7.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
