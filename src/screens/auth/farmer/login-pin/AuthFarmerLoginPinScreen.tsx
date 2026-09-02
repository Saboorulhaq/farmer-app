import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { useAuth } from '@/constants/context/auth/context';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useProductSubmissionStore } from '@/store/useProductSubmissionStore';
import { setAuthToken } from '@/util/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerLoginPinScreen.styled';
import {
  ERROR_MESSAGES,
  initialPIN,
  PIN_COUNT,
  PINRouteProp,
} from './ts/constants';
import { DEBUG_PIN } from '@env';
// Biometric login feature commented out
// import FingerprintIcon from '@/components/icons/FingerprintIcon';

export default function AuthFarmerLoginPinScreen() {
  const {
    getCardNumber,
    getCardName,
    handleTrustedCard,
    setCurrentAuthedRole,
    setIsLoggedIn,
    updateCardStatus,
    removeTrustedCard,
    hasTrustedActiveCard,
    handleLogout,
    // Biometric login feature commented out
    // biometricsAvailable,
    // isBiometricLoginEnabled,
    // getBiometricCardNumber,
    // loginWithBiometrics,
    // enableBiometricLogin,
    // disableBiometricLogin,
    // refreshBiometricToken,
    // biometricEnabledForFarmer,
    // biometricEnabledForAgent,
    loading: authLoading,
  } = useAuth();
  const route = useRoute<PINRouteProp>();
  const { redirect } = route.params || {};
  const { role, userDetails, updateUserDetailsField, setSwitchAccountRequested } =
    useRegisterStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const { navigate, replace } = useNavigation<FarmerAuthNavigationProp>();
  const { top, bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState<string[]>(
    isDebugMode && DEBUG_PIN ? DEBUG_PIN.split('') : initialPIN,
  );
  const [pinError, setPinError] = useState('');
  const [touchedPin, setTouchedPin] = useState(false);
  const pinValue = pin.join('');
  const isPinComplete = pinValue.length === PIN_COUNT;
  const [uniqueId, setUniqueId] = useState('');
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  // Biometric login feature commented out
  // const [showBiometricPromptModal, setShowBiometricPromptModal] = useState(false);
  // const [pendingAuthToken, setPendingAuthToken] = useState<string | null>(null);

  useEffect(() => {
    getUniqueId()
      .then(id => setUniqueId(id))
      .catch(() => setUniqueId(''));
  }, []);
  // Biometric login feature commented out
  /*
  const biometricEnabled =
    role === 'farmer' ? biometricEnabledForFarmer : biometricEnabledForAgent;

  // Check if biometric belongs to the current user
  const currentCardNumber = getCardNumber(role, userDetails.ghana_card_number);
  const biometricCardNumber = getBiometricCardNumber(role);
  const normalizeCard = (c: string) =>
    (c || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const biometricBelongsToCurrentUser =
    !!biometricCardNumber &&
    !!currentCardNumber &&
    normalizeCard(biometricCardNumber) === normalizeCard(currentCardNumber);
  const shouldAllowBiometric =
    biometricEnabled && biometricBelongsToCurrentUser;
  */

  useEffect(() => {
    let pinErr = '';

    if (touchedPin) {
      if (!isPinComplete) pinErr = 'Please enter your 6-digit PIN.';
      else if (!/^\d{6}$/.test(pinValue)) pinErr = 'PIN must be 6 digits.';
    }

    setPinError(pinErr);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinValue, touchedPin]);
  console.log(userDetails.ghana_card_number);

  const handlePostLoginNavigation = async () => {
    if (redirect) {
      replace(redirect);
    } else if (role === 'agent' || role === 'farmer') {
      setSwitchAccountRequested(false);
      setCurrentAuthedRole(role);
      setIsLoggedIn(true);
    }
  };

  const VerifyPIN = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          attributes: {
            ghana_card_number: getCardNumber(
              role,
              userDetails.ghana_card_number,
            ),
            pin: pinValue,
            device_id: uniqueId,
          },
        },
      };

      const response = await axiosPublic.post(
        '/user_sessions/login_with_pin',
        payload,
      );
      const { attributes } = response.data?.data;
      const meta = response.data?.meta;
      await setAuthToken(meta?.auth_token);

      // Clear any stale error states from previous session to prevent
      // "Failed to load application" errors after re-authentication
      useProductsStore.getState().clearErrors();
      useProductSubmissionStore.getState().clearErrors();

      await handleTrustedCard(
        role,
        getCardNumber(role, userDetails.ghana_card_number),
        attributes.name,
      );

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: meta?.message || 'You have logged in successfully.',
      });

      // Biometric login feature commented out — navigate directly after login
      await handlePostLoginNavigation();
      /*
      if (biometricsAvailable && meta?.auth_token && !isBiometricLoginEnabled(role)) {
        setPendingAuthToken(meta.auth_token);
        setShowBiometricPromptModal(true);
      } else if (biometricsAvailable && meta?.auth_token && isBiometricLoginEnabled(role)) {
        // Refresh the biometric token and update the stored card number
        await refreshBiometricToken(role, meta.auth_token, {
          ghana_card_number: getCardNumber(role, userDetails.ghana_card_number),
          pin: pinValue,
          device_id: uniqueId,
        });
        await handlePostLoginNavigation();
      } else {
        await handlePostLoginNavigation();
      }
      */
    } catch (error: any) {
      trigger('notificationError');
      const data = error?.response?.data;
      const errorCode = data?.code;
      const meta = data?.meta;

      let message = 'An unexpected error occurred.';
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        const msg = ERROR_MESSAGES[errorCode];
        console.log(meta);
        message = typeof msg === 'function' ? msg(meta) : msg;
      } else if (data?.error) {
        message = data.error;
      }
      const account_locked = errorCode === 'ACCOUNT_LOCKED';
      if (account_locked) {
        await updateCardStatus(role, 'locked');
        replace('AccountLocked');
      }

      setPin(initialPIN);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = isPinComplete && !pinError;
  const cardName = getCardName(role);

  const handleSwitchAccount = async () => {
    try {
      setSwitchAccountRequested(true);
      // Biometric login feature commented out
      // await disableBiometricLogin(role);
      await removeTrustedCard(role);

      await handleLogout();

      navigate('FarmerMain');
    } catch (error) {
      console.log('Error switching account:', error);
      Toast.show({
        type: 'error',
        text1: 'Switch Account Failed',
        text2: 'Failed to switch account. Please try again.',
      });
    } finally {
      setShowSwitchAccountModal(false);
    }
  };

  const handleReset = () => {
    updateUserDetailsField(
      'ghana_card_number',
      getCardNumber(role, userDetails.ghana_card_number || ''),
    );
    navigate('OTPVerification', {
      redirect: 'ResetPIN',
      resend: true,
      login: true,
    } as never);
  };

  // Biometric login feature commented out
  /*
  const handleBiometricPromptYes = async () => {
    if (pendingAuthToken) {
      await enableBiometricLogin(
        role,
        pendingAuthToken,
        getCardNumber(role, userDetails.ghana_card_number),
        { pin: pinValue, device_id: uniqueId },
      );
    }
    setPendingAuthToken(null);
    setShowBiometricPromptModal(false);
    await handlePostLoginNavigation();
  };

  const handleBiometricPromptNotNow = async () => {
    setPendingAuthToken(null);
    setShowBiometricPromptModal(false);
    await handlePostLoginNavigation();
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithBiometrics(role);

      if (result === 'cancelled') {
        return;
      }

      if (result === false) {
        Toast.show({
          type: 'error',
          text1: 'Biometric login unavailable',
          text2:
            'Your session has expired. Please log in with your PIN to continue.',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'Login successful',
        text2: 'You have logged in successfully.',
      });
      await handlePostLoginNavigation();
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <ScrollView
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
          paddingBottom: Platform.OS === 'ios' ? bottom : bottom + 20,
        },
      ]}
      contentContainerStyle={styles.scrollViewContainer}
    >
      <AuthHeader title="Enter PIN" />
      <View style={styles.mainContainer}>
        {cardName ? (
          <UITypography variant="regular" style={styles.contentTitle}>
            {`Welcome, ${cardName}`}
          </UITypography>
        ) : null}
        {!hasTrustedActiveCard && (
          <UITypography variant="regular" style={styles.contentTitle}>
            Enter your 6-digit PIN to continue.
          </UITypography>
        )}
        <View style={styles.loginContainer}>
          <UITypography variant="regular" style={styles.enterPinText}>
            Enter PIN
          </UITypography>
          <View style={styles.formContainer}>
            <UIPINInput
              // editable={!accountLocked}
              code={pin}
              setCode={c => {
                setPin(c);
                if (!touchedPin) setTouchedPin(true);
                if (pinError) setPinError('');
              }}
              pinCount={PIN_COUNT}
              error={!!pinError}
            />
            {pinError ? (
              <Text style={styles.pinErrorText}>{pinError}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={handleReset}
            style={{ alignSelf: 'flex-end' }}
          >
            <UITypography
              variant="semiBold"
              style={{
                color: '#16A34A',
                textDecorationLine: 'underline',
                fontSize: 14,
              }}
            >
              Forgot PIN?
            </UITypography>
          </TouchableOpacity>
          {/* Biometric login feature commented out
          {biometricsAvailable && shouldAllowBiometric && (
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={{
                alignSelf: 'center',
                marginTop: 16,
                marginBottom: 4,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#F0FDF4',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FingerprintIcon width={32} height={32} color="#16A34A" />
            </TouchableOpacity>
          )}
          */}
        </View>
        <View style={styles.footer}>
          {hasTrustedActiveCard(role) && (
            <TouchableOpacity
              onPress={() => setShowSwitchAccountModal(true)}
              style={{ alignSelf: 'center', marginBottom: 40 }}
            >
              <UITypography
                variant="semiBold"
                style={{ color: '#16A34A', fontSize: 16 }}
              >
                Switch Account
              </UITypography>
            </TouchableOpacity>
          )}
          <UIContainedButton
            key={isValid ? 'enabled' : 'disabled'}
            loading={loading}
            onPress={VerifyPIN}
            disabled={!isValid}
          >
            Verify
          </UIContainedButton>
        </View>
      </View>
      <Modal visible={showSwitchAccountModal} backdropColor="#000000CC">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <UITypography
            variant="medium"
            style={{ fontSize: 36, color: '#FFFFFF', marginBottom: 18 }}
          >
            Switch Account
          </UITypography>
          <UITypography
            variant="medium"
            style={{
              fontSize: 16,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            You will be logged out of this device.{'\n'}Continue?
          </UITypography>
          <UIContainedButton
            onPress={handleSwitchAccount}
            style={{ width: '100%', marginBottom: 18 }}
          >
            Yes
          </UIContainedButton>
          <Pressable
            onPress={() => setShowSwitchAccountModal(false)}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 30,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <UITypography
              variant="medium"
              style={{ fontSize: 16, color: '#000' }}
            >
              No
            </UITypography>
          </Pressable>
        </View>
      </Modal>
      {/* Biometric login feature commented out
      <Modal visible={showBiometricPromptModal} backdropColor="#000000CC">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <UITypography
            variant="medium"
            style={{
              fontSize: 22,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Use Face ID / fingerprint to log in next time?
          </UITypography>
          <UITypography
            variant="regular"
            style={{
              fontSize: 16,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 32,
              opacity: 0.9,
            }}
          >
            You can skip entering your PIN and sign in with your device
            biometrics.
          </UITypography>
          <UIContainedButton
            onPress={handleBiometricPromptYes}
            style={{ width: '100%', marginBottom: 12 }}
          >
            Yes, use biometrics
          </UIContainedButton>
          <Pressable
            onPress={handleBiometricPromptNotNow}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UITypography
              variant="medium"
              style={{ fontSize: 16, color: '#FFFFFF' }}
            >
              Not now
            </UITypography>
          </Pressable>
        </View>
      </Modal>
      */}
    </ScrollView>
  );
}
