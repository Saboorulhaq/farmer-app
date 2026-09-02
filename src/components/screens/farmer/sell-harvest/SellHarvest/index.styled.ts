import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
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
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 15,
    marginHorizontal: 40,
    padding: 15,
    marginBottom: 32,
  },
  optionCardSelected: {
    backgroundColor: '#E9FFF5',
    borderColor: '#B2E1C3',
  },
  optionCardDisabled: {
    opacity: 0.55,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIconDefault: {
    backgroundColor: '#1D3A70',
  },
  optionIconSelected: {
    backgroundColor: '#099453',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    color: '#000000',
    marginBottom: 6,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 15,
    marginBottom: 16,
  },
  tagDefault: {
    backgroundColor: 'rgba(29, 58, 112, 0.2)',
  },
  tagSelected: {
    backgroundColor: '#099453',
  },
  tagText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  tagTextDefault: {
    color: '#1D3A70',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#099453',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionDescription: {
    fontSize: 13,
    color: '#404040',
    opacity: 0.5,
    lineHeight: 20,
  },
  unavailableMessage: {
    fontSize: 12,
    color: '#8B8B8B',
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    right: 40,
  },
  button: {
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#099453',
    shadowColor: 'rgba(90, 58, 66, 0.24)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#E7F8F0',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonTextEnabled: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#A8D5BA',
  },
});
