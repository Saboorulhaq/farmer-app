import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectionBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  rejectionText: {
    color: '#C62828',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },
  statusTag: {
    backgroundColor: '#FFF9E6',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusTagApproved: {
    backgroundColor: '#099453',
  },
  statusTagRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusTagText: {
    color: '#101010',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Medium',
  },
  statusTagTextApproved: {
    color: '#FFFFFF',
  },
  statusTagTextRejected: {
    color: '#C62828',
  },
  loanAmount: {
    color: '#101010',
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  loanDuration: {
    color: '#5E5E5E',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    color: '#5E5E5E',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  detailValue: {
    color: '#101010',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completeButtonContainer: {
    flex: 1,
  },
  completeButton: {
    width: '100%',
    paddingHorizontal: 12,
    minHeight: 56,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 6,
    minWidth: 90,
    height: 56,
  },
  deleteButtonText: {
    color: '#101010',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Medium',
  },
  viewRequestContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRequestButton: {
    width: '100%',
  },
});

