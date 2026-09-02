import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 22,
    color: '#404040',
    marginBottom: 20,
  },
  loginContainer: { flex: 1, width: '100%', marginTop: 20 },
  formContainer: { marginTop: 16, marginBottom: 24 },
  footer: {
    paddingTop: 20,
  },
  mainContainer: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  enterPinText: {
    fontSize: 16,
  },
  pinErrorText: {
    color: '#D32F2F',
    marginTop: 8,
    fontSize: 13,
  },
});
