import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { useIsFocused, useNavigation, useNavigationState } from '@react-navigation/native';
import { Fragment, useEffect, useState, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  Pressable,
  View,
  AppState,
  AppStateStatus,
  UIManager,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { UIOutlinedButton } from '../components/ui';
import { UIContainedButton, UIPINInput, UITypography } from '../components/ui';
import { styles } from './index.styled';
import MoFALogo from '../components/MoFALogo';
import MaintenanceScreen from './shared/maintenance/MaintenanceScreen';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEBUG_PIN_CODE = '114478';

export default function SplashScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const routes = useNavigationState(state => state.routes);
  const currentIndex = useNavigationState(state => state.index);

  const { setRole } = useRegisterStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const isMaintenanceMode = useAppConfigStore(state => state.isMaintenanceModeEnabled());
  const fetchUiFeatureToggles = useAppConfigStore(state => state.fetchUiFeatureToggles);
  const appState = useRef(AppState.currentState);
  const farmerTranslateX = useRef(new Animated.Value(-100)).current;
  const agentTranslateX = useRef(new Animated.Value(100)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const mofaLogoOpacity = useRef(new Animated.Value(0)).current;
  const oneTranslateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const twoTranslateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const isVideoNativeAvailable = Boolean(
    (UIManager as { getViewManagerConfig?: (name: string) => unknown }).getViewManagerConfig?.('RCTVideo'),
  );

  // Debug mode state
  const { isDebugMode, setDebugMode } = useDebugStore();
  const [showDebugPinModal, setShowDebugPinModal] = useState(false);
  const [debugPin, setDebugPin] = useState<string[]>(Array(6).fill(''));
  const [debugPinError, setDebugPinError] = useState('');
  const { bottom } = useSafeAreaInsets();

  // Tap counter for debug activation (tap 5 times within 3 seconds)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBackPressRef = useRef(0);

  // "Press again to exit" back handler
  useEffect(() => {
    if (!isFocused) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressRef.current = now;
      Toast.show({
        type: 'info',
        text1: 'Press again to exit',
      });
      return true;
    });
    return () => subscription.remove();
  }, [isFocused]);

  const handlePoweredByTap = () => {
    tapCountRef.current += 1;
    console.log(`[DEBUG TAP] Tap count: ${tapCountRef.current}, Platform: ${Platform.OS}`);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      console.log('[DEBUG TAP] Threshold reached! Opening debug PIN modal.');
      tapCountRef.current = 0;
      setDebugPin(Array(6).fill(''));
      setDebugPinError('');
      setShowDebugPinModal(true);
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      console.log('[DEBUG TAP] Timer expired, resetting tap count.');
      tapCountRef.current = 0;
    }, 3000);
  };

  const handleDebugPinVerify = () => {
    const enteredPin = debugPin.join('');
    if (enteredPin === DEBUG_PIN_CODE) {
      setDebugMode(true);
      setShowDebugPinModal(false);
      setDebugPin(Array(6).fill(''));
      Toast.show({
        type: 'success',
        text1: 'Debug Mode Enabled',
        text2: 'Debug mode has been activated.',
      });
    } else {
      setDebugPinError('Incorrect PIN. Please try again.');
      setDebugPin(Array(6).fill(''));
    }
  };

  const handleDisableDebug = () => {
    setDebugMode(false);
    setShowDebugPinModal(false);
    setDebugPin(Array(6).fill(''));
    Toast.show({
      type: 'info',
      text1: 'Debug Mode Disabled',
      text2: 'Debug mode has been deactivated.',
    });
  };

  const checkMaintenance = async () => {
    setCheckingMaintenance(true);
    try {
      await fetchUiFeatureToggles();
    } finally {
      setCheckingMaintenance(false);
    }
  };

  useEffect(() => {
    // Check maintenance mode on mount
    checkMaintenance();
  }, []);

  useEffect(() => {
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // When app comes back from background to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App has come to the foreground - checking maintenance mode');
        checkMaintenance();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (activeVideoIndex !== 1) {
      return;
    }

    mofaLogoOpacity.setValue(0);
    oneTranslateX.setValue(-SCREEN_WIDTH);
    twoTranslateX.setValue(-SCREEN_WIDTH);

    Animated.sequence([
      Animated.timing(mofaLogoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(oneTranslateX, {
        toValue: 0,
        speed: 14,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.spring(twoTranslateX, {
        toValue: 0,
        speed: 14,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeVideoIndex, mofaLogoOpacity, oneTranslateX, twoTranslateX]);

  useEffect(() => {
    if (!showLoginModal) {
      return;
    }

    farmerTranslateX.setValue(-100);
    agentTranslateX.setValue(100);
    ctaOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(ctaOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(farmerTranslateX, {
        toValue: 0,
        speed: 16,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.spring(agentTranslateX, {
        toValue: 0,
        speed: 16,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showLoginModal, farmerTranslateX, agentTranslateX, ctaOpacity]);

  useEffect(() => {
    if (
      hasCompletedIntro
      && routes[currentIndex]?.name === 'Splash'
      && !isMaintenanceMode
      && !checkingMaintenance
    ) {
      setShowLoginModal(true);
    }
  }, [hasCompletedIntro, routes, currentIndex, isMaintenanceMode, checkingMaintenance]);

  useEffect(() => {
    if (
      activeVideoIndex !== 1
      || showLoginModal
      || routes[currentIndex]?.name !== 'Splash'
      || isMaintenanceMode
      || checkingMaintenance
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLoginModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeVideoIndex, showLoginModal, routes, currentIndex, isMaintenanceMode, checkingMaintenance]);

  useEffect(() => {
    if (!isVideoNativeAvailable) {
      setHasCompletedIntro(true);
    }
  }, [isVideoNativeAvailable]);

  const handleAuth = (role: 'farmer' | 'agent') => {
    setShowLoginModal(false);
    setRole(role);
    navigation.navigate('FarmerAuthStack' as never);
  };

  const buttons = [
    { name: 'Login as Farmer', onPress: () => handleAuth('farmer') },
    { name: 'Login as Agent', onPress: () => handleAuth('agent') },
  ];

  const handleVideoEnd = () => {
    if (activeVideoIndex === 0) {
      setActiveVideoIndex(1);
      return;
    }

    setHasCompletedIntro(true);
  };

  const handleVideoError = () => {
    // Fallback to keep app entry usable if the intro file cannot be played.
    handleVideoEnd();
  };

  const handleSplashPress = () => {
    console.log(`[DEBUG SPLASH] handleSplashPress called, showLoginModal: ${showLoginModal}`);
    if (activeVideoIndex === 0 && !hasCompletedIntro) {
      setActiveVideoIndex(1);
      return;
    }

    if (hasCompletedIntro && routes[currentIndex]?.name === 'Splash') {
      setShowLoginModal(true);
    }
  };

  // Show maintenance screen if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenanceScreen fromSplash={true} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <TouchableOpacity
        style={styles.gradient}
        activeOpacity={1}
        onPress={handleSplashPress}
      >
        <View style={styles.topSection}>
          <View style={styles.videoTransitionContainer}>
            {isVideoNativeAvailable ? (
              <Reanimated.View
                key={`splash-video-${activeVideoIndex}`}
                style={styles.videoLayer}
                entering={FadeIn.duration(450)}
                exiting={FadeOut.duration(450)}
              >
                {activeVideoIndex === 0 ? (
                  <Video
                    key="splash-video-player-0"
                    source={require('../assets/images/splashscreen01.mp4')}
                    style={styles.image}
                    resizeMode="cover"
                    controls={false}
                    paused={!isFocused}
                    hideShutterView
                    shutterColor="transparent"
                    repeat={false}
                    onEnd={handleVideoEnd}
                    onError={handleVideoError}
                    muted={false}
                  />
                ) : (
                  <Image
                    key="splash-gif-player-1"
                    source={require('../assets/images/splashscreen02_anim.gif')}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
              </Reanimated.View>
            ) : (
              <Image
                style={styles.image}
                source={require('../assets/images/splash-icon.jpg')}
              />
            )}
            <TouchableOpacity
              style={styles.splashTapOverlay}
              activeOpacity={1}
              onPress={handleSplashPress}
            />
            {isVideoNativeAvailable && activeVideoIndex === 1 && (
              <View style={styles.video2OverlayContainer} pointerEvents="none">
                <Animated.View style={[styles.mofaLogo, { opacity: mofaLogoOpacity }]}>
                  <MoFALogo width="100%" height="100%" />
                </Animated.View>
                <View style={styles.video2SlideImagesContainer}>
                  <Animated.Image
                    source={require('../assets/images/One.png')}
                    style={[
                      styles.video2SlideImage,
                      styles.video2SlideImageOne,
                      { transform: [{ translateX: oneTranslateX }] },
                    ]}
                    resizeMode="contain"
                  />
                  <Animated.Image
                    source={require('../assets/images/Two.png')}
                    style={[styles.video2SlideImage, { transform: [{ translateX: twoTranslateX }] }]}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        {!isVideoNativeAvailable && !showLoginModal && (
          <Pressable
            style={styles.bottomSection}
            onPress={handlePoweredByTap}
          >
            <View style={styles.brandContainer}>
              <Image
                style={styles.logo}
                source={require('../assets/images/logo.png')}
              />
              <Text style={styles.brandSubtext}>Powered by Digitonic</Text>
            </View>
          </Pressable>
        )}
      </TouchableOpacity>

      {/* Login Modal */}

      <Modal animationType="none" visible={showLoginModal} transparent>
        {Platform.OS === 'ios' && showDebugPinModal ? (
          <View style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            paddingTop: 60,
            paddingHorizontal: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <TouchableOpacity onPress={() => setShowDebugPinModal(false)}>
                <UITypography variant="medium" style={{ fontSize: 16, color: '#666' }}>
                  Cancel
                </UITypography>
              </TouchableOpacity>
              <UITypography variant="medium" style={{ fontSize: 18 }}>
                {isDebugMode ? 'Debug Mode' : 'Enter Debug PIN'}
              </UITypography>
              <View style={{ width: 50 }} />
            </View>

            {isDebugMode ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <UITypography variant="medium" style={{ fontSize: 20, color: '#16A34A', marginBottom: 24 }}>
                  Debug Mode is Active
                </UITypography>
                <UIContainedButton onPress={handleDisableDebug}>
                  Disable Debug Mode
                </UIContainedButton>
              </View>
            ) : (
              <>
                <UITypography variant="regular" style={{ fontSize: 16, marginBottom: 24 }}>
                  Enter PIN to enable debug mode
                </UITypography>
                <View style={{ marginBottom: 24 }}>
                  <UIPINInput
                    code={debugPin}
                    setCode={c => {
                      setDebugPin(c);
                      if (debugPinError) setDebugPinError('');
                    }}
                    pinCount={6}
                    error={!!debugPinError}
                  />
                  {debugPinError ? (
                    <Text style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}>
                      {debugPinError}
                    </Text>
                  ) : null}
                </View>
                <View style={{ marginTop: 24, paddingBottom: bottom + 20 }}>
                  <UIContainedButton
                    disabled={debugPin.join('').length !== 6}
                    onPress={handleDebugPinVerify}
                  >
                    Verify
                  </UIContainedButton>
                </View>
              </>
            )}
          </View>
        ) : (
        <View style={styles.modalContent}>
          <View style={{ flex: 1 }} />
          <View style={[styles.buttonsContainer, { paddingBottom: 14 }]}>
            {buttons.map(({ name, onPress }, index) => (
              <Fragment key={name}>
                <Animated.View
                  style={[
                    styles.animatedButtonWrap,
                    {
                      opacity: ctaOpacity,
                      transform: [{
                        translateX: index === 0 ? farmerTranslateX : agentTranslateX,
                      }],
                    },
                  ]}
                >
                  <UIOutlinedButton
                    style={styles.button}
                    textStyle={styles.buttonText}
                    activeStyle={styles.buttonPressed}
                    onPress={onPress}
                  >
                    {name}
                  </UIOutlinedButton>
                </Animated.View>
              </Fragment>
            ))}
          </View>
          <Pressable
            onPress={handlePoweredByTap}
            hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
            style={{ alignSelf: 'center', paddingVertical: 16, paddingHorizontal: 20, marginBottom: 40, backgroundColor: 'transparent' }}
          >
            <Image
              source={require('../assets/images/splashscreen02.png')}
              style={{ width: 180, height: 34 }}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        )}
      </Modal>

      {/* Debug PIN Modal (Android only - iOS renders inside login modal) */}
      {Platform.OS !== 'ios' && (
      <Modal animationType="slide" visible={showDebugPinModal} transparent>
        <View style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          paddingTop: 40,
          paddingHorizontal: 24,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <TouchableOpacity onPress={() => setShowDebugPinModal(false)}>
              <UITypography variant="medium" style={{ fontSize: 16, color: '#666' }}>
                Cancel
              </UITypography>
            </TouchableOpacity>
            <UITypography variant="medium" style={{ fontSize: 18 }}>
              {isDebugMode ? 'Debug Mode' : 'Enter Debug PIN'}
            </UITypography>
            <View style={{ width: 50 }} />
          </View>

          {isDebugMode ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <UITypography variant="medium" style={{ fontSize: 20, color: '#16A34A', marginBottom: 24 }}>
                Debug Mode is Active
              </UITypography>
              <UIContainedButton onPress={handleDisableDebug}>
                Disable Debug Mode
              </UIContainedButton>
            </View>
          ) : (
            <>
              <UITypography variant="regular" style={{ fontSize: 16, marginBottom: 24 }}>
                Enter PIN to enable debug mode
              </UITypography>
              <View style={{ marginBottom: 24 }}>
                <UIPINInput
                  code={debugPin}
                  setCode={c => {
                    setDebugPin(c);
                    if (debugPinError) setDebugPinError('');
                  }}
                  pinCount={6}
                  error={!!debugPinError}
                />
                {debugPinError ? (
                  <Text style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}>
                    {debugPinError}
                  </Text>
                ) : null}
              </View>
              <View style={{ marginTop: 24, paddingBottom: bottom + 20 }}>
                <UIContainedButton
                  disabled={debugPin.join('').length !== 6}
                  onPress={handleDebugPinVerify}
                >
                  Verify
                </UIContainedButton>
              </View>
            </>
          )}
        </View>
      </Modal>
      )}
    </View>
  );
}
