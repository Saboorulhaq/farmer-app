import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  contentContainerStyle: { flexGrow: 1 },
  contentTitle: {
    fontSize: 22,
    color: '#404040',
    marginBottom: 20,
  },
  container: { paddingTop: 64, flex: 1, width: '100%' },
  exitContainer: { position: 'absolute', right: 0, top: 120 },
  editText: {
    color: '#099453',
    fontSize: 16,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingVertical: 20,
  },
});
