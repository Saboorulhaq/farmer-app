import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import UITypography from '@/components/ui/typography';
import { styles } from '../index.styled';

export default function ProductItem({ icon, name }: { icon?: ImageSourcePropType; name: string }) {
  return (
    <View style={styles.productItem}>
      {icon && <Image source={icon} style={styles.productIcon} />}
      <UITypography variant="regular" style={styles.productText}>{name}</UITypography>
    </View>
  );
}

