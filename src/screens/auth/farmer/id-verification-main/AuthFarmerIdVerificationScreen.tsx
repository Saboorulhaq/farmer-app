import IDBackIcon from '@/components/icons/IDBackIcon';
import IDFrontIcon from '@/components/icons/IDFrontIcon';
import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { checkGhanaCardForRoleChange } from '@/services/roleChangeService';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useDebugStore } from '@/store/useDebugStore';
import {
  DEBUG_BACK_BASE64,
  DEBUG_BACK_IMAGE,
  DEBUG_CARD_DETAILS,
  DEBUG_FRONT_BASE64,
  DEBUG_FRONT_IMAGE,
} from '@/constants/testing/registrationDebugData';
import { API_CNIC_OCR_URL, API_X_API_KEY } from '@env';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StatusBar, View } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AuthFarmerIdVerificationScreen.styled';

export default function AuthFarmerIdVerificationScreen() {
  const { frontBase64, backBase64, setCardDetails, reset } =
    useFarmerIdCardStore();
  const setFrontBase64 = useFarmerIdCardStore(state => state.setFrontBase64);
  const setBackBase64 = useFarmerIdCardStore(state => state.setBackBase64);
  const { top, bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const navigation = useNavigation<FarmerAuthNavigationProp>();
  const { role, resetUserDetails } = useRegisterStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const [uniqueId, setUniqueId] = useState('');
  const netInfo = useNetInfo();

  useEffect(() => {
    getUniqueId()
      .then(id => setUniqueId(id))
      .catch(() => setUniqueId(''));
  }, []);

  // Debug Mode: prefill both NADRA cards with the hardcoded sample images so the
  // user can jump straight to CONFIRM without capturing anything.
  useEffect(() => {
    if (isDebugMode && (!frontBase64 || !backBase64)) {
      setFrontBase64(DEBUG_FRONT_BASE64);
      setBackBase64(DEBUG_BACK_BASE64);
    }
  }, [isDebugMode, frontBase64, backBase64, setFrontBase64, setBackBase64]);

  const handleCameraRoute = (side: 'front' | 'back') => {
    navigation.navigate('IdVerificationCamera', { side });
  };

  const handleSubmit = async () => {
    // Debug Mode: skip OCR + status checks and continue with the hardcoded
    // CNIC details, which prefill the user-details screen.
    if (isDebugMode) {
      setCardDetails(DEBUG_CARD_DETAILS);
      navigation.navigate('UserDetails');
      return;
    }

    if (scanAttempts >= 3) {
      navigation.navigate('UserDetails');
      return;
    }

    if (!frontBase64 || !backBase64) {
      trigger('notificationError');
      Toast.show({
        type: 'error',
        text1: 'Both sides required',
        text2: 'Please capture the front and back of your NADRA ID.',
      });
      return;
    }

    setLoading(true);
    try {
      // Strip data-URL prefix (e.g. "data:image/jpeg;base64,") if the
      // camera library included it, then remove MIME line-break whitespace.
      const sanitizeBase64 = (b64: string) => {
        const match = b64.match(/^data:[^;]+;base64,(.+)$/s);
        return (match ? match[1] : b64).replace(/\s/g, '');
      };
      const front_image = sanitizeBase64(frontBase64 as string);
      const back_image = sanitizeBase64(backBase64 as string);
      const payload = {
        country_code: 'PAK',
        document_type: 'CNIC',
        front_image,
        back_image,
      };

      console.log(
        '\n📤 [CNIC OCR REQUEST]',
        `\n→ POST ${API_CNIC_OCR_URL}`,
        '\n→ Body:',
        JSON.stringify({
          country_code: payload.country_code,
          document_type: payload.document_type,
          front_image: `[base64, ${payload.front_image.length} chars]`,
          back_image: `[base64, ${payload.back_image.length} chars]`,
        }, null, 2),
      );

      const response = await axios.post(API_CNIC_OCR_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-Key': API_X_API_KEY,
        },
        timeout: 150000,
      });

      const data = response.data;
      console.log(
        '\n📥 [CNIC OCR RESPONSE]',
        `\n← Status: ${response.status}`,
        '\n← Data:', JSON.stringify(data, null, 2),
      );

      if (response.status === 200 && data?.success) {
        const ghana_card_number =
          data.ghana_card_number || data.identity_number || '';
        if (!ghana_card_number) {
          trigger('notificationError');
          Toast.show({
            type: 'error',
            text1: 'NADRA ID extraction failed',
            text2: 'Could not extract NADRA ID number. Please try again with a clearer image.',
          });
          setScanAttempts(prev => prev + 1);
          return;
        }
        setCardDetails(data);
        const _response = await axiosPublic.post('/users/check_status', {
          data: {
            attributes: {
              ghana_card_number: ghana_card_number,
              source_flow: role,
              device_id: uniqueId,
            },
          },
        });
        const {
          data: {
            attributes: { user_exists },
          },
        } = _response.data;

        if (user_exists) {
          // A user with this Ghana Card already exists. Before blocking,
          // check whether they are eligible to add the current role (e.g. an
          // existing farmer adding the agent role). If so, continue to
          // UserDetails where the RoleChangeModal prompts to add the role —
          // matching the manual Ghana Card entry flow.
          const targetRole = role === 'agent' ? 'agent' : 'farmer';
          let roleChangeEligible = false;
          try {
            const roleChangeResult = await checkGhanaCardForRoleChange(
              ghana_card_number,
              targetRole,
            );
            roleChangeEligible = !!roleChangeResult;
          } catch {
            // Ignore — fall back to the existing "user exists" behaviour.
          }

          if (roleChangeEligible) {
            navigation.navigate('UserDetails');
          } else {
            trigger('notificationError');
            Toast.show({
              type: 'error',
              text1: 'User already exists',
              text2: 'User with provided NADRA ID already exists',
            });
          }
        } else {
          navigation.navigate('UserDetails');
        }
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const errorCode = data?.error_code || data?.code;
      console.log(
        '\n❌ [CNIC OCR ERROR]',
        `\n← Status: ${status}`,
        `\n← Code: ${errorCode}`,
        '\n← Data:', JSON.stringify(data, null, 2),
      );

      trigger('notificationError');

      if (
        !netInfo.isConnected ||
        err.code === 'NETWORK_ERROR' ||
        err.code === 'ECONNABORTED' ||
        !err?.response
      ) {
        Toast.show({
          type: 'error',
          text1:
            err.code === 'ECONNABORTED'
              ? 'Request timed out'
              : 'No Internet Connection',
          text2:
            err.code === 'ECONNABORTED'
              ? 'ID verification is taking too long. Please try again.'
              : 'Please check your internet connection and try again',
        });
        return;
      }

      switch (errorCode) {
        case 'INVALID_REQUEST':
        case 'CNIC_SIDE_MISMATCH':
        case 'OCR_PROVIDER_FAILED': {
          setScanAttempts(prev => prev + 1);
          const maxAttempts = 2;
          const attemptsLeft = Math.max(0, maxAttempts - scanAttempts);
          const guidance =
            errorCode === 'CNIC_SIDE_MISMATCH'
              ? 'Please capture the front and back of the same NADRA ID.'
              : 'Please upload valid, clear images of both sides of your NADRA ID.';
          Toast.show({
            type: 'error',
            text1: 'ID verification failed',
            text2:
              attemptsLeft === 0
                ? 'Please enter card details manually'
                : `${guidance} You have ${attemptsLeft} attempt${
                    attemptsLeft > 1 ? 's' : ''
                  } left.`,
          });
          break;
        }
        case 'UNSUPPORTED_DOCUMENT':
          Toast.show({
            type: 'error',
            text1: 'Unsupported document',
            text2: 'Please scan a valid NADRA ID (CNIC).',
          });
          break;
        case 'RATE_LIMIT_EXCEEDED':
          Toast.show({
            type: 'error',
            text1: 'Too many attempts',
            text2: 'Please wait a moment and try again.',
          });
          break;
        case 'AUTH_INVALID_KEY':
        case 'ANTHROPIC_NOT_CONFIGURED':
          Toast.show({
            type: 'error',
            text1: 'Service unavailable',
            text2:
              'ID verification is temporarily unavailable. Please try again later or enter details manually.',
          });
          break;
        default:
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2:
              data?.error ||
              data?.message ||
              'Something went wrong. Please try again.',
          });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', _e => {
      console.log('User pressed back or tried to leave this screen');
      // Defer store updates to avoid updating state during render
      setTimeout(() => {
        resetUserDetails();
        reset();
      }, 0);
    });

    return unsubscribe;
  }, [navigation, reset, resetUserDetails]);

  return (
    <View
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <AuthHeader title="Let's Verify Your Identity" />
      <ScrollView style={styles.container}>
        <UITypography variant="medium" style={styles.text}>
          Please capture your NADRA ID to continue registration.
        </UITypography>
        <View style={styles.cardContainer}>
          {frontBase64 ? (
            <View>
              <View style={styles.cardHeader}>
                <UITypography variant="semiBold" style={styles.cardHeaderText}>
                  Front
                </UITypography>
                {scanAttempts < 3 && (
                  <UITypography
                    variant="semiBold"
                    style={styles.cardHeaderLink}
                    onPress={() => handleCameraRoute('front')}
                  >
                    Retake
                  </UITypography>
                )}
              </View>
              <View style={styles.cardImageContainer}>
                <Image
                  source={
                    isDebugMode
                      ? DEBUG_FRONT_IMAGE
                      : { uri: `data:image/jpeg;base64,${frontBase64}` }
                  }
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={{ gap: 24 }}>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 80,
                      alignSelf: 'center',
                      aspectRatio: 5 / 3,
                    }}
                  >
                    <IDFrontIcon />
                  </View>
                  <UITypography variant="medium" style={styles.cardText}>
                    Capture the front of your{'\n'}NADRA ID
                  </UITypography>
                </View>
                <UIContainedButton
                  size="small"
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => handleCameraRoute('front')}
                >
                  Take Photo of Front
                </UIContainedButton>
              </View>
            </View>
          )}
          {backBase64 ? (
            <View>
              <View style={styles.cardHeader}>
                <UITypography variant="semiBold" style={styles.cardHeaderText}>
                  Back
                </UITypography>
                {scanAttempts < 3 && (
                  <UITypography
                    variant="semiBold"
                    style={styles.cardHeaderLink}
                    onPress={() => handleCameraRoute('back')}
                  >
                    Retake
                  </UITypography>
                )}
              </View>
              <View style={styles.cardImageContainer}>
                <Image
                  source={
                    isDebugMode
                      ? DEBUG_BACK_IMAGE
                      : { uri: `data:image/jpeg;base64,${backBase64}` }
                  }
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={{ gap: 24 }}>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 80,
                      alignSelf: 'center',
                      aspectRatio: 5 / 3,
                    }}
                  >
                    <IDBackIcon />
                  </View>
                  <UITypography variant="medium" style={styles.cardText}>
                    Capture the back of your{'\n'}NADRA ID
                  </UITypography>
                </View>
                <UIContainedButton
                  size="small"
                  style={styles.cardImageButton}
                  onPress={() => handleCameraRoute('back')}
                >
                  Take Photo of Back
                </UIContainedButton>
              </View>
            </View>
          )}
          <UIContainedButton
            loading={loading}
            disabled={!frontBase64 || !backBase64 || loading || scanAttempts >= 3}
            onPress={handleSubmit}
          >
            CONFIRM
          </UIContainedButton>
          <UITypography
            variant="semiBold"
            style={{
              fontSize: 16,
              color: '#099453',
              textDecorationLine: 'underline',
              textAlign: 'center',
              marginTop: 16,
              marginBottom: bottom + 24,
            }}
            onPress={() => navigation.navigate('UserDetails')}
          >
            Skip Scan, Enter Manually
          </UITypography>
        </View>
      </ScrollView>
    </View>
  );
}
