import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
    paddingTop: 60,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  formContainer: {},
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    color: '#8B8B8B',
    fontWeight: '600',
    marginBottom: 6,
  },
  footer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  registerRow: {
    flexDirection: 'row',
  },
  registerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  registerLink: {
    fontSize: 16,
    color: '#16A34A',
  },
});
