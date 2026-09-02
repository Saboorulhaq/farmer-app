import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#101010',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  // Approved Limit Card
  approvedLimitCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  approvedLimitAmount: {
    color: '#099453',
    fontSize: 35,
    lineHeight: 40,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  approvedLimitLabel: {
    color: '#8B8B8B',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    color: '#5E5E5E',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  detailValue: {
    color: '#101010',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  // Sanction Letter Card
  sanctionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  sanctionLabel: {
    color: '#5E5E5E',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  sanctionFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIcon: {
    width: 16,
    height: 20,
    marginRight: 8,
  },
  sanctionFileName: {
    color: '#101010',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  downloadButton: {
    padding: 8,
  },
  // Accept Offer Button
  ctaContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#099453',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins-Bold',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FB',
  },
});
