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
  scrollContent: {
    paddingBottom: 32,
  },

  /* Tab Switcher */
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

  /* Section headers */
  sectionHeader: {
    fontSize: 13,
    color: '#101010',
    marginHorizontal: 20,
    marginBottom: 12,
    lineHeight: 20,
  },

  /* Active Finance Card */
  financeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 12,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bankIcon: {
    width: 34,
    height: 23,
    marginRight: 16,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
    marginBottom: 4,
  },
  bankLimit: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },

  /* Active Requests Card */
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
    marginBottom: 16,
  },
  requestsColumnLabel: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
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
  transactionDueDate: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
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
    backgroundColor: '#FFE19C',
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
  statusBadgeTextOrange: {
    color: '#FB6B18',
  },
  statusBadgeTextRejected: {
    color: '#E53935',
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

  /* Loan Applications CTA Card */
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F8F0',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  ctaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D2F0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  ctaTextWrap: {
    flex: 1,
    marginRight: 6,
  },
  ctaTitle: {
    fontSize: 12,
    color: '#101010',
    lineHeight: 16,
  },
  ctaSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    marginTop: 1,
  },
  ctaContinueBtn: {
    backgroundColor: '#099453',
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexShrink: 0,
  },
  ctaContinueText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  /* Harvest Banner */
  harvestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  bannerBubble: {
    position: 'absolute',
    backgroundColor: '#D7FFE5',
    borderRadius: 100,
  },
  harvestBannerImage: {
    width: 56,
    height: 56,
    marginRight: 8,
  },
  harvestBannerContent: {
    flex: 1,
  },
  harvestBannerTitle: {
    fontSize: 10,
    color: '#1D3A70',
    lineHeight: 14,
  },
  harvestBannerDesc: {
    fontSize: 10,
    color: '#1D3A70',
    lineHeight: 14,
    marginTop: 2,
  },
  harvestBannerButton: {
    backgroundColor: '#009B37',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  harvestBannerButtonText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* Marketplace Cards */
  marketplaceHeading: {
    fontSize: 14,
    color: '#000000',
    marginHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  marketplaceCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 8,
    marginBottom: 24,
  },
  marketplaceCard: {
    flex: 1,
    backgroundColor: '#E7F8F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F3F3',
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 146,
    shadowColor: 'rgba(159,172,185,0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  marketplaceCardTextWrap: {
    marginTop: 'auto' as any,
    gap: 6,
    paddingTop: 16,
  },
  marketplaceCardTitle: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  marketplaceCardDesc: {
    fontSize: 12,
    color: '#404040',
    lineHeight: 16,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#979797',
    textAlign: 'center',
  },
});
