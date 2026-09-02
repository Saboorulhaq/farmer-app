import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

export default function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <UITypography variant="medium" style={styles.infoText}>{text}</UITypography>
    </View>
  );
}

