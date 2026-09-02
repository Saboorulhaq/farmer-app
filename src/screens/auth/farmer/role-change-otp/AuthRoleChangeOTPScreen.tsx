import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import {
  verifyRoleChangeOtp,
  addRole,
  requestRoleChangeOtp,
} from '@/services/roleChangeService';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { maskPhoneNumber } from '@/util/formatPhoneNumber';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthRoleChangeOTPScreen.styled';

export type RoleChangeOTPRouteParams = {
  phone: string;
  ghanaCardNumber: string;
  farmerName: string;
  targetRole: 'farmer' | 'agent';
};

const ResendTimer = memo(
  ({
    onResend,
    isResending,
    timer,
  }: {
    onResend: () => void;
    isResending: boolean;
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

const AuthRoleChangeOTPScreen: FC = () => {
  const route = useRoute();
  const { phone, ghanaCardNumber, farmerName, targetRole } =
    (route.params as RoleChangeOTPRouteParams) || {};

  const navigation = useNavigation<any>();

  const PIN_COUNT = 6;
  const RESEND_TIME_LIMIT = 120;
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const isVerifyingRef = useRef(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(PIN_COUNT).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_TIME_LIMIT);
  const [error, setError] = useState('');
  const { top, bottom } = useSafeAreaInsets();
  const code = otpCode.join('');
  const isCodeComplete = code.length === PIN_COUNT;

  const getErrorMessage = (err: any, fallback: string) => {
    return (
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      fallback
    );
  };

  const isInvalidOtpError = (err: any) => {
    const status = err?.response?.status;
    const message =
      `${err?.response?.data?.error || ''} ${err?.response?.data?.message || ''} ${err?.message || ''}`
        .toLowerCase()
        .trim();

    return (
      status === 400 ||
      status === 401 ||
      status === 422 ||
      (message.includes('otp') &&
        (message.includes('invalid') ||
          message.includes('expired') ||
          message.includes('incorrect')))
    );
  };

  const resendTimerEndRef = useRef<number>(
    Date.now() + RESEND_TIME_LIMIT * 1000,
  );

  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil(
        (resendTimerEndRef.current - Date.now()) / 1000,
      );

      if (remaining <= 0) {
        setResendTimer(0);
        return;
      }

      setResendTimer(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer > 0]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const resendRemaining = Math.ceil(
          (resendTimerEndRef.current - Date.now()) / 1000,
        );
        setResendTimer(resendRemaining > 0 ? resendRemaining : 0);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  const handleVerify = async () => {
    if (isVerifyingRef.current) {
      return;
    }

    if (!isCodeComplete) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Code must be 6 digits.');
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);
    try {
      // Step 1: Verify OTP and get auth token
      const authToken = await verifyRoleChangeOtp(ghanaCardNumber, code);

      // Step 2: Add role using the auth token
      await addRole(authToken, targetRole);

      const roleLabel = targetRole === 'agent' ? 'Agent' : 'Farmer';
      Toast.show({
        type: 'success',
        text1: `${roleLabel} Role Added`,
        text2: `The ${targetRole} role has been successfully added.`,
      });

      // Navigate to success screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'FarmerSuccess' }],
        }),
      );
    } catch (err: any) {
      console.log(err);
      const errorMessage = getErrorMessage(
        err,
        'Failed to verify code. Please try again.',
      );

      setError(errorMessage);
      if (isInvalidOtpError(err)) {
        setOtpCode(Array(PIN_COUNT).fill(''));
      }
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      await requestRoleChangeOtp(phone);

      Toast.show({
        type: 'success',
        text1: 'New OTP sent!',
        text2: 'New OTP has been sent successfully.',
      });

      resendTimerEndRef.current = Date.now() + RESEND_TIME_LIMIT * 1000;
      setResendTimer(RESEND_TIME_LIMIT);
    } catch (err: any) {
      console.log(err);
      const errorMessage = getErrorMessage(
        err,
        'Failed to resend code. Please try again.',
      );

      Toast.show({
        type: 'error',
        text1: 'Failed to resend code',
        text2: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  }, [phone]);

  const roleLabel = targetRole === 'agent' ? 'agent' : 'farmer';

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
          You are one step away from{' \n'}adding your {roleLabel} role.
        </UITypography>
        <UITypography variant="regular" style={styles.phoneNumberContainer}>
          Enter the 6-digit code sent to you at{'\n'}
          <UITypography variant="semiBold" style={styles.phoneNumber}>
            {maskPhoneNumber(phone)}
          </UITypography>
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
            editable={resendTimer > 0}
          />
        </View>
        <UITypography style={styles.resendContainer}>
          Didn't receive the code?{' '}
          <ResendTimer
            onResend={handleResend}
            isResending={isResending}
            timer={resendTimer}
          />
        </UITypography>
        <UIContainedButton
          key={isCodeComplete ? 'enabled' : 'disabled'}
          loading={loading}
          size="medium"
          onPress={handleVerify}
          disabled={!isCodeComplete}
        >
          VERIFY
        </UIContainedButton>
      </View>
    </ScrollView>
  );
};

export default AuthRoleChangeOTPScreen;
