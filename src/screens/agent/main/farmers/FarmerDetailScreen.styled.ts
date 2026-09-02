import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  // ── Header ──────────────────────────────────────────────
  headerBg: {
    backgroundColor: '#099453',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
  // ── Profile Card ───────────────────────────────────────
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: -20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 22,
    color: '#099453',
  },
  profileName: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 13,
    marginBottom: 4,
  },
  statusActive: {
    color: '#099453',
  },
  statusInactive: {
    color: '#E65100',
  },
  profileDate: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  // ── Section ─────────────────────────────────────────────
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#099453',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowLast: {
    marginBottom: 0,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: '#8B8B8B',
    marginBottom: 1,
  },
  rowValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  // ── Farm Card ────────────────────────────────────────────
  farmCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  farmCardLast: {
    marginBottom: 0,
  },
  farmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  farmLabel: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  farmValue: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  // ── Registration Status ──────────────────────────────────
  regGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  regItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
  },
  regDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  regDotTrue: {
    backgroundColor: '#099453',
  },
  regDotFalse: {
    backgroundColor: '#D0D0D0',
  },
  regLabel: {
    fontSize: 12,
    color: '#4A4A4A',
  },
  // ── States ───────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
