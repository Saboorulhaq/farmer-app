import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function FarmIcon({
  size = 28,
  backgroundColor = '#1D3A70',
  strokeColor = 'white',
}: {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Rect width="25" height="25" rx="5" fill={backgroundColor} />
      <Path
        d="M12.6006 9.90001L15.7506 6.75M12.6006 13.75L17.1506 9.20001M12.6006 17.25L17.8506 12"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <Path
        d="M12.6 19C15.6928 19 18.2 16.4479 18.2 13.2997C18.2 10.1761 16.4127 6.53126 13.6241 5.22783C13.299 5.0759 12.9495 4.99994 12.6 4.99994M12.6 19C9.50722 19 7 16.4479 7 13.2997C7 10.1761 8.78733 6.53126 11.576 5.22783C11.901 5.0759 12.2505 4.99994 12.6 4.99994M12.6 19V4.99994"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </Svg>
  );
}
