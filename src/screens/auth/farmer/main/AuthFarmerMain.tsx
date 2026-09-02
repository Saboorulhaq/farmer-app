import { UIContainedButton, UITextInput, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { ghanaCardMask } from '@/constants/masks';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import { useDebugStore } from '@/store/useDebugStore';
import { clearAuthToken } from '@/util/storage';
import { useAuth } from '@/constants/context/auth/context';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as Yup from 'yup';
import { styles } from './AuthFarmerMain.styled';
import { DEBUG_GHANA_CARD } from '@env';

const CheckSchema = Yup.object().shape({
  ghana_card_number: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'Invalid NADRA ID format')
    .required('NADRA ID is required'),
});

export default function AuthFarmerMainScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { navigate, replace } = useNavigation<FarmerAuthNavigationProp>();
  const { role, resetUserDetails, updateUserDetailsField, switchAccountRequested } =
    useRegisterStore();
  const { getTrustedCard, disableBiometricLogin } = useAuth();
  const appName = useAppConfigStore(state => state.appName);
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const [isChecking, setIsChecking] = useState(false);
  const [uniqueId, setUniqueId] = useState('');

  const normalizeCardNumber = (cardNumber: string) =>
    (cardNumber || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

  useEffect(() => {
    clearToken();
    resetUserDetails();
    getUniqueId()
      .then(e => setUniqueId(e))
      .catch(() => setUniqueId(''));
  }, [resetUserDetails]);

  const formik = useFormik({
    initialValues: {
      ghana_card_number: isDebugMode && DEBUG_GHANA_CARD ? DEBUG_GHANA_CARD : '',
    },
    validationSchema: CheckSchema,
    validateOnChange: true,
    onSubmit: async values => {
      setIsChecking(true);
      try {
        const response = await axiosPublic.post('/users/check_status', {
          data: {
            attributes: {
              ghana_card_number: values.ghana_card_number,
              device_id: uniqueId,
            },
          },
        });

        const attributes = response.data?.data?.attributes;
        const userExists = attributes?.user_exists;
        const userRole = attributes?.role;
        const userRoles: string[] = attributes?.roles || [];

        if (!userExists) {
          trigger('notificationError');
          Toast.show({
            type: 'error',
            text1: 'Not Registered',
            text2:
              'You are not yet registered. Kindly select “Register Now” to proceed.',
          });
          return;
        }

        updateUserDetailsField('ghana_card_number', values.ghana_card_number);
        if (attributes?.email) {
          updateUserDetailsField('email', attributes.email);
        }

        const trustedCard = getTrustedCard(role);
        const isSwitchingAccount =
          !!trustedCard?.card_number &&
          normalizeCardNumber(trustedCard.card_number) !==
            normalizeCardNumber(values.ghana_card_number);

        // Clear biometric when switching to a different account
        if (isSwitchingAccount) {
          await disableBiometricLogin(role);
        }

        if (userRole && userRole !== role && !userRoles.includes(role)) {
          const loginRoleLabel = role === 'agent' ? 'Agent' : 'Farmer';
          Toast.show({
            type: 'error',
            text1: 'Invalid Login',
            text2:
              `This account is not registered as a ${loginRoleLabel}. Please use the correct login.`,
          });
          return;
        }

        if (!attributes.is_pin_set) {
          return navigate('OTPVerification', {
            redirect: 'SetPIN',
            resend: true,
            masked_phone_number: attributes?.phone_number,
            email: attributes?.email,
            login: true,
          } as never);
        }

        if (attributes.account_locked) {
          Toast.show({
            type: 'error',
            text1: 'Account Locked',
            text2: 'Please verify your identity to unlock your account.',
          });
          return navigate('OTPVerification', {
            redirect: 'ResetPIN',
            resend: true,
            masked_phone_number: attributes?.phone_number,
            email: attributes?.email,
            login: true,
          } as never);
        }

        if (
          switchAccountRequested ||
          isSwitchingAccount ||
          !attributes.is_login_from_same_device
        ) {
          return navigate('OTPVerification', {
            redirect: 'LoginPin',
            resend: true,
            masked_phone_number: attributes?.phone_number,
            email: attributes?.email,
            login: true,
          } as never);
        }

        if (!attributes.is_pin_set) {
          return navigate('OTPVerification', {
            redirect: 'CreatePIN',
            resend: true,
            masked_phone_number: attributes?.phone_number,
            email: attributes?.email,
            login: true,
          } as never);
        }

        // Always require OTP before PIN login.
        return navigate('OTPVerification', {
          redirect: 'LoginPin',
          resend: true,
          masked_phone_number: attributes?.phone_number,
            email: attributes?.email,
          login: true,
        } as never);
      } catch (error: any) {
        trigger('notificationError');
        const data = error?.response?.data;
        const fieldError = data?.fields?.length
          ? data.fields.find((f: any) =>
              (f.attribute_name || f.field || f.field_key || '') === 'ghana_card_number',
            ) || data.fields[0]
          : null;
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2:
            fieldError?.short_error ||
            fieldError?.message ||
            data?.error ||
            'Network error occurred. Please try again.',
        });
      } finally {
        setIsChecking(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    handleSubmit,
    isSubmitting,
    isValid,
  } = formik;

  const clearToken = async () => {
    await clearAuthToken();
  };

  const handleRegister = () => {
    formik.resetForm();
    navigate('IdVerification');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollView,
        {
          paddingTop: top + 24,
        },
      ]}
    >
      <View>
        <UITypography variant="medium" style={styles.title}>
          Welcome to {appName.replace('Agri ', 'Agri\n')}
        </UITypography>
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <UITextInput
              label="NADRA ID"
              placeholder="XXXXX-XXXXXXX-X"
              mask={ghanaCardMask}
              // autoFocus
              keyboardType="numeric"
              editable={!isChecking}
              value={values.ghana_card_number}
              onChangeText={masked => {
                setFieldValue('ghana_card_number', masked || '');
              }}
              onBlur={handleBlur('ghana_card_number')}
              error={touched.ghana_card_number && !!errors.ghana_card_number}
              helperText={
                isChecking
                  ? 'Checking...'
                  : touched.ghana_card_number
                  ? errors.ghana_card_number
                  : ''
              }
            />
          </View>
          <View style={styles.formGroup}>
            <UIContainedButton
              key={
                values.ghana_card_number === '' || !isValid
                  ? 'disabled'
                  : 'enabled'
              }
              loading={isSubmitting}
              disabled={values.ghana_card_number === '' || !isValid}
              onPress={handleSubmit}
            >
              LOGIN
            </UIContainedButton>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { marginBottom: bottom + 24 }]}>
        <UITypography variant="regular" style={styles.registerText}>
          New to {appName}?{' '}
        </UITypography>
        <Pressable onPress={handleRegister} hitSlop={12}>
          <UITypography
            variant="semiBold"
            style={styles.registerLink}
          >
            Register now
          </UITypography>
        </Pressable>
      </View>
    </ScrollView>
  );
}
