import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: '#099453',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
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
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    minWidth: 32,
    height: 32,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 14,
  },
  // ── List ────────────────────────────────────────────────
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // ── Farmer Card ─────────────────────────────────────────
  farmerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    color: '#099453',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  farmerName: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusComplete: {
    backgroundColor: '#E7F8F0',
  },
  statusIncomplete: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 11,
  },
  statusCompleteText: {
    color: '#099453',
  },
  statusIncompleteText: {
    color: '#E65100',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  cardDetailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmerDetail: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  idIcon: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#099453',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  // ── States ───────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#8B8B8B',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
  },
  pageInfo: {
    fontSize: 13,
    color: '#8B8B8B',
    textAlign: 'center',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
});
