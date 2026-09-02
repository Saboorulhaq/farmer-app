import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UITextInput, UITypography } from '@/components/ui';
import { axiosPrivate, axiosPublic } from '@/config/axios';
import { ghanaCardMask, pinMask } from '@/constants/masks';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { AuthUserDetails, useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import { DEBUG_USER_CONTACT } from '@/constants/testing/registrationDebugData';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as Yup from 'yup';
import { styles } from './AuthFarmerUserDetailsScreen.styled';
import { mobileMask } from './ts/constants';
import RoleChangeModal from '@/components/screens/agent/farmer/RoleChangeModal';
import { CalendarSelectionValue } from '@/components/ui/calender';
import {
  checkGhanaCardForRoleChange,
  requestRoleChangeOtp,
  RoleChangeCheckResult,
} from '@/services/roleChangeService';

// Address fields intentionally have no character/script validation so data
// populated via Card Scan (English letters, special characters, Urdu script)
// is never rejected. Only length limits are enforced.
const URDU_NATIVE_NAME_REGEX = /^[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/;
const URDU_NATIVE_NAME_SANITIZE_REGEX = /[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s]/g;
const ENGLISH_NAME_SANITIZE_REGEX = /[^a-zA-Z\s'-]/g;
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
    .required('Name is required'),
  ghana_card_number: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'Invalid NADRA ID format')
    .required('NADRA ID is required'),
  phone_number: Yup.string()
    .matches(/^\+92 \d{3} \d{3} \d{4}$/, 'Invalid mobile number format')
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
  issue_date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Use format YYYY-MM-DD',
      excludeEmptyString: true,
    })
    .optional(),
  expiry_date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Use format YYYY-MM-DD',
      excludeEmptyString: true,
    })
    .test(
      'expiry-after-issue',
      'Expiry date must be later than the card issue date',
      function (value) {
        if (!value) return true;
        const issueDate = this.parent.issue_date;
        if (!issueDate) return true;
        return value > issueDate;
      },
    )
    .optional(),
  full_name_native: Yup.string()
    .test(
      'urdu-only',
      'Full Name (Urdu) must contain only Urdu script characters',
      value => !value || URDU_NATIVE_NAME_REGEX.test(value),
    )
    .max(256, 'Must not exceed 256 characters')
    .optional(),
  parent_or_spouse_name: Yup.string()
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'Father/Husband Name must contain only letters and basic punctuation',
    )
    .max(256, 'Must not exceed 256 characters')
    .optional(),
  parent_or_spouse_name_native: Yup.string()
    .test(
      'urdu-only',
      'Father/Husband Name (Urdu) must contain only Urdu script characters',
      value => !value || URDU_NATIVE_NAME_REGEX.test(value),
    )
    .max(256, 'Must not exceed 256 characters')
    .optional(),
  present_address_native: Yup.string()
    .max(512, 'Must not exceed 512 characters')
    .optional(),
  present_address_romanized: Yup.string()
    .max(512, 'Must not exceed 512 characters')
    .optional(),
  permanent_address_native: Yup.string()
    .max(512, 'Must not exceed 512 characters')
    .optional(),
  permanent_address_romanized: Yup.string()
    .max(512, 'Must not exceed 512 characters')
    .optional(),
  pin: Yup.string()
    .min(6, 'PIN must be at least 6 digits')
    .test('is-not-easy', 'PIN is too easy', value => {
      if (!value) return true;
      const easyPins = [
        '123456',
        '000000',
        '111111',
        '222222',
        '333333',
        '444444',
        '555555',
        '666666',
        '777777',
        '888888',
        '999999',
        '123123',
        '456456',
        '789789',
      ];
      return !easyPins.includes(value);
    })
    .required('PIN is required'),
  confirm_pin: Yup.string()
    .min(6, 'PIN must be at least 6 digits')
    .oneOf([Yup.ref('pin')], 'PINs do not match')
    .required('Confirm PIN is required'),
});

export default function AuthFarmerUserDetailsScreen() {
  const navigation = useNavigation<FarmerAuthNavigationProp>();
  const { navigate } = navigation;
  const { role, updateUserDetails, userDetails, updateUserDetailsField } =
    useRegisterStore();
  const { frontBase64, backBase64, cardDetails } = useFarmerIdCardStore();
  const { uniqueId } = useDeviceStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const [isEditable, setIsEditable] = useState(true);
  const todayISO = new Date().toISOString().split('T')[0];

  const ghanaCardRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<any>(null);
  const issueDateY = useRef(0);
  const expiryDateY = useRef(0);
  const isInitialMount = useRef(true);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [roleChangeResult, setRoleChangeResult] = useState<RoleChangeCheckResult>(null);
  const [roleChangeConfirmLoading, setRoleChangeConfirmLoading] = useState(false);
  const [checkingGhanaCard, setCheckingGhanaCard] = useState(false);
  useEffect(() => {
    if (cardDetails) {
      updateUserDetailsField(
        'ghana_card_number',
        cardDetails?.ghana_card_number,
      );
      updateUserDetailsField('name', cardDetails?.personal_info.full_name);

      // Prefill the CNIC OCR fields so the user can review/correct them.
      updateUserDetailsField(
        'issue_date',
        cardDetails?.issue_date ||
          cardDetails?.document_info?.date_of_issue ||
          '',
      );
      updateUserDetailsField(
        'expiry_date',
        cardDetails?.expiry_date ||
          cardDetails?.document_info?.date_of_expiry ||
          '',
      );
      updateUserDetailsField(
        'full_name_native',
        cardDetails?.full_name_native ||
          cardDetails?.personal_info?.full_name_native ||
          '',
      );
      updateUserDetailsField(
        'parent_or_spouse_name',
        cardDetails?.parent_or_spouse_name ||
          cardDetails?.personal_info?.father_or_husband_name ||
          '',
      );
      updateUserDetailsField(
        'parent_or_spouse_name_native',
        cardDetails?.parent_or_spouse_name_native ||
          cardDetails?.personal_info?.father_or_husband_name_native ||
          '',
      );
      updateUserDetailsField(
        'present_address_native',
        cardDetails?.present_address_native || '',
      );
      updateUserDetailsField(
        'present_address_romanized',
        cardDetails?.present_address_romanized || '',
      );
      updateUserDetailsField(
        'permanent_address_native',
        cardDetails?.permanent_address_native || '',
      );
      updateUserDetailsField(
        'permanent_address_romanized',
        cardDetails?.permanent_address_romanized || '',
      );

      setIsEditable(false);

      // Trigger role change check for scanned card (skipped in debug — no API).
      if (
        !isDebugMode &&
        cardDetails?.ghana_card_number &&
        /^\d{5}-\d{7}-\d$/.test(cardDetails.ghana_card_number)
      ) {
        handleGhanaCardBlur(cardDetails.ghana_card_number);
      }
    }
  }, [cardDetails, updateUserDetailsField, isDebugMode]);

  // Debug Mode: prefill the contact + PIN fields the CNIC scan can't provide so
  // the form is valid and the user can simply press Next (no API calls).
  useEffect(() => {
    if (isDebugMode) {
      updateUserDetailsField('phone_number', DEBUG_USER_CONTACT.phone_number);
      updateUserDetailsField('email', DEBUG_USER_CONTACT.email);
      updateUserDetailsField(
        'residential_address',
        DEBUG_USER_CONTACT.residential_address,
      );
      updateUserDetailsField('pin', DEBUG_USER_CONTACT.pin);
      updateUserDetailsField('confirm_pin', DEBUG_USER_CONTACT.pin);
    }
  }, [isDebugMode, updateUserDetailsField]);


  const formik = useFormik({
    initialValues: {
      ghana_card_number: userDetails?.ghana_card_number || '',
      name: userDetails?.name || '',
      country_code: '+92',
      phone_number: userDetails?.phone_number || '',
      email: userDetails?.email || '',
      residential_address: userDetails?.residential_address || '',
      issue_date: userDetails?.issue_date || '',
      expiry_date: userDetails?.expiry_date || '',
      full_name_native: userDetails?.full_name_native || '',
      parent_or_spouse_name: userDetails?.parent_or_spouse_name || '',
      parent_or_spouse_name_native:
        userDetails?.parent_or_spouse_name_native || '',
      present_address_native: userDetails?.present_address_native || '',
      present_address_romanized: userDetails?.present_address_romanized || '',
      permanent_address_native: userDetails?.permanent_address_native || '',
      permanent_address_romanized:
        userDetails?.permanent_address_romanized || '',
      pin: userDetails?.pin || '',
      confirm_pin: userDetails?.confirm_pin || '',
    },
    validationSchema: UserDetailsSchema,
    validateOnMount: true,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async values => {
      // Build + persist the registration payload from the current form values.
      const proceedWithRegistration = () => {
        const registeration_data: AuthUserDetails = {
          //basic details
          name: values.name,
          ghana_card_number: values.ghana_card_number,
          phone_number: values.phone_number,
          email: values.email,
          residential_address: values.residential_address,
          pin: values.pin,
          confirm_pin: values.confirm_pin,

          //helper
          primary_role: role,
          registration_mode: 'self',
          source_flow: role,
          card_detected: !!cardDetails,
          details_changed: !cardDetails ? true : !isEditable,

          //card details
          country_code: cardDetails?.document_info.country_code || 'PAK',
          issue_date: values.issue_date || '',
          expiry_date: values.expiry_date || '',
          date_of_birth: cardDetails?.personal_info.date_of_birth || '',
          first_name: cardDetails?.personal_info.first_name || '',
          full_name: cardDetails?.personal_info.full_name || '',
          full_name_native: values.full_name_native || '',
          parent_or_spouse_name: values.parent_or_spouse_name || '',
          parent_or_spouse_name_native:
            values.parent_or_spouse_name_native || '',
          nationality: cardDetails?.personal_info.nationality || '',
          other_names: cardDetails?.personal_info.other_names || '',
          sex: cardDetails?.personal_info.sex || '',
          surname: cardDetails?.personal_info.surname || '',
          present_address_native: values.present_address_native || '',
          present_address_romanized: values.present_address_romanized || '',
          permanent_address_native: values.permanent_address_native || '',
          permanent_address_romanized:
            values.permanent_address_romanized || '',
          document_number: cardDetails?.document_info.document_number || '',
          document_type: cardDetails?.document_info.document_type || 'CNIC',
          raw_mrz: cardDetails?.raw_mrz || '',

          front_image: frontBase64 || '',
          back_image: backBase64 || '',
        };
        updateUserDetails(registeration_data);
      };

      try {
        // Debug Mode: skip status/duplicate checks and continue with the
        // prefilled data (no API calls).
        if (isDebugMode) {
          proceedWithRegistration();
          if (role === 'farmer') {
            navigate('Details' as never);
          } else {
            navigate('RegisterOTPVerification' as never);
          }
          return;
        }

        const attributes: any = {
          ghana_card_number: values.ghana_card_number,
          phone_number: values.phone_number,
          device_id: uniqueId,
        };
        
        // Always include email if it has a value
        if (values.email && typeof values.email === 'string') {
          const emailValue = values.email.trim();
          if (emailValue.length > 0) {
            attributes.email = emailValue;
          }
        }
        
        const payload = {
          data: {
            attributes,
          },
        };
        const response = await axiosPrivate.post(
          '/users/check_status',
          payload,
        );
        const {
          data: {
            attributes: { user_exists },
          },
        } = response.data;

        if (user_exists) {
          // Check which field is duplicate by making separate API calls
          let phoneNumberExists = false;
          let ghanaCardExists = false;
          let emailExists = false;
          
          try {
            // Check if phone number exists
            const phoneCheckResponse = await axiosPrivate.post(
              '/users/check_status',
              {
                data: {
                  attributes: {
                    phone_number: values.phone_number,
                    device_id: uniqueId,
                  },
                },
              },
            );
            phoneNumberExists = phoneCheckResponse.data?.data?.attributes?.user_exists || false;
          } catch (err) {
            // If check fails, assume it might exist
            console.log('Phone number check failed:', err);
          }
          
          try {
            // Check if Ghana Card exists
            const ghanaCardCheckResponse = await axiosPrivate.post(
              '/users/check_status',
              {
                data: {
                  attributes: {
                    ghana_card_number: values.ghana_card_number,
                    device_id: uniqueId,
                  },
                },
              },
            );
            ghanaCardExists = ghanaCardCheckResponse.data?.data?.attributes?.user_exists || false;
          } catch (err) {
            // If check fails, assume it might exist
            console.log('Ghana Card check failed:', err);
          }
          
          // Check if email exists (if provided)
          if (values.email && values.email.trim() !== '') {
            try {
              const emailCheckResponse = await axiosPrivate.post(
                '/users/check_status',
                {
                  data: {
                    attributes: {
                      email: values.email.trim(),
                      device_id: uniqueId,
                    },
                  },
                },
              );
              emailExists = emailCheckResponse.data?.data?.attributes?.user_exists || false;
            } catch (err) {
              // If check fails, assume it might exist
              console.log('Email check failed:', err);
            }
          }
          
          trigger('notificationError');
          
          // Determine which field is duplicate and show specific error message
          let errorMessage = 'The user already exists.';
          let errorTitle = 'User exists';
          
          // Single field duplicate
          if (phoneNumberExists && !ghanaCardExists && !emailExists) {
            errorTitle = 'Mobile number exists';
            errorMessage = 'This mobile number is already registered.';
          } else if (ghanaCardExists && !phoneNumberExists && !emailExists) {
            errorTitle = 'NADRA ID exists';
            errorMessage = 'This NADRA ID is already registered.';
          } else if (emailExists && !phoneNumberExists && !ghanaCardExists) {
            errorTitle = 'Email exists';
            errorMessage = 'This email address is already registered.';
          }
          // Two fields duplicate
          else if (phoneNumberExists && ghanaCardExists && !emailExists) {
            errorTitle = 'User exists';
            errorMessage = 'A user with this NADRA ID and mobile number already exists.';
          } else if (phoneNumberExists && emailExists && !ghanaCardExists) {
            errorTitle = 'User exists';
            errorMessage = 'A user with this mobile number and email already exists.';
          } else if (ghanaCardExists && emailExists && !phoneNumberExists) {
            errorTitle = 'User exists';
            errorMessage = 'A user with this NADRA ID and email already exists.';
          }
          // All three fields duplicate
          else if (phoneNumberExists && ghanaCardExists && emailExists) {
            errorTitle = 'User exists';
            errorMessage = 'A user with this NADRA ID, mobile number, and email already exists.';
          }
          
          Toast.show({
            type: 'error',
            text1: errorTitle,
            text2: errorMessage,
          });

          console.log('User exists');
          return;
        } else {
          proceedWithRegistration();

          if (role === 'farmer') {
            navigate('Details' as never);
            return;
          } else {
            const _payload = {
              data: {
                attributes: {
                  phone_number: values.phone_number,
                  email: values.email,
                  skip_count_check: true,
                  flow: 'REGISTRATION_OTP',
                },
              },
            };

            await axiosPublic.post('/users/request_otp', _payload);
            navigate('RegisterOTPVerification' as never);
          }
        }

        console.log(response);
      } catch (err: any) {
        trigger('notificationError');
        if (err.code === 'NETWORK_ERROR' || !err?.response) {
          Toast.show({
            type: 'error',
            text1: 'No Internet Connection',
            text2: 'Please check your internet connection and try again',
          });
          return;
        }
        const { data } = err?.response;
        
        // Check for field-level errors — API uses attribute_name, field, or field_key
        if (data?.fields?.length) {
          const fieldName = (f: any) =>
            f.attribute_name || f.field || f.field_key || '';
          const fieldMsg = (f: any) =>
            f.short_error || f.message || f.error || 'Validation error';

          const phoneField = data.fields.find((f: any) =>
            fieldName(f) === 'phone_number',
          );
          if (phoneField) {
            Toast.show({
              type: 'error',
              text1: 'Invalid mobile number',
              text2: fieldMsg(phoneField),
            });
            return;
          }

          const cardField = data.fields.find((f: any) =>
            fieldName(f) === 'ghana_card_number',
          );
          if (cardField) {
            Toast.show({
              type: 'error',
              text1: 'Invalid NADRA ID',
              text2: fieldMsg(cardField),
            });
            return;
          }

          // Any other field error — show its short_error directly
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: fieldMsg(data.fields[0]),
          });
          return;
        }
        
        if (data?.error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: data.error,
          });
        }
      }
    },
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
    setFieldTouched,
  } = formik;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Clear PIN fields when navigating back
      updateUserDetailsField('pin', '');
      updateUserDetailsField('confirm_pin', '');
      setFieldValue('pin', '');
      setFieldValue('confirm_pin', '');
    });

    return unsubscribe;
  }, [navigation, updateUserDetailsField, setFieldValue]);

  // Clear PIN fields when returning to this screen from farm details page
  useFocusEffect(
    useCallback(() => {
      // Skip clearing on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Clear PIN fields when screen comes into focus (returning from another screen)
      updateUserDetailsField('pin', '');
      updateUserDetailsField('confirm_pin', '');
      setFieldValue('pin', '');
      setFieldValue('confirm_pin', '');
    }, [updateUserDetailsField, setFieldValue])
  );

  const handleMobileFocus = () => {
    if (!values.phone_number.startsWith('+92')) {
      setFieldValue('phone_number', '+92 ');
    }
  };

  const onEdit = () => {
    setIsEditable(true);
  };

  const handleGhanaCardBlur = async (ghanaCardNumber: string) => {
    handleBlur('ghana_card_number')({
      target: { name: 'ghana_card_number' },
    } as any);
    // Only check if the card number is valid
    if (!/^\d{5}-\d{7}-\d$/.test(ghanaCardNumber)) return;

    const targetRole = role === 'agent' ? 'agent' : 'farmer';
    setCheckingGhanaCard(true);
    try {
      const result = await checkGhanaCardForRoleChange(ghanaCardNumber, targetRole);
      if (result) {
        setRoleChangeResult(result);
        setShowRoleChangeModal(true);
      }
    } catch {
      // Silently fail — the normal registration flow will handle errors
    } finally {
      setCheckingGhanaCard(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleChangeResult) return;
    setRoleChangeConfirmLoading(true);
    try {
      await requestRoleChangeOtp(roleChangeResult.phone);
      setShowRoleChangeModal(false);
      const targetRole = role === 'agent' ? 'agent' : 'farmer';
      navigate('RoleChangeOTP', {
        phone: roleChangeResult.phone,
        ghanaCardNumber: roleChangeResult.ghanaCardNumber,
        farmerName: roleChangeResult.name,
        targetRole,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'OTP Request Failed',
        text2: errorMessage,
      });
    } finally {
      setRoleChangeConfirmLoading(false);
    }
  };

  const handleRoleChangeCancel = () => {
    setShowRoleChangeModal(false);
    setRoleChangeResult(null);
    formik.resetForm();
  };

  return (
    <View
      style={[styles.scrollView, { paddingTop: useSafeAreaInsets().top + 24 }]}
    >
      <AuthHeader title="Create account" />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.OS === 'ios' ? 40 : 100}
        extraHeight={Platform.OS === 'ios' ? 40 : 100}
        keyboardOpeningTime={Platform.OS === 'ios' ? 250 : 300}
        enableResetScrollToCoords={false}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 100,
        }}
        onScrollBeginDrag={() => Platform.OS === 'ios' && Keyboard.dismiss()}
      >
        <View style={styles.container}>
          <UITypography variant="regular" style={styles.contentTitle}>
            Hello! Let’s get your{'\n'}account set
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
            ref={ghanaCardRef}
            label="NADRA ID"
            requiredLabel
            placeholder="XXXXX-XXXXXXX-X"
            mask={ghanaCardMask}
            editable={isEditable}
            value={values.ghana_card_number}
            returnKeyType="next"
            keyboardType="numeric"
            onChangeText={(masked, _unmasked) => {
              handleChange('ghana_card_number')(masked || '');
            }}
            onBlur={() => handleGhanaCardBlur(values.ghana_card_number)}
            onSubmitEditing={() => nameRef.current?.focus()}
            error={touched.ghana_card_number && !!errors.ghana_card_number}
            helperText={
              touched.ghana_card_number ? errors.ghana_card_number : ''
            }
          />
          {checkingGhanaCard && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <ActivityIndicator size="small" color="#099453" style={{ marginRight: 8 }} />
              <UITypography variant="regular" style={{ fontSize: 13, color: '#666' }}>
                Checking NADRA ID...
              </UITypography>
            </View>
          )}
          <UITextInput
            ref={nameRef}
            label={role === 'agent' ? 'Agent name' : 'Farmer name'}
            requiredLabel
            placeholder="Please enter"
            returnKeyType="next"
            editable={isEditable}
            value={values.name}
            maxLength={256}
            onChangeText={text => {
              handleChange('name')(text);
            }}
            onBlur={handleBlur('name')}
            onSubmitEditing={() => mobileRef.current?.focus()}
            error={touched.name && !!errors.name}
            helperText={touched.name ? errors.name : ''}
          />
          <UITextInput
            ref={mobileRef}
            label="MOBILE NUMBER"
            requiredLabel
            placeholder="+92 XXX XXX XXXX"
            returnKeyType="next"
            value={values.phone_number}
            mask={mobileMask}
            keyboardType="phone-pad"
            onFocus={handleMobileFocus}
            onChangeText={text => {
              const newValue = text || '';
              if (newValue.startsWith('+92') && newValue.length > 3) {
                handleChange('phone_number')(newValue);
              }
            }}
            onBlur={handleBlur('phone_number')}
            onSubmitEditing={() => emailRef.current?.focus()}
            error={touched.phone_number && !!errors.phone_number}
            helperText={touched.phone_number ? errors.phone_number : ''}
          />
          <UITextInput
            ref={emailRef}
            label="EMAIL ADDRESS (OPTIONAL)"
            placeholder="Please enter"
            returnKeyType="next"
            keyboardType="email-address"
            value={values.email}
            onChangeText={text => {
              handleChange('email')(text);
            }}
            onBlur={handleBlur('email')}
            onSubmitEditing={() => addressRef.current?.focus()}
            error={touched.email && !!errors.email}
            helperText={touched.email ? errors.email : ''}
          />
          <UITextInput
            ref={addressRef}
            label="RESIDENTIAL ADDRESS (OPTIONAL)"
            placeholder="Enter your residential address"
            returnKeyType="next"
            value={values.residential_address}
            maxLength={512}
            onChangeText={text => {
              setFieldValue('residential_address', text);
            }}
            onBlur={handleBlur('residential_address')}
            onSubmitEditing={() => pinRef.current?.focus()}
            error={touched.residential_address && !!errors.residential_address}
            helperText={touched.residential_address ? errors.residential_address : ''}
            multiline
            numberOfLines={2}
          />
          <UITypography
            variant="semiBold"
            style={{
              fontSize: 16,
              color: '#404040',
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            CNIC Details
          </UITypography>
          <View
            onLayout={e => {
              issueDateY.current = e.nativeEvent.layout.y;
            }}
          >
            <UITextInput
              label="ISSUE DATE"
              editable={false}
              error={touched.issue_date && !!errors.issue_date}
              helperText={touched.issue_date ? errors.issue_date : ''}
              pickerAddonProps={{
                type: 'calendar',
                error: touched.expiry_date && !!errors.expiry_date,
                helperText: touched.expiry_date ? errors.expiry_date : '',
                selectedValue: values.issue_date || null,
                onValueChange: (value: CalendarSelectionValue) => {
                  if (!isEditable) return;
                  setFieldTouched('issue_date', true);
                  setFieldTouched('expiry_date', true);
                  setFieldValue(
                    'issue_date',
                    typeof value === 'string' ? value : '',
                  );
                },
                onClose: () => {
                  if (touched.expiry_date && errors.expiry_date) {
                    scrollViewRef.current?.scrollToPosition(
                      0,
                      Math.max(0, expiryDateY.current - 200),
                      true,
                    );
                  }
                },
                maxDate: todayISO,
                selectionMode: 'single',
                placeholder: 'Select date',
              }}
            />
          </View>
          <View
            onLayout={e => {
              expiryDateY.current = e.nativeEvent.layout.y;
            }}
          >
            <UITextInput
              label="EXPIRY DATE"
              editable={false}
              error={touched.expiry_date && !!errors.expiry_date}
              helperText={touched.expiry_date ? errors.expiry_date : ''}
              pickerAddonProps={{
                type: 'calendar',
                error: touched.expiry_date && !!errors.expiry_date,
                helperText: touched.expiry_date ? errors.expiry_date : '',
                selectedValue: values.expiry_date || null,
                onValueChange: (value: CalendarSelectionValue) => {
                  if (!isEditable) return;
                  setFieldTouched('expiry_date', true);
                  setFieldValue(
                    'expiry_date',
                    typeof value === 'string' ? value : '',
                  );
                },
                onClose: () => {
                  if (touched.expiry_date && errors.expiry_date) {
                    scrollViewRef.current?.scrollToPosition(
                      0,
                      Math.max(0, expiryDateY.current - 200),
                      true,
                    );
                  }
                },
                minDate: values.issue_date || '1900-01-01',
                maxDate: '2100-12-31',
                selectionMode: 'single',
                placeholder: 'Select date',
              }}
            />
          </View>
          <UITextInput
            label="FULL NAME (URDU)"
            placeholder="نام"
            returnKeyType="next"
            editable={isEditable}
            value={values.full_name_native}
            maxLength={256}
            inputStyle={{ textAlign: 'right' }}
            onChangeText={text => handleChange('full_name_native')(text.replace(URDU_NATIVE_NAME_SANITIZE_REGEX, ''))}
            onBlur={handleBlur('full_name_native')}
            error={touched.full_name_native && !!errors.full_name_native}
            helperText={touched.full_name_native ? errors.full_name_native : ''}
          />
          <UITextInput
            label="FATHER / HUSBAND NAME"
            placeholder="Please enter"
            returnKeyType="next"
            editable={isEditable}
            value={values.parent_or_spouse_name}
            maxLength={256}
            onChangeText={text => handleChange('parent_or_spouse_name')(text.replace(ENGLISH_NAME_SANITIZE_REGEX, ''))}
            onBlur={handleBlur('parent_or_spouse_name')}
            error={
              touched.parent_or_spouse_name && !!errors.parent_or_spouse_name
            }
            helperText={
              touched.parent_or_spouse_name ? errors.parent_or_spouse_name : ''
            }
          />
          <UITextInput
            label="FATHER / HUSBAND NAME (URDU)"
            placeholder="والد / شوہر کا نام"
            returnKeyType="next"
            editable={isEditable}
            value={values.parent_or_spouse_name_native}
            maxLength={256}
            inputStyle={{ textAlign: 'right' }}
            onChangeText={text =>
              handleChange('parent_or_spouse_name_native')(text.replace(URDU_NATIVE_NAME_SANITIZE_REGEX, ''))
            }
            onBlur={handleBlur('parent_or_spouse_name_native')}
            error={
              touched.parent_or_spouse_name_native &&
              !!errors.parent_or_spouse_name_native
            }
            helperText={
              touched.parent_or_spouse_name_native
                ? errors.parent_or_spouse_name_native
                : ''
            }
          />
          <UITextInput
            label="PRESENT ADDRESS (URDU)"
            placeholder="موجودہ پتہ"
            returnKeyType="next"
            editable={isEditable}
            value={values.present_address_native}
            maxLength={512}
            multiline
            numberOfLines={2}
            inputStyle={{ textAlign: 'right' }}
            onChangeText={text => handleChange('present_address_native')(text)}
            onBlur={handleBlur('present_address_native')}
            error={
              touched.present_address_native && !!errors.present_address_native
            }
            helperText={
              touched.present_address_native
                ? errors.present_address_native
                : ''
            }
          />
          <UITextInput
            label="PRESENT ADDRESS (ROMAN URDU)"
            placeholder="Please enter"
            returnKeyType="next"
            editable={isEditable}
            value={values.present_address_romanized}
            maxLength={512}
            multiline
            numberOfLines={2}
            onChangeText={text =>
              handleChange('present_address_romanized')(text)
            }
            onBlur={handleBlur('present_address_romanized')}
            error={
              touched.present_address_romanized &&
              !!errors.present_address_romanized
            }
            helperText={
              touched.present_address_romanized
                ? errors.present_address_romanized
                : ''
            }
          />
          <UITextInput
            label="PERMANENT ADDRESS (URDU)"
            placeholder="مستقل پتہ"
            returnKeyType="next"
            editable={isEditable}
            value={values.permanent_address_native}
            maxLength={512}
            multiline
            numberOfLines={2}
            inputStyle={{ textAlign: 'right' }}
            onChangeText={text => handleChange('permanent_address_native')(text)}
            onBlur={handleBlur('permanent_address_native')}
            error={
              touched.permanent_address_native &&
              !!errors.permanent_address_native
            }
            helperText={
              touched.permanent_address_native
                ? errors.permanent_address_native
                : ''
            }
          />
          <UITextInput
            label="PERMANENT ADDRESS (ROMAN URDU)"
            placeholder="Please enter"
            returnKeyType="next"
            editable={isEditable}
            value={values.permanent_address_romanized}
            maxLength={512}
            multiline
            numberOfLines={2}
            onChangeText={text =>
              handleChange('permanent_address_romanized')(text)
            }
            onBlur={handleBlur('permanent_address_romanized')}
            error={
              touched.permanent_address_romanized &&
              !!errors.permanent_address_romanized
            }
            helperText={
              touched.permanent_address_romanized
                ? errors.permanent_address_romanized
                : ''
            }
          />
          <UITextInput
            ref={pinRef}
            password
            label="Create New PIN"
            requiredLabel
            placeholder="Enter your PIN"
            returnKeyType="next"
            keyboardType="numeric"
            mask={pinMask}
            value={values.pin}
            onChangeText={text => {
              handleChange('pin')(text);
            }}
            onBlur={handleBlur('pin')}
            onSubmitEditing={() => confirmPinRef.current?.focus()}
            error={touched.pin && !!errors.pin}
            helperText={touched.pin ? errors.pin : ''}
          />
          <UITextInput
            ref={confirmPinRef}
            password
            label="Confirm PIN"
            requiredLabel
            placeholder="Retype PIN"
            returnKeyType="done"
            keyboardType="numeric"
            mask={pinMask}
            value={values.confirm_pin}
            onChangeText={text => {
              handleChange('confirm_pin')(text);
            }}
            onBlur={handleBlur('confirm_pin')}
            error={touched.confirm_pin && !!errors.confirm_pin}
            helperText={touched.confirm_pin ? errors.confirm_pin : ''}
          />
        </View>
      </KeyboardAwareScrollView>
      <View
        style={[
          styles.footer,
          { paddingBottom: useSafeAreaInsets().bottom + 24 },
        ]}
      >
        <UIContainedButton
          key={isValid ? 'enabled' : 'disabled'}
          loading={isSubmitting}
          disabled={!isValid}
          onPress={handleSubmit}
        >
          Next
        </UIContainedButton>
      </View>
      <RoleChangeModal
        visible={showRoleChangeModal}
        farmerName={roleChangeResult?.name || ''}
        targetRole={role === 'agent' ? 'agent' : 'farmer'}
        onConfirm={handleRoleChangeConfirm}
        onCancel={handleRoleChangeCancel}
        loading={roleChangeConfirmLoading}
      />
    </View>
  );
}
