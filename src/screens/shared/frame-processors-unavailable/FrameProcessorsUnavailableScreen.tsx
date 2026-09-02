import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FrameProcessorsUnavailableScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Camera verification is unavailable on this build (Frame Processors
        disabled).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
