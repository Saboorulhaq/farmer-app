import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#101010',
    fontSize: 18,
  },
  headerSpacer: {
    width: 44,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  heading: {
    color: '#101010',
    fontSize: 22,
  },
  subheading: {
    color: '#8B8B8B',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  // Search + Filter
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#101010',
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 16,
  },
  filterText: {
    color: '#404040',
    fontSize: 14,
  },

  // Selected row
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 4,
  },
  selectedText: {
    color: '#404040',
    fontSize: 14,
  },
  clearAllText: {
    color: '#099453',
    fontSize: 14,
  },

  // Bank card
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  bankLogo: {
    width: 46,
    height: 46,
    resizeMode: 'contain',
    marginRight: 14,
  },
  bankLogoLarge: {
    width: 72,
    height: 72,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    color: '#101010',
    fontSize: 15,
  },
  bankTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#8ED0B4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
  },
  bankTagText: {
    color: '#099453',
    fontSize: 11,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxChecked: {
    backgroundColor: '#099453',
    borderColor: '#099453',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B8B8B',
    fontSize: 14,
    marginTop: 30,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  infoText: {
    color: '#404040',
    fontSize: 13,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#099453',
    borderRadius: 12,
    height: 56,
  },
  continueDisabled: {
    backgroundColor: '#E7F8F0',
  },
  continuePressed: {
    opacity: 0.85,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
