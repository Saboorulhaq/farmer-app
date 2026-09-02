import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TooltipProps {
  visible: boolean;
  text: string;
  text2?: string;
  arrowStyle?: any;
  style?: any;
  onClose?: () => void;
  placement?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({
  visible,
  text,
  text2,
  style,
  onClose,
  arrowStyle,
  placement = 'bottom',
}) => {
  if (!visible) return null;

  return (
    <>
      {/* Transparent backdrop to detect outside touches */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Tooltip content */}
      <View style={[styles.tooltip, style]}>
        <Text style={styles.tooltipText}>{text}</Text>
        {text2 ? <Text style={styles.tooltipCta}>{text2}</Text> : null}
        <View
          style={[
            styles.arrowBase,
            placement === 'bottom' ? styles.arrowTop : styles.arrowBottom,
            arrowStyle && arrowStyle,
          ]}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    width: 250,
    zIndex: 1000,
  },
  tooltipText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#444444',
    lineHeight: 12,
    textAlign: 'center',
  },
  tooltipCta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#099453',
    lineHeight: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  arrowBase: {
    position: 'absolute',
    left: '50%',
    width: 0,
    height: 0,
    marginLeft: -6,
  },
  arrowBottom: {
    bottom: -6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  arrowTop: {
    top: -6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
});

export default Tooltip;
