import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
 
 container: { flex: 1, backgroundColor: '#F8F8FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: { color: '#101010', fontSize: 18, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#8B8B8B',
    textAlign: 'center',
    marginTop: 36,
    lineHeight: 22,
  },
  infoLine: {
    marginTop: 9,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#8B8B8B',
    textAlign: 'center',
  },
  phoneNumber: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#099453',
  },
  pinInputContainer: {
    marginTop: 25,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  resendContainer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#404040',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  resendLink: {
    color: '#099453',
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  blockTimerContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  blockTimerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 22,
  },
  verifyButton: {
    // width: '100%',
    marginTop: 64,
    marginHorizontal: 24,
  },
});
