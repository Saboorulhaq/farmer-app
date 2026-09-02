import React from 'react';
import Svg, { Rect, Line, Path, Circle, G } from 'react-native-svg';

type TrackShipmentMapProps = {
  height?: number;
};

/**
 * Stylised route map reproduced from the Figma "Track Shipment" design.
 * Rendered as a single stretchable SVG (viewBox 358x186) so it fills the
 * card width on any device. Geometry is transcribed from the exported
 * Figma vectors (roads, river, buildings, route line, origin/destination
 * markers).
 */
export default function TrackShipmentMap({ height = 186 }: TrackShipmentMapProps) {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 358 186"
      preserveAspectRatio="none"
      fill="none"
    >
      {/* Base */}
      <Rect x={0} y={0} width={358} height={186} fill="#EDF2EE" />

      {/* Roads — horizontal */}
      <Line x1={-1} y1={30} x2={359} y2={30} stroke="#E2E9E3" strokeWidth={9} />
      <Line x1={-1} y1={96} x2={359} y2={96} stroke="#E2E9E3" strokeWidth={9} />
      <Line x1={-1} y1={158} x2={359} y2={158} stroke="#E2E9E3" strokeWidth={9} />

      {/* Roads — vertical */}
      <Line x1={55.3} y1={0} x2={55.3} y2={186} stroke="#E2E9E3" strokeWidth={9} />
      <Line x1={147.8} y1={0} x2={147.8} y2={186} stroke="#E2E9E3" strokeWidth={9} />
      <Line x1={246.4} y1={0} x2={246.4} y2={186} stroke="#E2E9E3" strokeWidth={9} />
      <Line x1={320.8} y1={0} x2={320.8} y2={186} stroke="#E2E9E3" strokeWidth={9} />

      {/* River */}
      <G transform="translate(-8.54, 124.49)">
        <Path
          d="M3.50092 3.50092C43.5009 15.5009 77.5009 -2.49908 115.501 7.50092C153.501 17.5009 177.501 37.5009 219.501 29.5009C261.501 21.5009 309.501 5.50092 369.501 17.5009"
          stroke="#CFE0EC"
          strokeWidth={7}
          strokeLinecap="round"
        />
      </G>

      {/* Buildings */}
      <Rect x={11.06} y={8} width={30.18} height={16} rx={3} fill="#E6EDE7" />
      <Rect x={69.38} y={40.01} width={60.36} height={18} rx={3} fill="#E6EDE7" />
      <Rect x={165.93} y={14.01} width={52.31} height={20} rx={3} fill="#E6EDE7" />
      <Rect x={262.45} y={46} width={46.29} height={18.01} rx={3} fill="#E6EDE7" />
      <Rect x={23.13} y={112.01} width={46.25} height={17.99} rx={3} fill="#E6EDE7" />
      <Rect x={186.05} y={132} width={40.21} height={16} rx={3} fill="#E6EDE7" />
      <Rect x={286.61} y={95.99} width={52.27} height={18.01} rx={3} fill="#E6EDE7" />

      {/* Route (dashed) */}
      <G transform="translate(31.47, 42.31)">
        <Path
          d="M1.70046 1.70046L45.7005 15.7005L79.7005 9.70046L117.7 31.7005L155.7 49.7005L181.7 73.7005L219.7 81.7005L259.7 101.7L291.7 107.7"
          stroke="#C9D6CD"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeDasharray="7 6"
        />
      </G>

      {/* Origin marker (Faisalabad) */}
      <Circle cx={33.19} cy={44} r={11} fill="#0B8A3D" opacity={0.16} />
      <Circle cx={33.19} cy={44} r={6.6} fill="#0B8A3D" />

      {/* Destination marker (Multan) */}
      <Circle cx={324.82} cy={150} r={11} fill="#8A9691" opacity={0.16} />
      <Circle cx={324.81} cy={150} r={5.4} fill="#FFFFFF" stroke="#8A9691" strokeWidth={2.4} />
    </Svg>
  );
}
