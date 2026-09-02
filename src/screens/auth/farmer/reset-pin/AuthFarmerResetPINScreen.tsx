import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPrivate } from '@/config/axios';
import { useAuth } from '@/constants/context/auth/context';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerResetPINScreen.styled';
import EyeOpenedIcon from '@/components/icons/EyeOpenedIcon';
import EyeClosedIcon from '@/components/icons/EyeClosedIcon';
import * as Sentry from '@sentry/react-native';

export default function AuthFarmerResetPINScreen() {
  const PIN_COUNT = 6;
  const { replace } = useNavigation<FarmerAuthNavigationProp>();
  const { top, bottom } = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { role, userDetails } = useRegisterStore();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState<string[]>(Array(PIN_COUNT).fill(''));
  const [confirmPin, setConfirmPIn] = useState<string[]>(
    Array(PIN_COUNT).fill(''),
  );
  const [pinError, setPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');
  const [touchedPin, setTouchedPin] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const netInfo = useNetInfo();
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const { removeTrustedCard } = useAuth();
  const pinValue = pin.join('');
  const confirmPinValue = confirmPin.join('');
  const isPinComplete = pinValue.length === PIN_COUNT;
  const isConfirmPinComplete = confirmPinValue.length === PIN_COUNT;

  const isCommonPin = (value: string) =>
    ['123456', '000000', '456789'].includes(value);

  useEffect(() => {
    getUniqueId()
      .then(id => setUniqueId(id))
      .catch(() => setUniqueId(''));
  }, []);

  useEffect(() => {
    let pinErr = '';
    let confirmErr = '';

    if (touchedPin) {
      if (!isPinComplete) pinErr = 'Please enter your 6-digit PIN.';
      else if (!/^\d{6}$/.test(pinValue)) pinErr = 'PIN must be 6 digits.';
      else if (isCommonPin(pinValue))
        pinErr = 'PIN is too common. Please choose a different PIN.';
    }

    if (touchedConfirm) {
      if (!isConfirmPinComplete)
        confirmErr = 'Please confirm your 6-digit PIN.';
      else if (pinValue !== confirmPinValue) confirmErr = 'PINs do not match.';
    }

    setPinError(pinErr);
    setConfirmPinError(confirmErr);

    // --- Determine overall validity ---
    const valid =
      !pinErr &&
      !confirmErr &&
      isPinComplete &&
      isConfirmPinComplete &&
      pinValue === confirmPinValue &&
      !isCommonPin(pinValue);

    setIsValid(valid);
  }, [
    pinValue,
    confirmPinValue,
    touchedPin,
    touchedConfirm,
    isPinComplete,
    isConfirmPinComplete,
  ]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          attributes: {
            new_pin: pinValue,
            new_pin_confirmation: confirmPinValue,
          },
        },
      };
      const response = await axiosPrivate.post(
        '/user_sessions/reset_pin',
        payload,
      );

      removeTrustedCard(role);

      Toast.show({
        type: 'success',
        text1: 'Verification Successful',
        text2: response.data.meta.message,
      });

      replace('FarmerMain');
    } catch (error: any) {
        Sentry.captureException(error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.response?.data?.error || 'Invalid OTP. Please try again.',
      });

      if (
        !netInfo.isConnected ||
        error.code === 'NETWORK_ERROR' ||
        !error?.response
      ) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection and try again',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      <AuthHeader title="Reset PIN" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          height: height - (top + bottom + 20 + 24),
          paddingTop: 64,
          justifyContent: 'space-between',
        }}
      >
        <View>
          <UITypography variant="regular" style={styles.contentTitle}>
            Welcome back, please reset your PIN
          </UITypography>
          <View
            style={{
              width: '100%',
              marginTop: 32,
            }}
          >
            <View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <UITypography variant="regular" style={{ fontSize: 16 }}>
                  New PIN
                </UITypography>
                <TouchableOpacity onPress={() => setShowNewPin(prev => !prev)}>
                  {!showNewPin ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 16, marginBottom: 40 }}>
                <UIPINInput
                  code={pin}
                  setCode={c => {
                    setPin(c);
                    if (!touchedPin) setTouchedPin(true);
                    if (pinError) setPinError('');
                  }}
                  pinCount={PIN_COUNT}
                  error={!!pinError}
                  secure={!showNewPin}
                />

                {pinError ? (
                  <Text
                    style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}
                  >
                    {pinError}
                  </Text>
                ) : null}
              </View>
            </View>
            <View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <UITypography variant="regular" style={{ fontSize: 16 }}>
                  Confirm PIN
                </UITypography>
                <TouchableOpacity onPress={() => setShowConfirmPin(prev => !prev)}>
                  {!showConfirmPin ? <EyeOpenedIcon /> : <EyeClosedIcon />}
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ marginTop: 16, marginBottom: 8 }}>
              <UIPINInput
                code={confirmPin}
                setCode={c => {
                  setConfirmPIn(c);
                  if (!touchedConfirm) setTouchedConfirm(true);
                  if (confirmPinError) setConfirmPinError('');
                }}
                pinCount={PIN_COUNT}
                error={!!confirmPinError}
                secure={!showConfirmPin}
                // editable={isPinComplete}
              />
              {confirmPinError ? (
                <Text style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}>
                  {confirmPinError}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Platform.OS === 'ios' ? bottom : bottom + 20,
            },
          ]}
        >
          <UIContainedButton
            key={isValid ? 'enabled' : 'disabled'}
            loading={loading}
            disabled={!isValid}
            onPress={handleSubmit}
          >
            Next
          </UIContainedButton>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
