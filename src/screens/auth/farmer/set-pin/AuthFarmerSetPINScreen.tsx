import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPrivate } from '@/config/axios';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerSetPINScreen.styled';
import { useAuth } from '@/constants/context/auth/context';
import EyeOpenedIcon from '@/components/icons/EyeOpenedIcon';
import EyeClosedIcon from '@/components/icons/EyeClosedIcon';
import * as Sentry from '@sentry/react-native';
export default function AuthFarmerSetPINScreen() {
  const { handleTrustedCard, checkAuth, setCurrentAuthedRole, setIsLoggedIn } =
    useAuth();
  const PIN_COUNT = 6;
  const { navigate, replace } = useNavigation<FarmerAuthNavigationProp>();
  const { top, bottom } = useSafeAreaInsets();
  const { role, userDetails } = useRegisterStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
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
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const netInfo = useNetInfo();
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

    // --- Validate PIN field ---
    if (touchedPin) {
      if (!isPinComplete) pinErr = 'Please enter your 6-digit PIN.';
      else if (!/^\d{6}$/.test(pinValue)) pinErr = 'PIN must be 6 digits.';
      else if (isCommonPin(pinValue))
        pinErr = 'PIN is too common. Please choose a different PIN.';
    }

    // --- Validate confirm PIN field ---
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
            pin: pinValue,
            pin_confirmation: confirmPinValue,
            source_flow: role,
            device_id: uniqueId,
          },
        },
      };
      const response = await axiosPrivate.post('/users/set_pin', payload);
      handleTrustedCard(role, userDetails.ghana_card_number, userDetails.name);
      setIsLoggedIn(true);
      await checkAuth();
      setCurrentAuthedRole('farmer');
      navigate('FarmerNavigation' as never);

      Toast.show({
        type: 'success',
        text1: 'Verification Successful',
        text2: response.data.meta.message,
      });
      if (role === 'farmer') {
        replace('Details');
      } else {
        replace('FarmerSuccess');
      }
    } catch (error: any) {
     Sentry.captureException(error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.response?.data?.error || 'Invalid OTP. Please try again.',
      });

      // Check if it's a network error
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
      <AuthHeader title="Create account" />
      <ScrollView
        style={{
          flex: 1,
          paddingTop: 64,
          paddingBottom: Platform.OS === 'ios' ? bottom : bottom + 20,
        }}
        contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
      >
        <UITypography variant="regular" style={styles.contentTitle}>
          Next, let’s create your PIN
        </UITypography>
        <View style={{ flex: 1, width: '100%', marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <UITypography variant="regular" style={{ fontSize: 16 }}>
              Create New PIN
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
              <Text style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}>
                {pinError}
              </Text>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <UITypography variant="regular" style={{ fontSize: 16 }}>
              Confirm PIN
            </UITypography>
            <TouchableOpacity onPress={() => setShowConfirmPin(prev => !prev)}>
              {!showConfirmPin ? <EyeOpenedIcon /> : <EyeClosedIcon />}
            </TouchableOpacity>
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
            />
            {confirmPinError ? (
              <Text style={{ color: '#D32F2F', marginTop: 8, fontSize: 13 }}>
                {confirmPinError}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.footer}>
          <UIContainedButton
            key={isValid ? 'enabled' : 'disabled'}
            loading={loading}
            disabled={!isValid}
            onPress={handleSubmit}
          >
            Next
          </UIContainedButton>
          {isDebugMode && (
            <UITypography
              variant="semiBold"
              style={{
                fontSize: 16,
                color: '#E53935',
                textDecorationLine: 'underline',
                textAlign: 'center',
                marginTop: 16,
              }}
              onPress={() => {
                if (role === 'farmer') {
                  replace('Details');
                } else {
                  replace('FarmerSuccess');
                }
              }}
            >
              Skip
            </UITypography>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
