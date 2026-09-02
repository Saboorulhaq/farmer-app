import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  contentTitle: {
    fontSize: 22,
    color: '#404040',
    marginBottom: 20,
  },
  keyboardContainer: { flexGrow: 1 },
  container: {
    // paddingTop: 64,
    width: '100%',
  },
  exitContainer: {},
  editText: {
    color: '#099453',
    fontSize: 16,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
