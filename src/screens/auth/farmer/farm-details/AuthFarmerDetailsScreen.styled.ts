import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  contentContainer: {
    flexGrow: 1,
  },
  screenContent: {
    flex: 1,
  },
  container: {
    // paddingTop: 24,
    flex: 1,
    width: '100%',
  },
  contentTitle: {
    fontSize: 22,
    color: '#404040',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    marginTop: 12,
    color: '#8B8B8B',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
    marginLeft: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  unitPicker: { width: 100 },
  sectionTitle: {
    fontSize: 22,
    color: '#404040',
    marginTop: 16,
    marginBottom: 24,
  },
  option: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  optionText: { marginLeft: 8, fontSize: 15 },
  agreement: { flexDirection: 'row', alignItems: 'center' },
  agreementText: { color: '#404040', fontSize: 15 },
  privacyPolicyLink: {
    color: '#16A34A',
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 4,
    fontSize: 13,
  },
  requiredAsterisk: {
    color: '#E53935',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  farmSizeWrapper: {
    flex: 0.4,
  },
  farmSizeUnitWrapper: {
    flex: 0.6,
  },
  farmSizeInputWrapper: {
    paddingBottom: 12,
  },
  farmSizeInputContainer: {
    marginBottom: 0,
  },
  farmSizeInput: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  link: { color: 'green', textDecorationLine: 'underline' },
  footer: {
    paddingVertical: 20,
  },
  locationCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE7D6',
    backgroundColor: '#F3FaF5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  locationCtaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationCtaTextWrap: {
    flex: 1,
  },
  locationCtaTitle: {
    fontSize: 14,
    color: '#166534',
  },
  locationCtaSubtitle: {
    fontSize: 12,
    color: '#6B7B70',
    marginTop: 1,
  },
});
