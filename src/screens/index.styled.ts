import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFEEC8',
  },
  gradient: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTransitionContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  splashTapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  video2OverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 60,
  },
  mofaLogo: {
    width: 96,
    height: 96,
  },
  video2SlideImagesContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  video2SlideImage: {
    width: '74%',
    height: 54,
  },
  video2SlideImageOne: {
    width: '64%',
    height: 44,
    marginBottom: -8,
  },
  ctaBottomBrandImage: {
    position: 'absolute',
    bottom: 20,
    width: '50%',
    height: 34,
    alignSelf: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
  logo: {
    width: 156,
    height: 32,
  },
  bottomSection: {
    padding: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  brandSubtext: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: width,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 88,
    gap: 14,
  },
  animatedButtonWrap: {
    width: '100%',
  },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 0,
    paddingVertical: 0,
    minHeight: 52,
  },
  buttonText: {
    color: '#099453',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  buttonPressed: {
    backgroundColor: '#F2F2F2',
  },
});
