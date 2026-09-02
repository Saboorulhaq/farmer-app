import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  // Facility Type Card
  facilityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    height: 118,
  },
  facilityImageContainer: {
    width: 170,
    height: '100%',
    padding: 15,
  },
  facilityImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  facilityTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 12,
  },
  facilityTypeLabel: {
    color: '#979797',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  facilityTypeValue: {
    color: '#404040',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontFamily: 'Poppins-SemiBold',
  },
  // Summary Cards Row
  summaryCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryCardLabel: {
    color: '#979797',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 6,
  },
  summaryCardValue: {
    color: '#404040',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  // Progress Tracker Card
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressStepIconColumn: {
    alignItems: 'center',
    width: 27,
    marginRight: 14,
  },
  progressStepLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
    marginTop: 5,
    marginBottom: 5,
  },
  progressStepLineActive: {
    backgroundColor: '#099453',
  },
  progressStepLinePending: {
    backgroundColor: '#D9D9D9',
  },
  progressStepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  progressStepContentLast: {
    paddingBottom: 0,
  },
  progressStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  progressStepTitle: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    color: '#101010',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  progressStepBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  progressStepBadgeInProgress: {
    backgroundColor: '#E7F8F0',
  },
  progressStepBadgePending: {
    backgroundColor: '#D9D9D9',
  },
  progressStepBadgeCompleted: {
    backgroundColor: '#E7F8F0',
  },
  progressStepBadgeText: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  progressStepBadgeTextInProgress: {
    color: '#099453',
  },
  progressStepBadgeTextPending: {
    color: '#898A8D',
  },
  progressStepBadgeTextCompleted: {
    color: '#099453',
  },
  progressStepStatus: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  progressStepStatusInProgress: {
    color: '#099453',
  },
  progressStepStatusPending: {
    color: '#898A8D',
  },
  progressStepStatusCompleted: {
    color: '#099453',
  },
  progressStepDescription: {
    color: '#898A8D',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
  },
  // Rejection Banner
  rejectionBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  rejectionTitle: {
    color: '#C62828',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  rejectionNote: {
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Medium',
  },
  // Bottom CTAs
  ctaContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  viewOffersButton: {
    backgroundColor: '#099453',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewOffersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  offersBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#F32735',
    borderRadius: 60,
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offersBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  viewSummaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSummaryButtonText: {
    color: '#101010',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
