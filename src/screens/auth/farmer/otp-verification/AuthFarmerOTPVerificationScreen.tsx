import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { useAuth } from '@/constants/context/auth/context';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { setAuthToken } from '@/util/storage';
import { maskPhoneNumber } from '@/util/formatPhoneNumber';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, ScrollView, View } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerOTPVerificationScreen.styled';
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

type ParamList = {
  FarmerAuthStack: {
    resend: boolean;
    masked_phone_number: string;
    redirect: 'ResetPIN';
    login: boolean;
    register: boolean;
    email?: string;
  };
};
type AuthOTPVerificationRouteProp = RouteProp<ParamList>;

export default function AuthFarmerOTPVerificationScreen() {
  const PIN_COUNT = 6;
  const initialPin = Array(PIN_COUNT).fill('');
  const RESEND_TIME_LIMIT = 120;
  const MAX_FAILED_ATTEMPTS = 3;
  const BLOCK_DURATION = 30 * 60 * 1000;
  const FAILED_ATTEMPTS_KEY = 'failed_otp_attempts_';
  const route = useRoute<AuthOTPVerificationRouteProp>();
  const { resend, masked_phone_number, redirect, login, email: routeEmail } =
    route.params || {};
  const { goBack, navigate, replace } =
    useNavigation<FarmerAuthNavigationProp>();
  const { userDetails, role } = useRegisterStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const { top, bottom } = useSafeAreaInsets();
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const isVerifyingRef = useRef(false);
  const [otpCode, setOtpCode] = useState<string[]>(initialPin);
  const [error, setError] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIME_LIMIT);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const netInfo = useNetInfo();
  const [isManualResend, setIsManualResend] = useState(false);
  const { handleTrustedCard, getTrustedCard } = useAuth();
  const [isEditable, setIsEditable] = useState(true);

  // Store target end times as refs to persist across background/foreground transitions
  const resendTimerEndRef = useRef<number>(Date.now() + RESEND_TIME_LIMIT * 1000);
  const blockTimerEndRef = useRef<number>(0);

  console.log('isBlocked', isBlocked, resend);
  useEffect(() => {
    const checkBlockingStatus = async () => {
      const blockKey = `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`;
      const blockData = await AsyncStorage.getItem(blockKey);

      if (blockData) {
        const { blockedUntil } = JSON.parse(blockData);
        const currentTime = Date.now();

        if (blockedUntil > currentTime) {
          setIsBlocked(true);
          setIsEditable(false);
          blockTimerEndRef.current = blockedUntil;
          setBlockTimeRemaining(blockedUntil - currentTime);
          Toast.show({
            type: 'error',
            text1: 'Account Blocked',
            text2: 'You cannot request a new code while blocked.',
          });
          return;
        } else {
          await AsyncStorage.removeItem(blockKey);
          setIsBlocked(false);
          setIsEditable(true);
        }
      }
      if (resend) {
        console.log('isBlocked', resend);
        await handleResendCode();
      }
    };

    checkBlockingStatus();
  }, [userDetails.ghana_card_number]);

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
          `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`,
        );
        return;
      }

      setBlockTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [blockTimeRemaining > 0, userDetails.ghana_card_number]);

  useEffect(() => {
    const code = otpCode.join('');
    setIsCodeComplete(code.length === PIN_COUNT);
  }, [otpCode]);

  const handleResendCode = useCallback(async () => {
    if (isBlocked) {
      Toast.show({
        type: 'error',
        text1: 'Account Blocked',
        text2: 'You cannot request a new code while blocked.',
      });
      return;
    }
    setIsResending(true);

    try {
      let attributes: { ghana_card_number?: string; email?: string; flow?: string } = {
        ghana_card_number: userDetails.ghana_card_number,
        ...(userDetails.email ? { email: userDetails.email } : {}),
        flow: login ? 'NEW_DEVICE_LOGIN' : 'REGISTRATION_OTP',
      };

      let url = '';
      if (login) {
        url = '/user_sessions/request_login_otp';
      } else {
        url = '/users/resend_otp';
      }
      const payload = {
        data: {
          attributes,
        },
      };
      const response = await axiosPublic.post(url, payload);
      if (isManualResend) {
        Toast.show({
          type: 'success',
          text1: 'Code Resent',
          text2: response.data?.data?.attributes?.message,
        });
        setIsManualResend(false);
      }

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
  }, [userDetails.ghana_card_number, isManualResend, login]);

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
              `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`,
            );
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [userDetails.ghana_card_number]);

  const getMaskedEmail = () => {
    const email = routeEmail || userDetails.email;
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

  const handleLoginSubmit = async (response: any) => {
    const data = response.data?.data;
    const { attributes } = response.data?.data;

    // Set auth token for login
    if (data?.auth_token) {
      await setAuthToken(data.auth_token);
    }

    await AsyncStorage.removeItem(
      `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`,
    );

    // const card = getTrustedCard(role);
    // if (!card) {
    //   await handleTrustedCard(
    //     role,
    //     userDetails.ghana_card_number,
    //     attributes.name,
    //   );
    // }

    Toast.show({
      type: 'success',
      text1: 'Verification Successful',
      text2: 'You are successfully verified',
    });

    if (redirect) {
      replace(redirect);
      return;
    }

    replace('FarmerMain');
  };

  const handleRegistrationSubmit = async (response: any) => {
    const meta = response.data?.meta;

    if (meta?.auth_token) {
      await setAuthToken(meta.auth_token);
    }

    await AsyncStorage.removeItem(
      `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`,
    );

    Toast.show({
      type: 'success',
      text1: 'Verification Successful',
      text2: meta?.message,
    });

  };

  const handleSubmit = async () => {
    if (isVerifyingRef.current) {
      return;
    }

    if (isBlocked) {
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
      let attributes: { ghana_card_number?: string; otp?: string; email?: string; flow?: string; login_role?: string } = {
        otp: otpCode.join(''),
        ghana_card_number: userDetails.ghana_card_number,
        ...(userDetails.email ? { email: userDetails.email } : {}),
        flow: login ? 'NEW_DEVICE_LOGIN' : 'REGISTRATION_OTP',
        ...(login ? { primary_role: role } : {}),
      };

      let url = '';
      if (login) {
        url = '/user_sessions/login_with_otp';
      } else {
        url = '/users/verify_otp';
      }

      const payload = {
        data: { attributes },
      };

      const response = await axiosPublic.post(url, payload);

      // Handle login and registration differently based on the flow
      if (login) {
        await handleLoginSubmit(response);
      } else {
        await handleRegistrationSubmit(response);
      }
    } catch (err: any) {
      Sentry.captureException(err);
      setOtpCode(initialPin);
      trigger('notificationError', {
        ignoreAndroidSystemSettings: true,
      });
      const errorMessage =
        err?.response?.data?.error || 'Invalid OTP. Please try again.';
      const errorCode = err?.response?.data?.code || null;
      const meta = err?.response?.data?.meta || null;

      // Handle OTP invalid error with attempts remaining
      if (
        errorCode === 'OTP_INVALID' &&
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
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`;
        await AsyncStorage.setItem(
          failedAttemptsKey,
          JSON.stringify({
            attempts: MAX_FAILED_ATTEMPTS - meta.attempts_remaining,
            blockedUntil: 0,
          }),
        );
      } else if (errorCode === 'OTP_MAX_ATTEMPTS') {
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${userDetails.ghana_card_number}`;
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
          setIsBlocked(true);
          setIsEditable(false);
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

  // Format time for display
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
          Please provide consent to fetch your{'\n'}NADRA ID Details
        </UITypography>
        <UITypography variant="regular" style={styles.phoneNumberContainer}>
          {redirect === 'ResetPIN' ? (
            <>Enter the 6-digit code sent to your registered mobile number and email</>
          ) : masked_phone_number ? (
            <>
              Enter the 6-digit code sent to you at{'\n'}
              <UITypography variant="semiBold" style={styles.phoneNumber}>
                {maskPhoneNumber(masked_phone_number)}
              </UITypography>
              {getMaskedEmail() && (
                <>
                  {'\n'}and {'\n'}
                  <UITypography variant="semiBold" style={styles.phoneNumber}>
                    {getMaskedEmail()}
                  </UITypography>
                </>
              )}
            </>
          ) : userDetails.phone_number ? (
            <>
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
            </>
          ) : (
            <>Enter the 6-digit code sent to your registered mobile number and email</>
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
            <UITypography style={styles.blockTimerTitle}>
              Account Blocked: Too many failed attempts
            </UITypography>
            <UITypography style={styles.blockTimerText}>
              Try again in: {formatTime(blockTimeRemaining)}
            </UITypography>
          </View>
        )} */}
        {!isBlocked && blockTimeRemaining <= 0 && (
          <UITypography style={styles.resendContainer}>
            Didn't receive the code?{' '}
            <ResendTimer
              onResend={() => {
                setIsManualResend(true);
                handleResendCode();
              }}
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
        {isDebugMode && redirect && (
          <UITypography
            variant="semiBold"
            style={{
              fontSize: 16,
              color: '#E53935',
              textDecorationLine: 'underline',
              textAlign: 'center',
              marginTop: 16,
            }}
            onPress={() => replace(redirect as any)}
          >
            Skip
          </UITypography>
        )}
      </View>
    </ScrollView>
  );
}
