import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { UIIconButton } from '@/components/ui/button';
import UITypography from '@/components/ui/typography';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

type LoanScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export default function LoanScreenHeader({
  title,
  onBack,
  containerStyle,
  titleStyle,
  leftElement,
  rightElement,
}: LoanScreenHeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {leftElement ?? (
        <UIIconButton onPress={onBack}>
          <ArrowLeftIcon />
        </UIIconButton>
      )}
      <UITypography variant="semiBold" style={[styles.title, titleStyle]}>
        {title}
      </UITypography>
      {rightElement ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
});

