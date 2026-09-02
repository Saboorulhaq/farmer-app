import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Info banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D8EEDF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    color: '#1F3D2B',
  },
  bannerSubtitle: {
    fontSize: 12.5,
    color: '#6B7B70',
    lineHeight: 18,
    marginTop: 2,
  },

  // Map
  mapCard: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EDE9E1',
    marginBottom: 18,
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapOverlayLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9E1',
  },
  mapOverlayText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7B70',
  },
  accuracyPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  accuracyPillTextWrap: {
    marginLeft: 8,
  },
  accuracyPillTitle: {
    fontSize: 13,
    color: '#1F3D2B',
  },
  accuracyPillSubtitle: {
    fontSize: 11.5,
    color: '#6B7B70',
    marginTop: 1,
  },
  recenterButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // Details card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF6EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsHeaderTextWrap: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 15.5,
    color: '#1A1A1A',
  },
  detailsTimestamp: {
    fontSize: 12.5,
    color: '#8B8B8B',
    marginTop: 2,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#5A5A5A',
    width: 96,
  },
  detailValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  detailValue: {
    flexShrink: 1,
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  copyButton: {
    marginLeft: 10,
    paddingTop: 1,
  },

  // Tips card
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F4F5F3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  tipsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7EEE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipsTextWrap: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14.5,
    color: '#1F3D2B',
  },
  tipsSubtitle: {
    fontSize: 12.5,
    color: '#6B7B70',
    lineHeight: 18,
    marginTop: 2,
  },

  // Error state
  errorCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13.5,
    color: '#6B7B70',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingTop: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#099453',
    borderRadius: 14,
    height: 58,
    shadowColor: 'rgba(9, 148, 83, 0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#D4E8DA',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
  retakeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  retakeText: {
    color: '#166534',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
});
