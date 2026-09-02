import React from 'react';
import Svg, { Path } from 'react-native-svg';

type BellOutlineIconProps = {
  size?: number;
  color?: string;
};

export default function BellOutlineIcon({ size = 23, color = '#14201A' }: BellOutlineIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 23.3 23.3" fill="none">
      <Path
        d="M6.60167 9.9025C6.60167 8.5636 7.13355 7.27954 8.0803 6.33279C9.02704 5.38604 10.3111 4.85417 11.65 4.85417C12.9889 4.85417 14.273 5.38604 15.2197 6.33279C16.1665 7.27954 16.6983 8.5636 16.6983 9.9025V13.2033L18.0575 15.7275H5.24251L6.60167 13.2033V9.9025Z"
        stroke={color}
        strokeWidth={1.55333}
        strokeLinejoin="round"
      />
      <Path
        d="M9.90249 18.0575C10.026 18.423 10.2611 18.7406 10.5745 18.9656C10.888 19.1906 11.2641 19.3115 11.65 19.3115C12.0358 19.3115 12.412 19.1906 12.7254 18.9656C13.0389 18.7406 13.274 18.423 13.3975 18.0575"
        stroke={color}
        strokeWidth={1.55333}
        strokeLinecap="round"
      />
    </Svg>
  );
}
