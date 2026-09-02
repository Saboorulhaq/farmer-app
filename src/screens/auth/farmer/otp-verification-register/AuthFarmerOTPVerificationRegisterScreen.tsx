import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { DEBUG_OTP } from '@/constants/testing/registrationDebugData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { maskPhoneNumber } from '@/util/formatPhoneNumber';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, ScrollView, View } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerOTPVerificationRegisterScreen.styled';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import * as Sentry from '@sentry/react-native';

const ResendTimer = memo(
  ({
    onResend,
    isResending,
    isBlocked: _isBlocked,
    timer,
  }: {
    onResend: () => void;
    isResending: boolean;
    isBlocked: boolean;
    timer: number;
  }) => {
    if (timer > 0) {
      return <UITypography>{`Resend in ${timer}s`}</UITypography>;
    }
    if (isResending) {
      return <UITypography>Resending...</UITypography>;
    }
    return (
      <UITypography
        variant="semiBold"
        style={styles.resendLink}
        onPress={onResend}
        disabled={isResending}
      >
        Resend code
      </UITypography>
    );
  },
);

export default function AuthFarmerOTPVerificationRegisterScreen() {
  const PIN_COUNT = 6;
  const initialPin = Array(PIN_COUNT).fill('');
  const RESEND_TIME_LIMIT = 120;
  const MAX_FAILED_ATTEMPTS = 3;
  const BLOCK_DURATION = 30 * 60 * 1000;
  const FAILED_ATTEMPTS_KEY = 'failed_otp_attempts_';

  const { goBack, replace } = useNavigation<FarmerAuthNavigationProp>();
  const { userDetails, farmDetails, resetUserDetails } = useRegisterStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const { reset } = useFarmerIdCardStore();
  const { top, bottom } = useSafeAreaInsets();
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const isVerifyingRef = useRef(false);
  const [otpCode, setOtpCode] = useState<string[]>(
    isDebugMode ? DEBUG_OTP.split('') : initialPin,
  );
  const [error, setError] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIME_LIMIT);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isEditable, setIsEditable] = useState(true);

  // Store target end times as refs to persist across background/foreground transitions
  const resendTimerEndRef = useRef<number>(Date.now() + RESEND_TIME_LIMIT * 1000);
  const blockTimerEndRef = useRef<number>(0);

  const netInfo = useNetInfo();

  useEffect(() => {
    const checkBlockingStatus = async () => {
      const blockKey = `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`;
      const blockData = await AsyncStorage.getItem(blockKey);
      if (blockData) {
        const { blockedUntil } = JSON.parse(blockData);
        const currentTime = Date.now();

        if (blockedUntil > currentTime) {
          setIsBlocked(true);
          setIsEditable(false);
          blockTimerEndRef.current = blockedUntil;
          setBlockTimeRemaining(blockedUntil - currentTime);
        } else {
          await AsyncStorage.removeItem(blockKey);
        }
      }
    };

    checkBlockingStatus();
  }, [userDetails.phone_number]);

  // Block countdown timer with background time handling
  useEffect(() => {
    if (blockTimeRemaining <= 0) return;

    // Set the target end time when block starts
    if (blockTimerEndRef.current === 0 || blockTimerEndRef.current < Date.now()) {
      blockTimerEndRef.current = Date.now() + blockTimeRemaining;
    }

    const interval = setInterval(() => {
      const remaining = blockTimerEndRef.current - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        setIsBlocked(false);
        setIsEditable(true);
        setBlockTimeRemaining(0);
        blockTimerEndRef.current = 0;
        AsyncStorage.removeItem(
          `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`,
        );
        return;
      }

      setBlockTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [blockTimeRemaining > 0, userDetails.phone_number]);

  useEffect(() => {
    const code = otpCode.join('');
    setIsCodeComplete(code.length === PIN_COUNT);
  }, [otpCode]);

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    try {
      let attributes: { phone_number?: string; email?: string; flow?: string } = {
        phone_number: userDetails.phone_number,
        ...(userDetails.email ? { email: userDetails.email } : {}),
        flow: 'REGISTRATION_OTP',
      };

      const payload = {
        data: {
          attributes,
        },
      };
      const response = await axiosPublic.post('/users/resend_otp', payload);

      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: response.data?.data?.attributes?.message,
      });

      setIsBlocked(false);
      setIsEditable(true);

      const cooldownSeconds =
        response.data?.meta?.seconds_remaining || RESEND_TIME_LIMIT;
      resendTimerEndRef.current = Date.now() + cooldownSeconds * 1000;
      setResendTimer(cooldownSeconds);
    } catch (err: any) {
      trigger('notificationError');
      const errorMessage =
        err?.response?.data?.error || 'An unexpected error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Failed to Resend Code',
        text2: errorMessage,
      });

      // Use backend-provided cooldown time if available
      if (err?.response?.data?.meta?.seconds_remaining) {
        const cooldownSeconds = err.response.data.meta.seconds_remaining;
        resendTimerEndRef.current = Date.now() + cooldownSeconds * 1000;
        setResendTimer(cooldownSeconds);
      } else if (errorMessage.includes('OTP has expired')) {
        resendTimerEndRef.current = 0;
        setResendTimer(0);
      } else if (
        errorMessage.includes('You have reached the maximum attempts.')
      ) {
        setIsBlocked(true);
        setIsEditable(false);
      }
    } finally {
      setIsResending(false);
    }
  }, [userDetails.phone_number]);

  // Resend timer with background time handling
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((resendTimerEndRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        setResendTimer(0);
        return;
      }

      setResendTimer(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer > 0]);

  // Handle app state changes to recalculate timers when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Recalculate resend timer
        const resendRemaining = Math.ceil((resendTimerEndRef.current - Date.now()) / 1000);
        setResendTimer(resendRemaining > 0 ? resendRemaining : 0);

        // Recalculate block timer
        if (blockTimerEndRef.current > 0) {
          const blockRemaining = blockTimerEndRef.current - Date.now();
          if (blockRemaining > 0) {
            setBlockTimeRemaining(blockRemaining);
          } else {
            setBlockTimeRemaining(0);
            setIsBlocked(false);
            setIsEditable(true);
            blockTimerEndRef.current = 0;
            AsyncStorage.removeItem(
              `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`,
            );
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [userDetails.phone_number]);

  const getMaskedEmail = () => {
    const { email } = userDetails;
    if (!email) return null;

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return null;

    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    const maskedLocal = `${firstChar}${'*'.repeat(Math.min(6, localPart.length - 2))}${lastChar}`;
    return `${maskedLocal}@${domain}`;
  };

  const handleSubmit = async () => {
    // Debug Mode: skip OTP verification + registration API and show success.
    if (isDebugMode) {
      trigger('notificationSuccess');
      reset();
      resetUserDetails();
      replace('FarmerSuccess');
      return;
    }

    if (isVerifyingRef.current) {
      return;
    }

    if (isBlocked) {
      trigger('notificationError');
      Toast.show({
        type: 'error',
        text1: 'Account Blocked',
        text2: 'Too many failed attempts. Please try again later.',
      });
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);
    try {
      let attributes: { phone_number: string; otp: string; email?: string; flow?: string } = {
        otp: otpCode.join(''),
        phone_number: userDetails.phone_number,
        ...(userDetails.email ? { email: userDetails.email } : {}),
        flow: 'REGISTRATION_OTP',
      };

      const payload = {
        data: { attributes },
      };

      const response = await axiosPublic.post('/users/verify_otp', payload);
      console.log(response);

      const {
        data: {
          attributes: { phone_verified },
        },
      } = response.data;
      console.log(phone_verified);
      if (phone_verified) {
        const _payload = {
          basic_details: {
            ghana_card_number: userDetails.ghana_card_number,
            name: userDetails.name,
            phone_number: userDetails.phone_number,
            email: userDetails.email,
            ...(userDetails.residential_address && userDetails.residential_address.trim() !== '' && { address: userDetails.residential_address }),
            pin: userDetails.pin,
            confirm_pin: userDetails.confirm_pin,
          },
          primary_role: userDetails.primary_role,
          registration_mode: userDetails.registration_mode,
          card_detected: userDetails.card_detected,
          details_changed: userDetails.details_changed,
          source_flow: userDetails.source_flow,
          card_details: {
            country_code: userDetails.country_code,
            issue_date: userDetails.issue_date,
            expiry_date: userDetails.expiry_date,
            date_of_birth: userDetails.date_of_birth,
            first_name: userDetails.first_name,
            full_name: userDetails.full_name,
            full_name_native: userDetails.full_name_native,
            parent_or_spouse_name: userDetails.parent_or_spouse_name,
            parent_or_spouse_name_native:
              userDetails.parent_or_spouse_name_native,
            nationality: userDetails.nationality,
            other_names: userDetails.other_names,
            sex: userDetails.sex,
            surname: userDetails.surname,
            present_address_native: userDetails.present_address_native,
            present_address_romanized: userDetails.present_address_romanized,
            permanent_address_native: userDetails.permanent_address_native,
            permanent_address_romanized:
              userDetails.permanent_address_romanized,
            document_number: userDetails.document_number,
            document_type: userDetails.document_type,
            raw_mrz: userDetails.raw_mrz,
            front_image: userDetails.front_image,
            back_image: userDetails.back_image,
          },
          farm_details: {
            ownsFarm: farmDetails.ownsFarm,
            primaryCrops: farmDetails.primaryCrops,
            secondaryCrops: farmDetails.secondaryCrops,
            farmSize: farmDetails.farmSize,
            farmSizeUnit: farmDetails.farmSizeUnit,
            ...(farmDetails.gpsNumber && farmDetails.gpsNumber.trim() !== '' && { gpsNumber: farmDetails.gpsNumber }),
            ...(farmDetails.addressLine && farmDetails.addressLine.trim() !== '' && { address: farmDetails.addressLine }),
            ...(farmDetails.lat != null && { lat: farmDetails.lat }),
            ...(farmDetails.long != null && { long: farmDetails.long }),
            ...(farmDetails.accuracy != null && { accuracy: farmDetails.accuracy }),
          },
        };

        const _response = await axiosPublic.post(
          '/users/complete_registration',
          _payload,
        );

        const { data: _data } = _response.data;
        console.log(_data);

        replace('FarmerSuccess');
        reset();
        resetUserDetails();
        trigger('notificationSuccess');
      }
    } catch (err: any) {
      Sentry.captureException(err);
      console.log('🔴 Error caught:', err?.response?.data);

      // Check for validation errors from complete_registration endpoint FIRST
      // Before clearing OTP or showing generic error
      const responseData = err?.response?.data;
      const validationErrors = responseData?.errors;

      console.log('🔍 Checking for validation errors:', validationErrors);

      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        // This is a validation error (e.g., invalid GPS), not an OTP error
        console.log('✅ Validation errors detected, showing custom message');

        trigger('notificationError');

        // Display validation error(s) to user
        const errorMessages = validationErrors
          .map((error: any) => error.short_error || error.error)
          .join('\n');

        console.log('📢 Showing toast with message:', errorMessages);

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: errorMessages,
          visibilityTime: 6000, // Show for 6 seconds to give user time to read
        });

        // Set loading to false immediately
        setLoading(false);

        // Navigate back to farm details screen to fix the issue
        setTimeout(() => {
          console.log('⬅️ Navigating back to farm details');
          goBack();
        }, 2000);

        // Exit early - don't process as OTP error
        return;
      }

      console.log('⚠️ Not a validation error, processing as OTP error');

      // Only clear OTP and trigger error for actual OTP errors
      setOtpCode(initialPin);
      trigger('notificationError');

      const errorMessage =
        err?.response?.data?.error || 'Invalid OTP. Please try again.';
      const errorCode = err?.response?.data?.code || null;
      const meta = err?.response?.data?.meta || null;

      if (errorCode === 'TOO_MANY_ATTEMPTS') {
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`;
        const blockedUntil = Date.now() + BLOCK_DURATION;

        await AsyncStorage.setItem(
          failedAttemptsKey,
          JSON.stringify({
            attempts: MAX_FAILED_ATTEMPTS,
            blockedUntil,
          }),
        );

        setIsBlocked(true);
        setIsEditable(false);
        blockTimerEndRef.current = blockedUntil;
        setBlockTimeRemaining(BLOCK_DURATION);

        Toast.show({
          type: 'error',
          text1: 'Too many incorrect OTP attempts.',
          text2:
            'You’ve reached the maximum number of OTP attempts. Please verify your mobile number and try again in 30 minutes.',
        });
        return;
      }
      if (
        errorCode === 'INVALID_OTP' &&
        meta?.attempts_remaining !== undefined
      ) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: `Invalid OTP. You have ${meta.attempts_remaining} attempt${
            meta.attempts_remaining !== 1 ? 's' : ''
          } remaining.`,
        });

        // Update failed attempts
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`;
        await AsyncStorage.setItem(
          failedAttemptsKey,
          JSON.stringify({
            attempts: MAX_FAILED_ATTEMPTS - meta.attempts_remaining,
            blockedUntil: 0,
          }),
        );
      } else if (errorCode === 'NO_OTP_SESSION') {
        setIsEditable(false);
        resendTimerEndRef.current = 0;
        setResendTimer(0);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: `Please request a new OTP.`,
        });
      } else if (errorCode === 'INVALID_OTP') {
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${userDetails.phone_number}`;
        const failedAttemptsData = await AsyncStorage.getItem(
          failedAttemptsKey,
        );
        let failedAttempts = 0;

        if (failedAttemptsData) {
          const parsedData = JSON.parse(failedAttemptsData);
          failedAttempts = parsedData.attempts;
        }

        failedAttempts += 1;

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const blockedUntil = Date.now() + BLOCK_DURATION;
          await AsyncStorage.setItem(
            failedAttemptsKey,
            JSON.stringify({
              attempts: failedAttempts,
              blockedUntil,
            }),
          );
          setIsEditable(false);
          setIsBlocked(true);
          blockTimerEndRef.current = blockedUntil;
          setBlockTimeRemaining(BLOCK_DURATION);

          Toast.show({
            type: 'error',
            text1: 'Too many incorrect OTP attempts',
            text2:
              "You've reached the maximum number of OTP attempts. Please verify your mobile number and try again in 30 minutes.",
          });
        } else {
          await AsyncStorage.setItem(
            failedAttemptsKey,
            JSON.stringify({
              attempts: failedAttempts,
              blockedUntil: 0,
            }),
          );
          Toast.show({
            type: 'error',
            text1: 'Verification Failed',
            text2: `Invalid OTP. ${
              MAX_FAILED_ATTEMPTS - failedAttempts
            } attempts remaining.`,
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: errorMessage,
        });
      }

      if (errorCode === 'FARMER_NOT_FOUND') {
        goBack();
      }
      if (errorCode === 'OTP_EXPIRED') {
        resendTimerEndRef.current = 0;
        setResendTimer(0);
      }
      if (errorCode === 'OTP_MAX_ATTEMPTS') {
        setIsEditable(false);
        setIsBlocked(true);
      }
      if (
        !netInfo.isConnected ||
        err.code === 'NETWORK_ERROR' ||
        !err?.response
      ) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection and try again',
        });
      }
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  };
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
          paddingBottom: Platform.OS === 'ios' ? bottom : bottom + 20,
        },
      ]}
      contentContainerStyle={{ flex: 1, width: '100%' }}
    >
      <AuthHeader title="Verification Code" />
      <View style={styles.container}>
        <UITypography variant="regular" style={styles.subtitle}>
          You are one step away from{'\n'}registering your account.
        </UITypography>
        <UITypography variant="regular" style={styles.phoneNumberContainer}>
          Enter the 6-digit code sent to you at{'\n'}
          <UITypography variant="semiBold" style={styles.phoneNumber}>
            {maskPhoneNumber(userDetails.phone_number)}
          </UITypography>
          {getMaskedEmail() && (
            <>
              {'\n'}and {'\n'}
              <UITypography variant="semiBold" style={styles.phoneNumber}>
                {getMaskedEmail()}
              </UITypography>
            </>
          )}
        </UITypography>
        <View style={styles.pinInputContainer}>
          <UIPINInput
            code={otpCode}
            setCode={c => {
              setOtpCode(c);
              if (error) setError('');
            }}
            pinCount={PIN_COUNT}
            error={!!error}
            editable={isEditable && resendTimer > 0}
          />
        </View>
        {/* Display block timer if user is blocked */}
        {isBlocked && blockTimeRemaining > 0 && (
          <View style={styles.blockTimerContainer}>
            <UITypography style={styles.blockTimerText}>
              You've reached the maximum number of OTP attempts. Please verify
              your mobile number and try again in sometime.
            </UITypography>
          </View>
        )}
        {/* {isBlocked && blockTimeRemaining > 0 && (
          <View style={styles.blockTimerContainer}>
            <UITypography style={styles.blockTimerText}>
              Try again in: {formatTime(blockTimeRemaining)}
            </UITypography>
            <UITypography style={styles.blockTimerText}>
              or try with a different number
            </UITypography>
          </View>
        )} */}
        {!isBlocked && blockTimeRemaining <= 0 && (
          <UITypography style={styles.resendContainer}>
            Didn't receive the code?{' '}
            <ResendTimer
              onResend={handleResendCode}
              isResending={isResending}
              isBlocked={isBlocked}
              timer={resendTimer}
            />
          </UITypography>
        )}
        <UIContainedButton
          loading={loading}
          key={isCodeComplete ? 'enabled' : 'disabled'}
          disabled={!isCodeComplete || isBlocked}
          onPress={handleSubmit}
        >
          VERIFY
        </UIContainedButton>
      </View>
    </ScrollView>
  );
}
