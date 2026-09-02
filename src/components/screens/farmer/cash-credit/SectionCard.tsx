import React from 'react';
import { View, StyleSheet } from 'react-native';
import UITypography from '@/components/ui/typography';
import CheckIcon from '@/components/icons/CheckIcon';

interface SectionCardProps {
  title: string;
  items: string[];
}

export default function SectionCard({ title, items }: SectionCardProps) {
  return (
    <View style={styles.container}>
      <UITypography variant="semiBold" style={styles.sectionTitle}>
        {title}
      </UITypography>
      <View style={styles.card}>
        <View style={styles.itemsContainer}>
          {items.map((text, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.iconFrame}>
                <CheckIcon size={14} color="#BB52C2" />
              </View>
              <UITypography variant="regular" style={styles.itemText}>
                {text}
              </UITypography>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  sectionTitle: {
    color: '#404040',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 1,
    borderColor: '#F5F5F5',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: 26,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  itemsContainer: {
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  iconFrame: {
    borderRadius: 6,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    color: '#404040',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});
