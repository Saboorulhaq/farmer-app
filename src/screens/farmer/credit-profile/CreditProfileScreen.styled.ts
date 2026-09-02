import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#101010',
    textAlign: 'center',
  },
  overallCard: {
    backgroundColor: '#E9FFF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  overallCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 100,
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 12,
    maxWidth: '60%',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  profileInfo: {
    gap: 2,
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    color: '#404040',
    letterSpacing: 0.3,
  },
  profileId: {
    fontSize: 12,
    color: '#404040',
    flexWrap: 'wrap',
  },
  gaugeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gaugeContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overallDivider: {
    height: 1,
    backgroundColor: '#D0D0D0',
    marginBottom: 8,
    marginRight: 16,
  },
  creditHealthLabel: {
    fontSize: 13,
    color: '#404040',
    marginRight: 16,
  },
  lowRiskBadge: {
    backgroundColor: '#099453',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  lowRiskText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#6D6D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#1D3A70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 14,
    color: '#404040',
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 5,
  },
  scoreText: {
    fontSize: 13,
    color: '#404040',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  cardContent: {
    gap: 8,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  checkItemText: {
    fontSize: 13,
    color: '#898A8D',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  statusTextModerate: {
    fontSize: 11,
    color: '#404040',
  },
  arrowButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  secureText: {
    fontSize: 12,
    color: '#444',
  },
});
