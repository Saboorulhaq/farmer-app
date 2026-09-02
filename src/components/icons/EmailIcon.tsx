import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface EmailIconProps {
  size?: number;
  color?: string;
}

export default function EmailIcon({ size = 14, color = '#606060' }: EmailIconProps) {
  const w = (12 / 9) * size;
  return (
    <Svg width={w} height={size} viewBox="0 0 12 9" fill="none">
      <Path
        d="M1.125 0C0.503906 0 0 0.503906 0 1.125C0 1.47891 0.166406 1.81172 0.45 2.025L5.325 5.68125C5.72578 5.98125 6.27422 5.98125 6.675 5.68125L11.55 2.025C11.8336 1.81172 12 1.47891 12 1.125C12 0.503906 11.4961 0 10.875 0H1.125ZM0 3.09375V7.5C0 8.32734 0.672656 9 1.5 9H10.5C11.3273 9 12 8.32734 12 7.5V3.09375L7.35 6.58125C6.55078 7.18125 5.44922 7.18125 4.65 6.58125L0 3.09375Z"
        fill={color}
      />
    </Svg>
  );
}
