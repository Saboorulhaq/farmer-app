import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

type Props = {
  icon: React.ReactNode;
  title: string;
};

export default function FeatureBadge({ icon, title }: Props) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrap}>{icon}</View>
      <UITypography variant="regular" style={styles.featureTitle}>{title}</UITypography>
    </View>
  );
}

