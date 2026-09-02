import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  container: {
    marginTop: 20,
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    gap: 24,
    flex: 1,
    marginTop: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  cardHeaderText: {
    fontSize: 16,
    color: '#000000',
  },
  cardHeaderLink: {
    fontSize: 16,
    color: '#099453',
    textDecorationLine: 'underline',
  },
  card: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    flex: 1,
  },
  cardImageContainer: {
    width: '100%',
    borderRadius: 12,
    aspectRatio: 5 / 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
  }
});
