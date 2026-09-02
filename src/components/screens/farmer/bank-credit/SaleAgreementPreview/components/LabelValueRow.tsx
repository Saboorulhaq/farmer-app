import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

type Props = { label: string; value: string };

export default function LabelValueRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <UITypography variant="medium" style={styles.label}>{label}</UITypography>
      <UITypography variant="medium" style={styles.value}>{value}</UITypography>
    </View>
  );
}

