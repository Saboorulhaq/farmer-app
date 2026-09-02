import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#6D6D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: '#1D3A70',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 13,
    color: '#101010',
    fontFamily: 'Poppins-SemiBold',
  },
  editButton: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#099453',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: 14,
    height: 14,
  },
  cropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 148, 83, 0.2)',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cropImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  cropText: {
    fontSize: 13,
    color: '#404040',
    fontFamily: 'Poppins-Medium',
  },
  fieldsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  fieldContainer: {
    flex: 1,
  },
  fieldContainerSecond: {
    flex: 1,
    marginLeft: 28,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#444444',
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 14,
    color: '#404040',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  fullWidthField: {
    marginBottom: 60,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 14,
    color: '#404040',
    fontFamily: 'Poppins-SemiBold',
  },
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#DDDDDD',
    marginLeft: 12,
    marginRight: 12,
  },
  itemCount: {
    fontSize: 12,
    color: '#898A8D',
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    marginHorizontal: 40,
    marginTop: 20,
  },
  button: {
    borderRadius: 12,
    height: 56,
  },
});
