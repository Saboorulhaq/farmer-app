import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface FSADocIconProps {
  size?: number;
  color?: string;
}

export default function FSADocIcon({ size = 16, color = '#979797' }: FSADocIconProps) {
  const w = (16.5 / 18.17) * size;
  return (
    <Svg width={w} height={size} viewBox="0 0 16.5011 18.1674" fill="none">
      <G>
        <Path
          d="M11.5842 2.4185C13.3968 2.42859 14.3785 2.50897 15.0188 3.14931C15.7511 3.88156 15.7511 5.06009 15.7511 7.41717V12.4173C15.7511 14.7744 15.7511 15.9529 15.0188 16.6852C14.2866 17.4174 13.108 17.4174 10.7508 17.4174H5.75038C3.39318 17.4174 2.21458 17.4174 1.48229 16.6852C0.750002 15.9529 0.750002 14.7744 0.750002 12.4173V7.41717C0.750002 5.06009 0.750002 3.88156 1.48229 3.14931C2.12266 2.50897 3.10432 2.42859 4.91698 2.4185"
          stroke={color}
          strokeWidth={1.5}
        />
        <Path d="M7.00044 10.7499L12.4175 10.7499" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M4.08275 10.7499H4.49945" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M4.08275 7.83416H4.49945" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M4.08275 13.6683H4.49945" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M7.00044 7.83416H12.4175" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M7.00044 13.6683H12.4175" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path
          d="M4.91707 2.00003C4.91707 1.30966 5.47676 0.75 6.16717 0.75H10.3341C11.0246 0.75 11.5842 1.30966 11.5842 2.00003V2.83338C11.5842 3.52375 11.0246 4.08341 10.3341 4.08341H6.16717C5.47676 4.08341 4.91707 3.52375 4.91707 2.83338V2.00003Z"
          stroke={color}
          strokeWidth={1.5}
        />
      </G>
    </Svg>
  );
}
