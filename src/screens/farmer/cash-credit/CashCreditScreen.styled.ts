import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { gap: 16, paddingHorizontal: 24, paddingBottom: 24 },
  sectionWrap: { gap: 20 },
  title: {
    marginVertical: 28,
    marginLeft: 24,
    color: '#101010',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  cardBody: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    gap: 24,
  },
});

