import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 29,
    height: 29,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: '#1D3A70',
  },
  circleInactive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  number: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 12,
  },
  numberActive: {
    color: '#FFFFFF',
  },
  numberInactive: {
    color: '#BDBDBD',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 8,
  },
});

