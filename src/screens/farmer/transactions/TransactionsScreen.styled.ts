import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
    paddingVertical: 4,
    paddingRight: 4,
  },
  title: {
    fontSize: 24,
    color: '#101010',
    fontFamily: 'Poppins-SemiBold',
  },
});
