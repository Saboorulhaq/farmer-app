import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#101010',
    textAlign: 'center',
    flex: 1,
    marginRight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#404040',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#6D6D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  cardIcon: {
    width: 32,
    height: 32,
  },
  harvestIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  infoIcon: {
    width: 14,
    height: 14,
  },
  cardTitle: {
    fontSize: 16,
    color: '#101010',
  },
  pickerInline: {
    flex: 1,
  },
  yieldInput: {
    fontSize: 14,
    color: '#444444',
    fontFamily: 'Poppins-Medium',
    padding: 0,
    margin: 0,
    letterSpacing: 0.3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 14,
    color: '#444444',
    letterSpacing: 0.3,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginTop: 12,
  },
  yieldRow: {
    flexDirection: 'row',
    gap: 20,
  },
  yieldField: {
    flex: 1,
  },
  estimatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estimatedText: {
    fontSize: 13,
    color: '#404040',
    opacity: 0.6,
    marginLeft: 8,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#6D6D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  locationRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  summaryCard: {
    backgroundColor: '#E9FFF5',
    borderWidth: 1,
    borderColor: '#B2E1C3',
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#404040',
    opacity: 0.6,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    color: '#4D5154',
    marginBottom: 8,
  },
  summaryLocation: {
    fontSize: 13,
    color: '#404040',
    opacity: 0.6,
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
