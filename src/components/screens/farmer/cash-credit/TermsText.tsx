import React from 'react';
import { View, StyleSheet } from 'react-native';
import UITypography from '@/components/ui/typography';

interface TermsTextProps {
  onPress?: () => void;
}

export default function TermsText({ onPress }: TermsTextProps) {
  return (
    <View style={styles.container}>
      <UITypography variant="regular" style={[styles.text, styles.center, styles.muted]}>
        By proceeding, you are agreeing with the
      </UITypography>
      <UITypography 
        variant="medium" 
        style={[styles.text, styles.center, styles.link]}
        onPress={onPress}
      >
        Terms & Conditions
      </UITypography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 24 },
  text: { fontSize: 12, lineHeight: 18, color: '#000' },
  center: { textAlign: 'center' },
  muted: { color: '#8B8B8B' },
  link: { color: '#099453', fontWeight: '600' },
});
