import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function FSAIcon() {
  return (
    <View style={iconStyles.container}>
      <View style={iconStyles.topBar} />
      <View style={iconStyles.bottomSection}>
        <View style={iconStyles.line} />
        <View style={iconStyles.line} />
      </View>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  container: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    width: 10,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1,
    marginBottom: 2,
  },
  bottomSection: {
    width: 10,
    gap: 2,
  },
  line: {
    width: 10,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
});

