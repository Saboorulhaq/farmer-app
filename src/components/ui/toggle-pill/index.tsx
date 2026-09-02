import React from 'react';
import { Pressable, View } from 'react-native';
import UITypography from '@/components/ui/typography';

interface TogglePillProps {
  value: boolean;
  onToggle: () => void;
  labelLeft?: string;
  labelRight?: string;
  backgroundOn?: string;
  backgroundOff?: string;
  circleColor?: string;
  style?: any;
}

export default function TogglePill({
  value,
  onToggle,
  labelLeft = 'YES',
  labelRight = 'NO',
  backgroundOn = '#099453',
  backgroundOff = '#E2E2E2',
  circleColor = '#FFFFFF',
  style,
}: TogglePillProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 100,
          paddingVertical: 4,
          paddingHorizontal: 4,
          backgroundColor: value ? backgroundOn : backgroundOff,
        },
        style,
      ]}
    >
      {value && (
        <UITypography variant="semiBold" style={{ color: '#fff', fontSize: 12 }}>
          {labelLeft}
        </UITypography>
      )}
      {!value && (
        <UITypography variant="semiBold" style={{ color: '#fff', fontSize: 12 }}>
          {labelRight}
        </UITypography>
      )}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: circleColor,
          shadowColor: '#5a3a42',
          shadowOpacity: 0.24,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      />
    </Pressable>
  );
}

