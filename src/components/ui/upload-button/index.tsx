import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import UploadIcon from '../../icons/UploadIcon';

interface UploadButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function UploadButton({
  onPress,
  disabled = false,
  style,
}: UploadButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <UploadIcon width={10} height={11} color="#F32735" />
      <Text style={styles.label}>Upload</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 5, // pill shape
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 73,
    height: 28,
  },
  label: {
    marginLeft: 6, // gap between icon and text
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.1,
    color: '#F32735',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
});