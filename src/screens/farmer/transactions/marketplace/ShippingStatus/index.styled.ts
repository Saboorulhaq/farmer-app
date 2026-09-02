import { StyleSheet } from 'react-native';

export const COLORS = {
  screenBg: '#F6F8F7',
  cardBg: '#FFFFFF',
  cardBorder: '#E7EBE8',
  headerBorder: '#F1F4F2',
  divider: '#F1F4F2',
  textDark: '#14201A',
  textGreen: '#0B8A3D',
  textMuted: '#8A9691',
  connector: '#E1E7E3',
  stepInactive: '#D5DDD8',
  greenGlow: '#E4F3EA',
  badgeGreenBg: '#EAF6EE',
  routeEndBorder: '#C6D2CB',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },

  /* ─── Top white header block ─── */
  headerWrap: {
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    paddingBottom: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 40,
  },
  navSide: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    color: COLORS.textDark,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  idCol: {
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  idValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  idValue: {
    fontSize: 13.5,
    color: COLORS.textDark,
  },

  /* ─── Scroll area ─── */
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 15,
  },

  /* ─── Progress stepper ─── */
  stepperRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    width: '100%',
  },
  connector: {
    flex: 1,
    height: 2,
  },
  connectorGrey: {
    backgroundColor: COLORS.connector,
  },
  stepCircleSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.greenGlow,
  },
  stepActiveCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  stepInactiveCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.stepInactive,
  },
  stepLabel: {
    fontSize: 9.5,
    lineHeight: 11.88,
    textAlign: 'center',
    marginTop: 7,
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    color: COLORS.textDark,
  },
  stepperFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperFooterTitle: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  stepperFooterTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  awaitingText: {
    fontSize: 11.5,
    color: COLORS.textGreen,
    marginTop: 10,
  },

  /* ─── Booking confirmed status card ─── */
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  greenDotHalo: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: COLORS.greenGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.textGreen,
  },
  bookingTitle: {
    fontSize: 17,
    color: COLORS.textDark,
    flexShrink: 1,
  },
  scheduleBadge: {
    backgroundColor: COLORS.badgeGreenBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 6,
  },
  scheduleBadgeText: {
    fontSize: 10.5,
    color: COLORS.textGreen,
  },
  bookingDesc: {
    fontSize: 12.5,
    lineHeight: 19.38,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  cardFooterRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 13,
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMuted: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  footerStrong: {
    fontSize: 11.5,
    color: COLORS.textDark,
  },

  /* ─── Map card ─── */
  mapCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  mapWrap: {
    height: 186,
    width: '100%',
  },
  mapLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingTop: 3,
    paddingBottom: 4,
  },
  mapLabelText: {
    fontSize: 9.5,
    color: COLORS.textDark,
    letterSpacing: 0.4,
  },
  crosshairBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchPill: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.badgeGreenBg,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingTop: 5,
    paddingBottom: 6,
  },
  dispatchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textGreen,
  },
  dispatchText: {
    fontSize: 10,
    color: COLORS.textGreen,
  },
  mapDetails: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  mapAddressRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  mapAddressTitle: {
    fontSize: 12.5,
    lineHeight: 17.5,
    color: COLORS.textDark,
  },
  mapAddressSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gpsRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
    gap: 3,
  },
  gpsLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  gpsValue: {
    fontSize: 12,
    color: COLORS.textDark,
  },

  /* ─── Route card ─── */
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeCol: {
    flex: 1,
    gap: 1,
  },
  routeColRight: {
    alignItems: 'flex-end',
  },
  routeSmallLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  routeCity: {
    fontSize: 15,
    color: COLORS.textDark,
    paddingTop: 3,
  },
  routeRegion: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  routeMiddle: {
    width: 94,
    alignItems: 'center',
    paddingTop: 16,
    gap: 6,
  },
  routeBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 2,
  },
  routeBarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textGreen,
  },
  routeBarFilled: {
    flex: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.textGreen,
  },
  routeBarRemaining: {
    flex: 100,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.connector,
  },
  routeBarEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.routeEndBorder,
    backgroundColor: '#FFFFFF',
  },
  routePercent: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  routeFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 13,
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* ─── ETA card ─── */
  etaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  etaCol: {
    flex: 1,
    gap: 4,
  },
  etaDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  etaLabel: {
    fontSize: 10.5,
    lineHeight: 13.65,
    color: COLORS.textMuted,
  },
  etaValue: {
    fontSize: 14.5,
    color: COLORS.textDark,
  },
  etaPill: {
    backgroundColor: COLORS.screenBg,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 10,
    marginTop: 13,
  },

  /* ─── Detail rows (Shipment details / Reference) ─── */
  sectionTitle: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: 12,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 12.5,
    color: COLORS.textDark,
    textAlign: 'right',
    flexShrink: 1,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  /* ─── Contact support ─── */
  contactButton: {
    backgroundColor: COLORS.textGreen,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
});
