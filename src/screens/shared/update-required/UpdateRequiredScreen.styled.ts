import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 180,
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#099453',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    lineHeight: 45,
    color: '#404040',
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    color: '#404040',
    opacity: 0.6,
    letterSpacing: 0.1,
  },
});
