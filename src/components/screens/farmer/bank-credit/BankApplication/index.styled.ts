import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { color: '#101010', fontSize: 18, fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 40, paddingBottom: 24 },
  getStartedTitle: { marginTop: 24, fontSize: 20, color: '#101010', fontWeight: '500' },
  subtitle: { marginTop: 12, fontSize: 15, color: '#404040', opacity: 0.6 },
  sectionLabel: { marginTop: 34, fontSize: 13, color: '#404040' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: {
    height: '100%',
    borderRadius: 5,
  },
  cardTextWrap: { flex: 1, paddingTop: 6, paddingBottom: 20 },
  cardTitle: { fontSize: 12, color: '#101010' },
  cardDesc: {  fontSize: 10, lineHeight: 14, color: '#404040', opacity: 0.6, width: '65%' },
  startButton: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 18, height: 32, paddingVertical: 5, borderRadius: 6 },
  stepsWrap: {
    // marginTop: 24
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 },
  stepItemContent: { flex: 1, flexDirection: 'column' },
  stepLabel: { fontSize: 12, color: '#DDDDDD' },
  stepLabelActive: { color: '#101010' },
  editLink: { fontSize: 11, color: '#16A34A', marginTop: 2 },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completedText: { fontSize: 11, color: '#4CAF50', fontWeight: '500' },
  completedStepsWrap: { marginTop: 16 },
  stepLine: { width: 1, flex: 1, marginVertical: 6, backgroundColor: '#DDDDDD', marginLeft: 14 },
  stepLine2: { height: 20, width: 1, marginVertical: 6, backgroundColor: '#DDDDDD', marginLeft: 14 },
  // Ready to submit card styles
  readyToSubmitCard: {
    backgroundColor: '#202CAF',
    borderRadius: 16,
    // padding: 20,
    marginTop: 20,
  },
  readyToSubmitTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 30,
    marginTop: 20,
    marginHorizontal: 20
  },
  readyToSubmitSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 8,
    marginHorizontal: 20

  },
  requestLoanButton: {
    backgroundColor: '#1D3A70',
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 8,
      marginHorizontal: 20,
      marginBottom: 20
  },
  requestLoanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
