import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function RightArrowIcon({
  size = 12,
  color = '#099453',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M11.5303 6.05377C11.8232 5.76087 11.8232 5.286 11.5303 4.99311L6.75736 0.220137C6.46447 -0.0727568 5.98959 -0.0727568 5.6967 0.220137C5.40381 0.51303 5.40381 0.987904 5.6967 1.2808L9.93934 5.52344L5.6967 9.76608C5.40381 10.059 5.40381 10.5338 5.6967 10.8267C5.98959 11.1196 6.46447 11.1196 6.75736 10.8267L11.5303 6.05377ZM0 5.52344V6.27344H11V5.52344V4.77344H0V5.52344Z"
        fill={color}
      />
    </Svg>
  );
}
