import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface ProviderCreditIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function ProviderCreditIcon({
  width = 31,
  height = 25,
  color = '#099453',
}: ProviderCreditIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 32" fill="none">
      {/* Simple card outline with lots of padding */}
      <Rect 
        x="6" 
        y="8" 
        width="28" 
        height="16" 
        rx="2.5" 
        fill="none"
        stroke={color} 
        strokeWidth="1.8"
      />
      
      {/* Card stripe */}
      <Rect 
        x="6" 
        y="12" 
        width="28" 
        height="2.5" 
        fill={color}
        fillOpacity="0.7"
      />
      
      {/* Simple chip */}
      <Rect 
        x="9" 
        y="17" 
        width="4.5" 
        height="3.5" 
        rx="0.8" 
        fill={color}
        fillOpacity="0.8"
      />
      
      {/* Single detail line */}
      <Path 
        d="M16 19H27" 
        stroke={color} 
        strokeWidth="1" 
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </Svg>
  );
}
