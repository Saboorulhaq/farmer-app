import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#404040',
    maxWidth: 200,
  },
  backButton: {
    width: 44,
    height: 44,
    position: 'absolute',
    left: -10,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 12,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    height: 3,
    marginRight: 5,
    borderRadius: 5,
  },
  stepActive: {
    backgroundColor: '#2DD881',
  },
  stepInactive: {
    backgroundColor: '#eee',
  },
});
