import React, { useState } from 'react';
import { View, Pressable, Modal, Dimensions } from 'react-native';
import AgreementIcon from '@/components/icons/AgreementIcon';
import UITypography from '@/components/ui/typography';
import ExclamationCircleFilledIcon from '@/components/icons/ExclamationCircleFilledIcon';
import Tooltip from '@/components/ui/tooltip';
import { styles } from '../index.styled';

interface CardHeaderProps {
  title?: string;
}

export default function CardHeader({
  title = 'Agreement Details',
}: CardHeaderProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top?: number; bottom?: number; left: number; arrowLeft: number }>({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const iconRef = React.useRef<View>(null);

  const handlePress = () => {
    iconRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
      const tooltipWidth = 167; // from styles.tooltipBox
      const padding = 20; // safe margin from screen edge

      let left = pageX + width / 2 - tooltipWidth / 2;
      
      // Check right boundary
      if (left + tooltipWidth > screenWidth - padding) {
        left = screenWidth - tooltipWidth - padding;
      }
      // Check left boundary (unlikely but good practice)
      if (left < padding) {
        left = padding;
      }

      // Calculate arrow position relative to tooltip container
      // Arrow has marginLeft: -6 in base styles
      // We want visual center at: (pageX + width / 2) - left
      // left prop - 6 = visual center
      // left prop = visual center + 6
      const arrowLeft = (pageX + width / 2) - left + 6;

      setTooltipPos({
        bottom: screenHeight - pageY - 10, // Position lower (closer to icon)
        left: left,
        arrowLeft: arrowLeft,
      });
      setTooltipVisible(true);
    });
  };

  return (
    <View style={styles.cardHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AgreementIcon width={30} height={30} />
        <UITypography variant="semiBold" style={styles.cardTitle}>
          {title}
        </UITypography>
      </View>
      <Pressable onPress={handlePress}>
        <View ref={iconRef} collapsable={false}>
          <ExclamationCircleFilledIcon width={20} height={20} />
        </View>
      </Pressable>
      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <Tooltip
          visible={true}
          text="Provide the quantity you wish to commit under this agreement."
          style={[
            styles.tooltipBox,
            { 
              left: tooltipPos.left, 
              ...(tooltipPos.bottom ? { bottom: tooltipPos.bottom } : { top: tooltipPos.top })
            },
          ]}
          arrowStyle={{ left: tooltipPos.arrowLeft }}
          onClose={() => setTooltipVisible(false)}
          placement="top"
        />
      </Modal>
    </View>
  );
}
