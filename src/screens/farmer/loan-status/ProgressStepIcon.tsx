import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

export type ProgressStepIconType = 'search' | 'clipboard' | 'shield';

interface ProgressStepIconProps {
  status: 'In Progress' | 'Pending' | 'Completed';
  iconType?: ProgressStepIconType;
  size?: number;
}

export default function ProgressStepIcon({ status, iconType, size = 27 }: ProgressStepIconProps) {
  const isActive = status === 'In Progress' || status === 'Completed';
  const circleFill = isActive ? '#099453' : '#D9D9D9';
  const iconColor = isActive ? '#FFFFFF' : '#898A8D';

  const renderInnerIcon = () => {
    switch (iconType) {
      case 'search':
        return (
          <Path
            d="M18.3756 12.6867C18.3756 13.9416 17.9681 15.1008 17.2818 16.0413L20.7436 19.5052C21.0855 19.8469 21.0855 20.4019 20.7436 20.7437C20.4018 21.0854 19.8467 21.0854 19.5049 20.7437L16.043 17.2797C15.1023 17.966 13.9429 18.3733 12.6878 18.3733C9.54583 18.3733 7 15.828 7 12.6867C7 9.54533 9.54583 7 12.6878 7C15.8297 7 18.3756 9.54533 18.3756 12.6867ZM12.6878 16.6236C14.8617 16.6236 16.6255 14.8602 16.6255 12.6867C16.6255 10.5132 14.8617 8.74974 12.6878 8.74974C10.5138 8.74974 8.75009 10.5132 8.75009 12.6867C8.75009 14.8602 10.5138 16.6236 12.6878 16.6236Z"
            fill={iconColor}
          />
        );
      case 'clipboard':
        return (
          <G>
            <Path
              d="M16.0998 7.40234C17.6222 7.41082 18.4468 7.47833 18.9846 8.01619C19.5997 8.63125 19.5997 9.62117 19.5997 11.601V15.8009C19.5997 17.7808 19.5997 18.7707 18.9846 19.3857C18.3696 20.0008 17.3796 20.0008 15.3998 20.0008H11.1999C9.22004 20.0008 8.23012 20.0008 7.61506 19.3857C7 18.7707 7 17.7808 7 15.8009V11.601C7 9.62117 7 8.63125 7.61506 8.01619C8.15292 7.47833 8.97743 7.41082 10.4999 7.40234"
              stroke={iconColor}
              strokeWidth="1.5"
            />
            <Path d="M12.25 14.3984L16.7999 14.3984" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M9.79932 14.3984H10.1493" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M9.79932 11.9531H10.1493" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M9.79932 16.8516H10.1493" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12.25 11.9531H16.7999" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M12.25 16.8516H16.7999" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <Path
              d="M10.4999 7.05018C10.4999 6.4703 10.97 6.00021 11.5499 6.00021H15.0498C15.6297 6.00021 16.0998 6.4703 16.0998 7.05018V7.75017C16.0998 8.33005 15.6297 8.80014 15.0498 8.80014H11.5499C10.97 8.80014 10.4999 8.33005 10.4999 7.75017V7.05018Z"
              stroke={iconColor}
              strokeWidth="1.5"
            />
          </G>
        );
      case 'shield':
        return (
          <Path
            d="M12.8449 15.8266C12.4193 16.4861 11.7863 15.9812 11.7863 15.9812C11.1425 15.3834 10.1821 14.5487 10.2585 14.5384C10.2258 14.4971 10.204 14.4662 10.1821 14.4456C9.94206 14.1571 9.94206 13.8067 10.204 13.5799C10.4659 13.3429 10.8369 13.3635 11.1316 13.6315C11.2407 13.7345 11.3498 13.8376 11.459 13.9406C11.6554 14.1261 11.8409 14.3116 12.0483 14.4972C12.081 14.4662 12.0919 14.4559 12.0919 14.4456C12.1246 14.3941 12.1465 14.3426 12.1792 14.2807C12.703 13.3017 13.3469 12.4051 14.1763 11.6322C14.7328 11.1169 15.3549 10.6635 16.086 10.3852C16.4353 10.2512 16.8063 10.3852 16.9373 10.7047C17.0791 11.0242 16.9154 11.3539 16.5662 11.5085C16.3807 11.591 16.1952 11.6734 16.0206 11.7868C14.9729 12.4257 14.2308 13.3223 13.6088 14.3323C13.336 14.6517 12.834 15.8266 12.834 15.8266H12.8449ZM12.3647 6.09806C11.2298 6.24234 10.1276 6.49998 9.0472 6.85038C7.84677 7.23168 7.03922 8.33439 7.01739 9.43709C6.98465 11.0963 7.01739 12.7555 7.00648 14.4044C7.00648 14.5281 6.79913 16.3934 8.73072 18.0732C10.1494 19.6087 13.1395 21 13.4997 21C13.8598 21 16.8499 19.619 18.2686 18.0732C20.2002 16.3934 19.9929 14.5281 19.9929 14.4044C19.9929 12.7452 20.0147 11.086 19.982 9.43709C19.9601 8.33439 19.1526 7.23168 17.9522 6.84007C16.8718 6.48968 15.7696 6.23204 14.6346 6.08776C13.8925 5.96409 13.1286 5.9744 12.3647 6.09806Z"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinejoin="round"
          />
        );
      default:
        if (isActive) {
          return (
            <Path
              d="M9.5 13.5L12 16L17.5 10.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        return <Circle cx="13.5" cy="13.5" r="4" fill="#FFFFFF" />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 27 27" fill="none">
      <Circle cx="13.5" cy="13.5" r="13.5" fill={circleFill} />
      {renderInnerIcon()}
    </Svg>
  );
}
