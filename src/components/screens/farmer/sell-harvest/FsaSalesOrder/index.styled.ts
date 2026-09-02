import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1EE',
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 17,
    color: '#14201A',
    textAlign: 'center',
  },
  centerFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7A8A83',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 18,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBE8',
    borderRadius: 12,
    padding: 15,
  },
  // Sale summary header row
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#14201A',
  },
  statusBadge: {
    backgroundColor: '#FBF0CF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 5,
  },
  statusBadgeText: {
    fontSize: 10.5,
    color: '#8A6D1F',
    letterSpacing: 0.3,
  },
  // Generic label/value rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F2',
    paddingVertical: 8,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: '#8A9691',
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    color: '#14201A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  rowValueWrap: {
    fontSize: 13,
    color: '#14201A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    flexWrap: 'wrap',
  },
  rowValueStrong: {
    fontSize: 15,
    color: '#14201A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  // Sale summary CTAs
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  viewFsaButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#DDE3DF',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewFsaText: {
    fontSize: 13.5,
    color: '#14201A',
  },
  executeButton: {
    flex: 1.15,
    height: 46,
    backgroundColor: '#0B8A3D',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  executeButtonDisabled: {
    opacity: 0.6,
  },
  executeText: {
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  // Order details table
  orderTitle: {
    fontSize: 14,
    color: '#14201A',
    marginBottom: 11,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0B8A3D',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F2',
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  tableCell: {
    fontSize: 12.5,
    color: '#14201A',
  },
  colItem: {
    flex: 1.6,
  },
  colPrice: {
    flex: 1,
  },
  colQty: {
    flex: 1,
  },
  colSubtotal: {
    flex: 1.1,
    textAlign: 'right',
  },
  orderTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 11,
  },
  orderTotalLabel: {
    fontSize: 14,
    color: '#14201A',
  },
  orderTotalValue: {
    fontSize: 14,
    color: '#14201A',
  },
});
