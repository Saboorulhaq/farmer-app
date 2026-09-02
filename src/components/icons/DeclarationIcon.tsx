import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function DeclarationIcon({
  size = 30,
  bgColor = '#1D3A70',
  color = 'white',
}: {
  size?: number;
  bgColor?: string;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect width={30} height={30} rx={5} fill={bgColor} />
      <Path
        d="M20.9466 8.48327C20.6356 8.1726 20.2143 8 19.7678 8C19.3214 8 18.9 8.1726 18.589 8.48327L17.8767 9.19831L20.7761 12.1029L21.5285 11.3533C21.8295 11.0476 22 10.6432 22 10.2191C22 9.795 21.8345 9.3857 21.5285 9.07996L20.9416 8.4882L20.9466 8.48327ZM9.11358 17.981L8 22L12.0029 20.8905L20.3898 12.4924L17.4905 9.58788L9.11358 17.981Z"
        fill={color}
      />
    </Svg>
  );
}

