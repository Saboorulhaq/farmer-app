import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PhoneIconProps {
  size?: number;
  color?: string;
}

export default function PhoneIcon({ size = 14, color = '#606060' }: PhoneIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M4.3786 0.683976C4.16257 0.167142 3.59926 -0.106316 3.0633 0.0386167L2.9129 0.0796353C1.14639 0.56092 -0.363063 2.27276 0.0771949 4.35651C1.0917 9.14201 4.85714 12.9075 9.64256 13.922C11.729 14.365 13.4381 12.8528 13.9194 11.0863L13.9604 10.9359C14.108 10.3972 13.8319 9.83386 13.3178 9.62056L10.6571 8.51306C10.2059 8.32437 9.68358 8.45563 9.37184 8.83574L8.31632 10.1265C6.39395 9.17209 4.84621 7.5751 3.95748 5.61441L5.16614 4.62997C5.54624 4.32096 5.67477 3.79866 5.48882 3.34472L4.3786 0.683976Z"
        fill={color}
      />
    </Svg>
  );
}
