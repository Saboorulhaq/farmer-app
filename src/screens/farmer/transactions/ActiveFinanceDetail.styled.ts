import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
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

  /* Green Bank Card */
  bankCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    height: 220,
  },
  bankCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bankCardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  decorSvgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  bankCardName: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 4,
  },
  bankCardFacility: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 24,
  },
  bankCardLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  limitColumn: {},
  limitLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 2,
  },
  limitValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  limitColumnRight: {
    alignItems: 'flex-end',
  },

  /* Loans Card */
  requestsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 24,
  },
  requestsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  requestsColumnLabel: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },

  /* Transaction Row */
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
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
    marginBottom: 1,
  },
  transactionSubText: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
  amountBadgeContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeDue: {
    backgroundColor: '#E7F8F0',
  },
  statusBadgeOverDue: {
    backgroundColor: '#FFE19C',
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  statusBadgeTextDue: {
    color: '#099453',
  },
  statusBadgeTextOverDue: {
    color: '#FB6B18',
  },

  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 13,
    color: '#4F52FF',
    textAlign: 'center',
    lineHeight: 17,
  },
});
