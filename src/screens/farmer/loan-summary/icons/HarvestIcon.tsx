import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function HarvestIcon() {
  return (
    <View style={iconStyles.container}>
      <Text style={iconStyles.text}>Rs</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    lineHeight: 16,
  },
});

