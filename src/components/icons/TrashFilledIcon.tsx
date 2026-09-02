import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function TrashFilledIcon({
  size = 14,
  color = '#F32735',
}: {
  size?: number;
  color?: string;
}) {
  const h = (size / 14) * 16;
  return (
    <Svg width={size} height={h} viewBox="0 0 14 16" fill="none">
      <Path
        d="M4.272 0.664L4 1.455H1C0.447 1.455 0 1.888 0 2.424C0 2.961 0.447 3.394 1 3.394H13C13.553 3.394 14 2.961 14 2.424C14 1.888 13.553 1.455 13 1.455H10L9.728 0.664C9.591 0.267 9.209 0 8.778 0H5.222C4.791 0 4.409 0.267 4.272 0.664ZM13 4.848H1L1.659 14.639C1.709 15.406 2.366 16 3.156 16H10.844C11.634 16 12.291 15.406 12.341 14.639L13 4.848Z"
        fill={color}
      />
    </Svg>
  );
}
