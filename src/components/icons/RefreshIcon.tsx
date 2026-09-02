import React from 'react';
import Svg, { Path } from 'react-native-svg';

type RefreshIconProps = {
  size?: number;
  color?: string;
};

export default function RefreshIcon({ size = 17, color = '#0B8A3D' }: RefreshIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
      <Path
        d="M13.7417 8.5C13.7344 9.70152 13.3146 10.8641 12.5525 11.793C11.7904 12.7219 10.7323 13.3608 9.55539 13.6027C8.37846 13.8446 7.15414 13.6749 6.08745 13.1218C5.02076 12.5688 4.17645 11.666 3.6959 10.5648C3.21535 9.46352 3.12774 8.2306 3.44773 7.07246C3.76772 5.91431 4.47589 4.90126 5.45366 4.20293C6.43142 3.5046 7.61943 3.16339 8.81874 3.23643C10.0181 3.30948 11.1559 3.79234 12.0417 4.60417"
        stroke={color}
        strokeWidth={1.275}
        strokeLinecap="round"
      />
      <Path
        d="M13.175 2.55V5.1H10.625"
        stroke={color}
        strokeWidth={1.275}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
