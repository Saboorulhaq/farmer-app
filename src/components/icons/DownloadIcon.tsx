import React from "react";
import Svg, { Path } from "react-native-svg";

interface DownloadIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function DownloadIcon({
  width = 14,
  height = 15,
  color = "#C2B7C9",
}: DownloadIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 15" fill="none">
      <Path
        d="M10.6183 7.34027L7.35226 11.0903C7.26194 11.1919 7.13548 11.25 7.00181 11.25C6.86813 11.25 6.73806 11.1919 6.65135 11.0903L3.38529 7.34027C3.26606 7.20232 3.23355 7.00629 3.31303 6.8393C3.3889 6.67231 3.5551 6.56341 3.73936 6.56341H5.60723V0.468296C5.60723 0.210552 5.81677 0 6.07329 0H7.94116C8.19768 0 8.40723 0.210552 8.40723 0.468296V6.56341H10.2751C10.4594 6.56341 10.6255 6.66868 10.7014 6.8393C10.7773 7.00629 10.7484 7.20232 10.6292 7.34027H10.6183ZM12.1357 10.3134V13.1268H1.86787V10.3134H0V14.0634C0 14.5825 0.419097 15 0.932129 15H13.0679C13.5845 15 14 14.5825 14 14.0634V10.3134H12.1321H12.1357Z"
        fill={color}
      />
    </Svg>
  );
}