import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 22,
    shadowColor: '#5a3a42',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { fontSize: 15, color: '#404040', fontWeight: '600', textAlign: 'center' },
  amountInputContainer: {
    marginTop: 4,
    marginBottom: 0,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  amountInputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#D32F2F',
  },
  currencySymbol: {
    fontSize: 25,
    color: '#099453',
    fontWeight: '600',
    marginRight: 2,
  },
  amountInput: {
    fontSize: 25,
    color: '#099453',
    fontWeight: '600',
    textAlign: 'left',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 60,
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 4,
  },
  sliderWrap: {
    marginTop: 8,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: { marginTop: 2, flexDirection: 'row', justifyContent: 'space-between' },
  limitLabel: { fontSize: 13, color: '#979797', fontWeight: '500' },
});
