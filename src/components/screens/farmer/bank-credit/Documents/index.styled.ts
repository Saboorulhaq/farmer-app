import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  stepsWrap: { marginTop: 18, marginHorizontal: 14 },
  card: {
    marginTop: 32,
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 13, color: '#101010', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  infoBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#11AA64', alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  infoHint: { flex: 1, color: '#979797', fontSize: 13, lineHeight: 16 },
  uploadList: { marginTop: 18, gap: 18 },
  noteText: { marginTop: 30, marginLeft: 4, width: '70%', color: '#101010', fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  nextButton: { marginTop: 40, alignSelf: 'stretch', marginHorizontal: 24 },
});

