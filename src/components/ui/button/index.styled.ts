import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  //button
  button: {
    borderRadius: 12,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 32,
    borderRadius: 8,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    minHeight: 56,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 56,
  },

  //text
  text: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    flexShrink: 1,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },

  outlinedText: {
    color: '#099453',
    fontSize: 16,
  },

  // States
  disabled: {
    backgroundColor: '#E7F8F0',
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryText: {
    color: '#099453',
    fontSize: 16,
  },
  disabledText: {
    color: '#A0A0A0',
  },

  secondaryDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  outlineDisabled: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
    opacity: 0.5,
  },

  //variants
  contained: {
    backgroundColor: '#099453',
    shadowColor: 'rgba(90, 58, 66, 0.24)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    color: '#fff',
    fontSize: 16,
  },
  outlined: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#28a745',
  },

  //disabled
  containedDisabled: {
    backgroundColor: '#E7F8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  outlinedDisabled: {
    backgroundColor: '#fff',
    shadowOpacity: 0,
    elevation: 0,
  },

  //disabled text
  containedDisabledText: {
    backgroundColor: '#fff',
    shadowOpacity: 0,
    elevation: 0,
  },
  outlinedDisabledText: {
    color: '#099453',
  },
});
