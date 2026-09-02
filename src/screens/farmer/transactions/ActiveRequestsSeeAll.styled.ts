import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: '#101010',
    textAlign: 'center',
    lineHeight: 28,
  },

  /* Search + Filter row */
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 34,
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tab Switcher (All / Offered / Rejected) */
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    height: 36,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    borderRadius: 30,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#099453',
  },
  tabText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* Section header */
  sectionHeader: {
    fontSize: 13,
    color: '#101010',
    marginHorizontal: 20,
    marginBottom: 12,
    lineHeight: 20,
  },

  /* Requests Card */
  requestsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  requestsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    marginBottom: 16,
  },
  requestsColumnLabel: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },

  /* Transaction Row */
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
    marginBottom: 2,
  },
  transactionInvoice: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
  transactionDueDate: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
  amountBadgeContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
    marginBottom: 4,
  },

  /* Status Badges */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statusBadgeApproved: {
    backgroundColor: '#E7F8F0',
  },
  statusBadgePending: {
    backgroundColor: '#FFF8E1',
  },
  statusBadgeRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center' as const,
  },
  statusBadgeTextApproved: {
    color: '#099453',
  },
  statusBadgeTextPending: {
    color: '#F5A623',
  },
  statusBadgeTextRejected: {
    color: '#E53935',
  },
});
