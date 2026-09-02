import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

type LabelValueProps = {
  label: string;
  value: string;
  disabled?: boolean;
};

export default function LabelValue({ label, value, disabled }: LabelValueProps) {
  return (
    <View style={styles.fieldWrap}>
      <UITypography variant="medium" style={styles.fieldLabel}>{label}</UITypography>
      <UITypography variant="semiBold" style={[styles.fieldValue, disabled && styles.fieldDisabled]}>{value}</UITypography>
      <View style={styles.line} />
    </View>
  );
}

