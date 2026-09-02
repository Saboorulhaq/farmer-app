import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: width * 0.57,
    height: width * 0.57,
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
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
  },
});
