import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

type Props = { title: string; titleStyle?: any; center?: boolean };

export default function SectionHeader({ title, titleStyle, center }: Props) {
  return (
    <View style={[styles.sectionHeader, center && { alignItems: 'center' }] }>
      <UITypography variant="semiBold" style={[styles.sectionTitle, center && { textAlign: 'center' }, titleStyle]}>{title}</UITypography>
    </View>
  );
}
