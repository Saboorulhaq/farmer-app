import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BuyInputsIconProps {
  size?: number;
  color?: string;
}

export default function BuyInputsIcon({ size = 24, color = '#009E54' }: BuyInputsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.4775 6.93225L20.37 15.3638C20.2027 16.0328 19.6042 16.5 18.9142 16.5H5.9175C5.15625 16.5 4.51575 15.93 4.428 15.174L2.90925 3H1.875C1.25325 3 0.75 2.49675 0.75 1.875C0.75 1.25325 1.25325 0.75 1.875 0.75H3.89025C4.45275 0.75 4.92825 1.1655 5.00475 1.722L5.59125 6H21.75C22.2375 6 22.596 6.459 22.4775 6.93225Z"
        fill={color}
      />
      <Path
        d="M5.25 20.25C5.25 21.4905 6.2595 22.5 7.5 22.5C8.7405 22.5 9.75 21.4905 9.75 20.25C9.75 19.0095 8.7405 18 7.5 18C6.2595 18 5.25 19.0095 5.25 20.25Z"
        fill={color}
      />
      <Path
        d="M18.75 20.25C18.75 19.0095 17.7405 18 16.5 18C15.2595 18 14.25 19.0095 14.25 20.25C14.25 21.4905 15.2595 22.5 16.5 22.5C17.7405 22.5 18.75 21.4905 18.75 20.25Z"
        fill={color}
      />
    </Svg>
  );
}
