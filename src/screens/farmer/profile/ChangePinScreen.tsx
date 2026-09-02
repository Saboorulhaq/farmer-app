import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography, UIContainedButton, UIPINInput } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import { axiosPrivate, axiosV1Private } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import { useFarmer } from '@/constants/context/farmer/context';

const PIN_COUNT = 6;
const COMMON_PINS = ['123456', '000000', '456789'];

export default function ChangePinScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { farmer } = useFarmer();
  const scrollRef = useRef<ScrollView>(null);
  const confirmPinY = useRef<number>(0);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState<string[]>(Array(PIN_COUNT).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(PIN_COUNT).fill(''));
  const [requesting, setRequesting] = useState(false);

  const [newPinError, setNewPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');
  const [touchedNew, setTouchedNew] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const newPinValue = newPin.join('');
  const confirmPinValue = confirmPin.join('');
  const isNewPinComplete = newPinValue.length === PIN_COUNT;
  const isConfirmPinComplete = confirmPinValue.length === PIN_COUNT;
  const isCommonPin = (value: string) => COMMON_PINS.includes(value);

  useEffect(() => {
    let newErr = '';
    let confirmErr = '';

    if (touchedNew) {
      if (!isNewPinComplete) newErr = 'Please enter your 6-digit PIN.';
      else if (!/^\d{6}$/.test(newPinValue)) newErr = 'PIN must be 6 digits.';
      else if (isCommonPin(newPinValue)) newErr = 'PIN is too common. Please choose a different PIN.';
    }

    if (touchedConfirm) {
      if (!isConfirmPinComplete) confirmErr = 'Please confirm your 6-digit PIN.';
      else if (newPinValue !== confirmPinValue) confirmErr = 'PINs do not match.';
    }

    setNewPinError(newErr);
    setConfirmPinError(confirmErr);

    setIsValid(
      currentPin.length === PIN_COUNT &&
      !newErr &&
      !confirmErr &&
      isNewPinComplete &&
      isConfirmPinComplete &&
      newPinValue === confirmPinValue &&
      !isCommonPin(newPinValue),
    );
  }, [currentPin, newPinValue, confirmPinValue, touchedNew, touchedConfirm, isNewPinComplete, isConfirmPinComplete]);

  const handleUpdatePin = async () => {
    try {
      setRequesting(true);

      // Step 1: Verify that the current PIN is correct
      try {
        const pinResponse = await axiosV1Private.post('/auth/user_sessions/verify_current_pin', {
          data: {
            attributes: {
              current_pin: currentPin,
            },
          },
        });
        if (!pinResponse?.data?.data?.valid) {
          Toast.error(
            pinResponse?.data?.meta?.message || 'Incorrect PIN. Please try again.',
          );
          return;
        }
      } catch (pinError: any) {
        if (!pinError?.__handledGlobally) {
          Toast.error(
            pinError?.response?.data?.meta?.message ||
              pinError?.response?.data?.message ||
              'Incorrect PIN. Please try again.',
          );
        }
        return;
      }

      // Step 2: PIN is correct — request OTP to proceed with change
      await axiosPrivate.post('/users/request_otp', {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            skip_count_check: true,
          },
        },
      });
      navigation.navigate('LoanRequestOTPVerification', {
        mode: 'changePin',
        currentPin,
        newPin: newPinValue,
        confirmPin: confirmPinValue,
      });
    } catch (error: any) {
      if (!error?.__handledGlobally) {
        Toast.error(
          error?.response?.data?.message ||
            'Failed to send verification code. Please try again.',
        );
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="Change PIN"
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          {/* Current PIN — plain text input, no validation needed */}
          <View style={s.fieldGroup}>
            <UITypography variant="medium" style={s.fieldLabel}>
              Current PIN
            </UITypography>
            <TextInput
              style={s.fieldInput}
              value={currentPin}
              onChangeText={setCurrentPin}
              placeholder="••••••"
              placeholderTextColor="#EDEDED"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={PIN_COUNT}
            />
            <View style={s.divider} />
          </View>

          {/* New PIN */}
          <View style={s.fieldGroup}>
            <UITypography variant="medium" style={s.fieldLabel}>
              New PIN
            </UITypography>
            <View style={s.pinInputWrapper}>
              <UIPINInput
                code={newPin}
                setCode={c => {
                  setNewPin(c);
                  if (!touchedNew) setTouchedNew(true);
                  if (newPinError) setNewPinError('');
                }}
                pinCount={PIN_COUNT}
                error={!!newPinError}
              />
            </View>
            {newPinError ? (
              <Text style={s.errorText}>{newPinError}</Text>
            ) : null}
          </View>

          {/* Confirm New PIN */}
          <View
            style={s.fieldGroup}
            onLayout={e => {
              confirmPinY.current = e.nativeEvent.layout.y;
            }}
          >
            <UITypography variant="medium" style={s.fieldLabel}>
              Confirm New PIN
            </UITypography>
            <View
              style={s.pinInputWrapper}
              onTouchStart={() => {
                scrollRef.current?.scrollTo({ y: confirmPinY.current, animated: true });
              }}
            >
              <UIPINInput
                code={confirmPin}
                setCode={c => {
                  setConfirmPin(c);
                  if (!touchedConfirm) setTouchedConfirm(true);
                  if (confirmPinError) setConfirmPinError('');
                }}
                pinCount={PIN_COUNT}
                error={!!confirmPinError}
              />
            </View>
            {confirmPinError ? (
              <Text style={s.errorText}>{confirmPinError}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.buttonContainer}>
          <UIContainedButton
            onPress={handleUpdatePin}
            loading={requesting}
            disabled={!isValid}
            size="large"
            key={isValid ? 'enabled' : 'disabled'}
          >
            Update PIN
          </UIContainedButton>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  fieldInput: {
    fontSize: 20,
    color: '#101010',
    lineHeight: 30,
    letterSpacing: 2,
    paddingVertical: 0,
    fontFamily: 'Poppins-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 16,
  },
  pinInputWrapper: {
    width: '100%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 8,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
});
