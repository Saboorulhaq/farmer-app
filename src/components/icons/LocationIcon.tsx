import React from 'react';
import Svg, { Path } from 'react-native-svg';

type LocationIconProps = {
  size?: number;
  color?: string;
};

export default function LocationIcon({ size = 18, color = '#EDEDED' }: LocationIconProps) {
  const width = (14 / 18) * size;
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 14 18" fill="none">
      <Path
        d="M7.00193 0C3.13946 0 0 2.9232 0 6.5196C0 10.98 6.26346 17.5284 6.53024 17.8056C6.78155 18.0648 7.21845 18.0648 7.46976 17.8056C7.73654 17.5284 14 10.98 14 6.5196C14 2.9268 10.8605 0 6.99807 0H7.00193ZM7.00193 9.7992C5.06103 9.7992 3.4797 8.3268 3.4797 6.5196C3.4797 4.7124 5.06103 3.24 7.00193 3.24C8.94283 3.24 10.5242 4.7124 10.5242 6.5196C10.5242 8.3268 8.94283 9.7992 7.00193 9.7992Z"
        fill={color}
      />
    </Svg>
  );
}

