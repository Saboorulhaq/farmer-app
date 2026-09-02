import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UIPINInput, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { useAgentFarmerRegister } from '@/constants/context/agent/agent-farmer-register/context';
import { useNavigation } from '@react-navigation/native';
import { FC, memo, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AgentFarmerOTPScreen.styled';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { maskPhoneNumber } from '@/util/formatPhoneNumber';

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

const AgentFarmerOTPScreen: FC = () => {
  const { farmerDetails, completeFarmerOnboarding, resetAll } =
    useAgentFarmerRegister();
  const { replace } = useNavigation();
  const { reset } = useFarmerIdCardStore();
  const { top, bottom } = useSafeAreaInsets();
  const phone_number = farmerDetails.phoneNumber;
  const PIN_COUNT = 6;
  const RESEND_TIME_LIMIT = 120;
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const isVerifyingRef = useRef(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(PIN_COUNT).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_TIME_LIMIT);
  const [error, setError] = useState('');
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
    const message = `${err?.response?.data?.error || ''} ${err?.response?.data?.message || ''} ${err?.message || ''}`
      .toLowerCase()
      .trim();

    return (
      status === 400 ||
      status === 401 ||
      status === 422 ||
      (message.includes('otp') &&
        (message.includes('invalid') || message.includes('expired') || message.includes('incorrect')))
    );
  };

  // Store target end time as ref to persist across background/foreground transitions
  const resendTimerEndRef = useRef<number>(Date.now() + RESEND_TIME_LIMIT * 1000);

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

  // Handle app state changes to recalculate timer when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Recalculate resend timer
        const resendRemaining = Math.ceil((resendTimerEndRef.current - Date.now()) / 1000);
        setResendTimer(resendRemaining > 0 ? resendRemaining : 0);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
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
      let attributes: { phone_number: string; otp: string; email?: string; flow?: string } = {
        otp: otpCode.join(''),
        phone_number: farmerDetails.phoneNumber,
        ...(farmerDetails.email ? { email: farmerDetails.email } : {}),
        flow: 'REGISTRATION_OTP',
      };

      const payload = {
        data: { attributes },
      };
      const response = await axiosPublic.post('/users/verify_otp', payload);
      const {
        data: {
          attributes: { phone_verified },
        },
      } = response.data;
      if (phone_verified) {
        await completeFarmerOnboarding();

        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: response?.data?.meta?.message || '',
        });
        reset();
        replace('FarmSuccess');
      }
    } catch (err: any) {
      console.log(err);
      const errorMessage = getErrorMessage(err, 'Failed to verify code. Please try again.');

      setError(errorMessage);
      if (isInvalidOtpError(err)) {
        setOtpCode(Array(PIN_COUNT).fill(''));
      }
      Toast.show({
        type: 'error',
        text1: 'OTP Verification Failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      let attributes: { phone_number?: string; email?: string; flow?: string } = {
        phone_number: farmerDetails.phoneNumber,
        ...(farmerDetails.email ? { email: farmerDetails.email } : {}),
        flow: 'REGISTRATION_OTP',
      };

      const payload = {
        data: {
          attributes,
        },
      };
      const response = await axiosPublic.post(`/users/resend_otp`, payload);

      // setResendTimer(RESEND_TIME_LIMIT);
      Toast.show({
        type: 'success',
        text1: 'New OTP sent!',
        text2: 'New OTP has been sent successfully.',
      });

      const cooldownSeconds =
        response.data?.meta?.seconds_remaining || RESEND_TIME_LIMIT;
      resendTimerEndRef.current = Date.now() + cooldownSeconds * 1000;
      setResendTimer(cooldownSeconds);
    } catch (err: any) {
      console.log(err);
      const errorMessage = getErrorMessage(err, 'Failed to resend code. Please try again.');

      Toast.show({
        type: 'error',
        text1: 'Failed to resend code',
        text2: errorMessage,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const getMaskedEmail = () => {
    const email = farmerDetails.email;
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
          You are one step away from{'\n'}registering the farmer's account.
        </UITypography>
        <UITypography variant="regular" style={styles.phoneNumberContainer}>
          Enter the {PIN_COUNT}-digit code sent to{'\n'}
          <UITypography variant="semiBold" style={styles.phoneNumber}>
            {maskPhoneNumber(phone_number)}
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
            editable={resendTimer > 0}
          />
        </View>
        <UITypography style={styles.resendContainer}>
          Didn't receive the code?{' '}
          <ResendTimer
            onResend={handleResend}
            isResending={resendLoading}
            timer={resendTimer}
          />
        </UITypography>
        <UIContainedButton
          loading={loading}
          key={isCodeComplete ? 'enabled' : 'disabled'}
          disabled={!isCodeComplete}
          onPress={handleVerify}
        >
          VERIFY
        </UIContainedButton>
      </View>
    </ScrollView>
  );
};

export default AgentFarmerOTPScreen;
