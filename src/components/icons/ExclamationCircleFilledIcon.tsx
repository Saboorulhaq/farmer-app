import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

export default function ExclamationCircleFilledIcon({
    width = 14,
    height = 14,
}: {
    width?: number;
    height?: number;
}) {
    return (
        <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
            <Circle cx="7" cy="7" r="7" fill="#099453" />
            <Path d="M6.89062 10V6.34375" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
            <Circle cx={0.609375} cy={0.609375} r={0.390625} transform="matrix(1 0 0 -1 6.28125 5.125)" fill="white" stroke="white" strokeWidth={0.4375} />
        </Svg>
    )
}
