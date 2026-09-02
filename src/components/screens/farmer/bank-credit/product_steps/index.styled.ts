import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  stepsWrap: { marginHorizontal: 12 },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Card styles
  card: {
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6d6d6d',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 13, color: '#101010', fontWeight: '600' },
  cardDescription: {
    marginTop: 11,
    fontSize: 13,
    color: '#404040',
    opacity: 0.6,
  },

  // Section styles
  sectionContainer: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    color: '#404040',
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 13,
    color: '#404040',
    opacity: 0.6,
  },
  infoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#404040',
  },

  // Field styles
  fieldContainer: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#E53935',
  },
  row: {
    marginTop: 16,
  },
  rowLabel: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: 12,
  },

  // Radio/Chip styles
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  radioGroupVertical: {
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  chipActive: {
    backgroundColor: '#09945333',
    borderColor: '#09945333',
  },
  chipText: {
    fontSize: 13,
    color: '#404040',
    fontWeight: '500',
  },

  // Radio button styles
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
    marginBottom: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#099453',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#099453',
  },
  // Radio button box styles (for horizontal layout with rectangular containers)
  radioBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 13,
    width: '45%',
    minHeight: 44,
  },
  radioOuterBox: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    padding: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActiveBox: {
    borderWidth: 1,
    borderColor: '#099453',
    borderRadius: 50,
    backgroundColor: '#099453',
    padding: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerBox: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  radioBtnBoxText: {
    color: '#898A8D',
    fontSize: 14,
    fontWeight: '500',
  },

  // Checkbox styles
  checkboxList: {
    marginTop: 12,
  },
  checkboxCard: {
    paddingVertical: 12,
    borderRadius: 8,
  },

  // Toggle styles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  // Link FSA button styles (green underlined text as shown in image)
  linkFsaButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkFsaText: {
    fontSize: 13,
    color: '#099453',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // FSA Completed indicator styles
  fsaCompletedContainer: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fsaCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fsaCompletedText: {
    fontSize: 12,
    color: '#099453',
    fontWeight: '500',
  },

  // Inline fields styles
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'flex-end',
  },
  inlineLeft: {
    flex: 0.42,
  },
  inlineRight: {
    flex: 0.58,
  },
  inlinePicker: {
    marginTop: 0,
    marginBottom: 0,
  },

  // Textarea styles
  textareaBox: {
    borderWidth: 0,
    backgroundColor: '#F8F8FB',
    borderRadius: 8,
    paddingHorizontal: 18,
    minHeight: 96,
  },
  textareaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#404040',
    lineHeight: 18,
  },

  // Facility type styles (Step 1)
  facilityRow: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  facilityImg: {
    width: 187,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    flexShrink: 0,
  },
  facilityTextContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // Important for flex shrinking
  },
  facilityLabel: {
    fontSize: 13,
    color: '#979797',
    fontWeight: '500',
  },
  facilityType: {
    fontSize: 15,
    color: '#404040',
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  changeLink: {
    marginTop: 17,
    fontSize: 10,
    color: '#099453',
    textDecorationLine: 'underline',
  },

  // Produce grid styles (Step 4)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  produceTile: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  produceTileSelected: {
    borderColor: '#099453',
    backgroundColor: '#09945310',
  },
  produceCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8FB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  produceImage: {
    width: 40,
    height: 40,
  },
  produceLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#404040',
    textAlign: 'center',
  },
  viewMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#099453',
    backgroundColor: '#FFFFFF',
  },
  viewMoreText: {
    fontSize: 11,
    color: '#099453',
    fontWeight: '500',
  },

  // File upload styles (Step 5)
  uploadList: {
    marginTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
  },
  infoHint: {
    fontSize: 12,
    color: '#404040',
    flex: 1,
  },
  noteText: {
    marginTop: 16,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Button styles
  nextButton: {
    marginTop: 24,
    marginBottom: 40,
    alignSelf: 'stretch',
  },

  // Confirm row styles
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  confirmText: {
    color: '#404040',
    fontSize: 14,
    flex: 1,
  },

  // Farm card styles (Step 3)
  collapsedCard: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6d6d6d',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedIndicator: {
    width: 4,
    height: 40,
    backgroundColor: '#099453',
    borderRadius: 2,
    marginRight: 12,
  },
  collapsedGps: {
    flex: 1,
    fontSize: 14,
    color: '#404040',
  },
  collapsedArrow: {
    marginLeft: 12,
  },
  addFarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  addFarmCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#099453',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFarmText: {
    fontSize: 14,
    color: '#099453',
    fontWeight: '500',
  },
  editLink: {
    fontSize: 13,
    color: '#099453',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: '#404040',
    marginTop: 4,
  },
  radioWrap: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },

  // Declaration section
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  declarationQuestion: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
    flex: 1,
  },
  linkInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#099453',
    textDecorationLine: 'underline',
  },

  // Input row styles
  rowInputContainer: {
    marginBottom: 0,
  },
  rowInputWrapper: {
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  rowInput: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
  },
  pickerDivider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: 4,
  },

  // GPS input styles
  gpsLabel: {
    fontSize: 14,
    color: '#404040',
    fontWeight: '500',
  },
  gpsAddonContainer: {
    paddingRight: 8,
  },

  // Farm selection styles
  farmList: {
    gap: 12,
    marginTop: 12,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  farmCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  farmCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D3A70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmCheckboxInner: {
      width: 20,
      height: 20,
      borderRadius: 20,
    backgroundColor: '#1D3A70',
  },
  farmTitle: {
    fontSize: 14,
    color: '#101010',
    flex: 1,
    flexWrap: 'wrap',
  },
  farmDetails: {
    gap: 8,
  },
  farmDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  farmDetailLabel: {
    fontSize: 12,
    color: '#6D6D6D',
    textTransform: 'capitalize',
  },
  farmDetailValue: {
    fontSize: 12,
    color: '#101010',
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  farmExpandButton: {
    padding: 4,
    marginLeft: 8,
  },
  farmExpandIcon: {
    width: 14,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: -18,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#099453',
    textDecorationLine: 'underline',
  },
});
