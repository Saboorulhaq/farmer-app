import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  instruction: { color: '#404040', fontSize: 15, fontWeight: '500', lineHeight: 28, width: 295, alignSelf: 'center' },
  signatureWrapper: { alignSelf: 'center', width: 295 },
  signatureContainer: { alignSelf: 'center', width: 295 },
  padWrapper: { marginTop: 20, borderWidth: 3, borderColor: '#D8D8DC', borderRadius: 15, backgroundColor: '#FFFFFF', width: 295, height: 360, alignSelf: 'center', overflow: 'hidden', position: 'relative' },
  signaturePreviewImage: { marginTop: 20, borderWidth: 3, borderColor: '#D8D8DC', borderRadius: 15, backgroundColor: '#FFFFFF', width: 295, height: 360, alignSelf: 'center' },
  placeholderContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  placeholderText: { color: '#B0B0B0', fontSize: 16, fontWeight: '400', textAlign: 'center' },
  preview: { width: 335, height: 114, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginTop: 15, alignSelf: 'center' },
  consentWrap: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24, paddingHorizontal: 24 },
  consentText: { flex: 1, color: '#101010', fontSize: 12, letterSpacing: 0.1, lineHeight: 18 },
  resetLink: { alignSelf: 'flex-end', marginTop: 8, paddingVertical: 4 },
  resetLinkHidden: { opacity: 0 },
  resetLinkText: { fontSize: 13, color: '#099453', textDecorationLine: 'underline', fontWeight: '500' },
  requestButton: { marginTop: 16, alignSelf: 'stretch', marginHorizontal: 24 },
});

