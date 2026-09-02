import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export default function WalletIcon({
  width = 24,
  height = 24,
  color = 'white',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  // Scale factor to convert from Figma's viewBox (29x23.6) to desired size
  const scaleX = width / 29;
  const scaleY = height / 23.6;

  return (
    <Svg width={width} height={height} viewBox="0 0 29 23.6" fill="none">
      <G>
      <Path
          d="M6.4 6.4H11.8"
        stroke={color}
          strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
          d="M26.425 7.75H22.9115C20.5027 7.75 18.55 9.56325 18.55 11.8C18.55 14.0368 20.5027 15.85 22.9115 15.85H26.425C26.5375 15.85 26.5937 15.85 26.6412 15.8471C27.3693 15.8028 27.9492 15.2643 27.9969 14.5883C28 14.5442 28 14.492 28 14.3875V9.2125C28 9.10804 28 9.05581 27.9969 9.01171C27.9492 8.33569 27.3693 7.7972 26.6412 7.75289C26.5937 7.75 26.5375 7.75 26.425 7.75Z"
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M26.6028 7.75C26.4978 5.22239 26.1594 3.67266 25.0684 2.58162C23.4868 1 20.9412 1 15.85 1L11.8 1C6.70883 1 4.16325 1 2.58162 2.58162C1 4.16325 1 6.70883 1 11.8C1 16.8912 1 19.4368 2.58162 21.0184C4.16325 22.6 6.70883 22.6 11.8 22.6H15.85C20.9412 22.6 23.4868 22.6 25.0684 21.0184C26.1594 19.9273 26.4978 18.3776 26.6028 15.85"
        stroke={color}
          strokeWidth="2"
      />
      <Path
          d="M22.5895 11.8H22.6016"
        stroke={color}
          strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      </G>
    </Svg>
  );
}
