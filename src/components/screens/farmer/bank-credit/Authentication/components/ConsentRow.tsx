import React from 'react';
import { View } from 'react-native';
import UITypography from '@/components/ui/typography';
import UICheckbox from '@/components/ui/checkbox';
import { styles } from '../index.styled';

type Props = {
  checked: boolean;
  onToggle: () => void;
  text: string;
};

export default function ConsentRow({ checked, onToggle, text }: Props) {
  return (
    <View style={styles.consentWrap}>
      <UICheckbox checked={checked} onPress={onToggle} size={40} />
      <UITypography variant="medium" style={styles.consentText}>{text}</UITypography>
    </View>
  );
}

