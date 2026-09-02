import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { styles } from './index.styled';

interface StepsProps {
  steps?: number;
  current?: number; // 1-based index
  style?: ViewStyle;
}

export default function Steps({ steps = 5, current = 1, style }: StepsProps) {
  const items = Array.from({ length: steps }, (_, i) => i + 1);

  return (
    <View style={[styles.container, style]}>
      {items.map((n, idx) => {
        const active = n <= current;
        return (
          <React.Fragment key={n}>
            <View style={[styles.circle, active ? styles.circleActive : styles.circleInactive]}>
              <Text style={[styles.number, active ? styles.numberActive : styles.numberInactive]}>{n}</Text>
            </View>
            {idx < items.length - 1 && <View style={styles.line} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

