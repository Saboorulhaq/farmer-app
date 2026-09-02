import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function LockFilledIcon({
  size = 14,
  color = '#F32735',
}: {
  size?: number;
  color?: string;
}) {
  const h = (size / 14) * 18;
  return (
    <Svg width={size} height={h} viewBox="0 0 14 18" fill="none">
      <Path
        d="M4.667 4.235V6.353H9.333V4.235C9.333 3.067 8.287 2.118 7 2.118C5.713 2.118 4.667 3.067 4.667 4.235ZM2.333 6.353V4.235C2.333 1.896 4.422 0 7 0C9.578 0 11.667 1.896 11.667 4.235V6.353C12.954 6.353 14 7.303 14 8.471V15.882C14 17.05 12.954 18 11.667 18H2.333C1.046 18 0 17.05 0 15.882V8.471C0 7.303 1.046 6.353 2.333 6.353Z"
        fill={color}
      />
    </Svg>
  );
}
