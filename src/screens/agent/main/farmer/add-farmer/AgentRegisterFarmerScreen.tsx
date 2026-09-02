import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UITextInput, UITypography } from '@/components/ui';
import { useAgentFarmerRegister } from '@/constants/context/agent/agent-farmer-register/context';
import { ghanaCardMask, mobileMask } from '@/constants/masks';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { StatusBar, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as Yup from 'yup';
import { styles } from './AgentRegisterFarmerScreen.styled';
import { trigger } from 'react-native-haptic-feedback';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { useEffect, useState, useRef } from 'react';

// Address fields intentionally have no character validation so data populated
// via Card Scan (English letters, special characters) is never rejected.
const RESERVED_EMAIL_TLDS = new Set(['invalid', 'example', 'localhost', 'local', 'test']);
const ALLOWED_GENERIC_TLDS = new Set([
  'com',
  'org',
  'net',
  'edu',
  'gov',
  'mil',
  'int',
  'info',
  'biz',
  'name',
  'pro',
  'aero',
  'coop',
  'jobs',
  'mobi',
  'museum',
  'travel',
  'tel',
  'asia',
  'cat',
  'post',
  'app',
  'dev',
  'io',
  'ai',
  'co',
  'me',
  'tv',
  'fm',
  'online',
  'site',
  'store',
  'tech',
  'cloud',
  'live',
  'news',
  'blog',
  'digital',
  'services',
  'solutions',
  'agency',
  'group',
  'global',
  'africa',
  'xyz',
]);

const UserDetailsSchema = Yup.object().shape({
  name: Yup.string()
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'Name must contain only letters and certain symbols',
    )
    .max(256, 'Name must not exceed 256 characters')
    .required('Farmer name is required'),
  ghana_card_number: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'Invalid NADRA ID format')
    .required('NADRA ID is required'),
  phone_number: Yup.string()
    .matches(/^\+92 \d{3} \d{3} \d{4}$/, 'Invalid mobile format')
    .required('Mobile number is required'),
  email: Yup.string()
    .test('email-format', 'Please enter a valid email address', function(value) {
      // Allow empty since email is optional
      if (!value || value.trim() === '') {
        return true;
      }
      
      const trimmedValue = value.trim();
      
      // Check for consecutive dots or dots at start/end of username/domain parts
      if (trimmedValue.includes('..') || trimmedValue.startsWith('.') || trimmedValue.startsWith('@')) {
        return false;
      }
      
      // Split email into local and domain parts
      const parts = trimmedValue.split('@');
      if (parts.length !== 2) {
        return false;
      }
      
      const [localPart, domainPart] = parts;
      
      // Validate local part (username)
      // Must not be empty, must not start/end with dot, must contain valid chars
      if (!localPart || localPart.length === 0 || localPart.startsWith('.') || localPart.endsWith('.')) {
        return false;
      }
      const localPartRegex = /^[a-zA-Z0-9._+-]+$/;
      if (!localPartRegex.test(localPart)) {
        return false;
      }
      
      // Validate domain part
      if (!domainPart || domainPart.length === 0) {
        return false;
      }
      
      // Check for consecutive dots in domain
      if (domainPart.includes('..')) {
        return false;
      }
      
      // Domain must have at least one dot (for TLD)
      if (!domainPart.includes('.')) {
        return false;
      }
      
      // Split domain into parts
      const domainParts = domainPart.split('.');
      const tld = domainParts[domainParts.length - 1];
      
      // TLD must be at least 2 letters, max 63 characters (ICANN standard), letters only
      if (!tld || tld.length < 2 || tld.length > 63 || !/^[a-zA-Z]+$/.test(tld)) {
        return false;
      }

      const normalizedTld = tld.toLowerCase();

      // Allow any valid country-code TLD (2 letters) or known generic TLDs.
      if (
        RESERVED_EMAIL_TLDS.has(normalizedTld) ||
        (normalizedTld.length !== 2 && !ALLOWED_GENERIC_TLDS.has(normalizedTld))
      ) {
        return false;
      }
      
      // Domain parts (excluding TLD) must be valid
      for (let i = 0; i < domainParts.length - 1; i++) {
        const part = domainParts[i];
        if (!part || part.length === 0 || part.startsWith('-') || part.endsWith('-')) {
          return false;
        }
        // Domain parts can contain letters, numbers, and hyphens
        if (!/^[a-zA-Z0-9-]+$/.test(part)) {
          return false;
        }
      }
      
      return true;
    }),
  residential_address: Yup.string()
    .max(512, 'Residential address must not exceed 512 characters')
    .optional(),
});

export default function AgentRegisterFarmerScreen() {
  const { navigate } = useNavigation<FarmerAuthNavigationProp>();
  const { cardDetails } = useFarmerIdCardStore();
  const { top, bottom } = useSafeAreaInsets();
  const { farmerDetails, setFarmerDetails, startFarmerRegistration } =
    useAgentFarmerRegister();
  const [isEditable, setIsEditable] = useState(true);
  const scrollViewRef = useRef<any>(null);
  const ghanaCardInputRef = useRef<any>(null);
  const nameInputRef = useRef<any>(null);
  const mobileInputRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
  const addressInputRef = useRef<any>(null);

  useEffect(() => {
    if (cardDetails) {
      setFarmerDetails({
        name: cardDetails?.personal_info.full_name,
        ghanaCardNumber: cardDetails?.ghana_card_number,
      });

      setIsEditable(false);
    }
  }, [cardDetails]);

  const formik = useFormik({
    initialValues: {
      ghana_card_number: farmerDetails?.ghanaCardNumber || '',
      phone_number: farmerDetails?.phoneNumber || '',
      name: farmerDetails?.name || '',
      email: farmerDetails?.email || '',
      residential_address: farmerDetails?.residentialAddress || '',
    },
    validationSchema: UserDetailsSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await startFarmerRegistration({
          name: values.name,
          ghanaCardNumber: values.ghana_card_number,
          phoneNumber: values.phone_number,
          email: values.email,
          residentialAddress: values.residential_address,
        });
        navigate('FarmDetails' as never);
      } catch (error: any) {
        if (error?.__handledWithToast) {
          return;
        }

        trigger('notificationError');

        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data?.meta?.message ||
          error?.message ||
          'Something went wrong. Please try again.';

        Toast.show({
          type: 'error',
          text1: 'Registration failed',
          text2: errorMessage,
        });
      }
    },
    validateOnChange: true,
  });
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
  } = formik;
  console.log(!isValid);
  const handleMobileFocus = () => {
    if (!values.phone_number.startsWith('+92')) {
      setFieldValue('phone_number', '+92 ');
    }
  };
  const onEdit = () => {
    setIsEditable(true);
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
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <AuthHeader title="Register Farmer" />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainerStyle,
          { paddingBottom: bottom },
        ]}
      >
        <View style={styles.container}>
          <UITypography variant="regular" style={styles.contentTitle}>
            Input Farmer's Details
          </UITypography>
          {!isEditable && (
            <View style={styles.exitContainer}>
              <TouchableOpacity onPress={() => onEdit()}>
                <UITypography variant="semiBold" style={styles.editText}>
                  Edit
                </UITypography>
              </TouchableOpacity>
            </View>
          )}
          <UITextInput
            ref={ghanaCardInputRef}
            label="NADRA ID"
            requiredLabel
            placeholder="XXXXX-XXXXXXX-X"
            value={values.ghana_card_number}
            mask={ghanaCardMask}
            editable={isEditable}
            keyboardType="numeric"
            onChangeText={masked => {
              setFieldValue('ghana_card_number', masked || '');
            }}
            onFocus={() => {
              setTimeout(() => {
                ghanaCardInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onBlur={handleBlur('ghana_card_number')}
            error={touched.ghana_card_number && !!errors.ghana_card_number}
            helperText={
              touched.ghana_card_number ? errors.ghana_card_number : ''
            }
          />
          <UITextInput
            ref={nameInputRef}
            label="Farmer name"
            requiredLabel
            placeholder="Please enter"
            value={values.name}
            editable={isEditable}
            maxLength={256}
            onChangeText={text => {
              handleChange('name')(text);
            }}
            onFocus={() => {
              setTimeout(() => {
                nameInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onBlur={handleBlur('name')}
            error={touched.name && !!errors.name}
            helperText={touched.name ? errors.name : ''}
          />
          <UITextInput
            ref={mobileInputRef}
            label="MOBILE NUMBER"
            requiredLabel
            placeholder="+92 XXX XXX XXXX"
            value={values.phone_number}
            mask={mobileMask}
            keyboardType="phone-pad"
            onFocus={() => {
              handleMobileFocus();
              setTimeout(() => {
                mobileInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onChangeText={text => {
              handleChange('phone_number')(text || '');
            }}
            onBlur={handleBlur('phone_number')}
            error={touched.phone_number && !!errors.phone_number}
            helperText={touched.phone_number ? errors.phone_number : ''}
          />

          <UITextInput
            ref={emailInputRef}
            label="EMAIL ADDRESS (OPTIONAL)"
            placeholder="Please enter"
            returnKeyType="next"
            keyboardType="email-address"
            value={values.email}
            onChangeText={text => {
              handleChange('email')(text);
            }}
            onFocus={() => {
              setTimeout(() => {
                emailInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onBlur={handleBlur('email')}
            onSubmitEditing={() => addressInputRef.current?.focus()}
            error={touched.email && !!errors.email}
            helperText={touched.email ? errors.email : ''}
          />
          <UITextInput
            ref={addressInputRef}
            label="RESIDENTIAL ADDRESS (OPTIONAL)"
            placeholder="Enter your residential address"
            returnKeyType="done"
            value={values.residential_address}
            maxLength={512}
            onChangeText={text => {
              setFieldValue('residential_address', text);
            }}
            onFocus={() => {
              setTimeout(() => {
                addressInputRef.current?.measureInWindow((x: number, y: number) => {
                  scrollViewRef.current?.scrollToPosition(0, Math.max(0, y - 150), true);
                });
              }, 100);
            }}
            onBlur={handleBlur('residential_address')}
            error={touched.residential_address && !!errors.residential_address}
            helperText={touched.residential_address ? errors.residential_address : ''}
            multiline
            numberOfLines={2}
          />
        </View>
        <View style={styles.footer}>
          <UIContainedButton
            key={isValid ? 'enabled' : 'disabled'}
            loading={isSubmitting}
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
