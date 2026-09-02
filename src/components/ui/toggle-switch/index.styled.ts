import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: 90,
    height: 40,
    borderRadius: 999,
    padding: 1,
  },
  containerDisabled: {
    opacity: 0.65,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginLeft: -1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  leftLabelWrap: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  rightLabelWrap: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  label: { fontSize: 12, color: '#FFFFFF', fontWeight: '600', letterSpacing: 0.3 },
});

