import IDBackIcon from '@/components/icons/IDBackIcon';
import IDFrontIcon from '@/components/icons/IDFrontIcon';
import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UIContainedButton, UITypography } from '@/components/ui';
import { axiosPublic } from '@/config/axios';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import { API_CNIC_OCR_URL, API_X_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StatusBar, View } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AgentFarmerIdVerificationScreen.styled';
import { useAgentFarmerRegister } from '@/constants/context/agent/agent-farmer-register/context';

export default function AgentFarmerIdVerificationScreen() {
  const { frontBase64, backBase64, setCardDetails, reset } =
    useFarmerIdCardStore();
  const { resetAll } = useAgentFarmerRegister();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const navigation = useNavigation<any>();
  const [uniqueId, setUniqueId] = useState('');

  useEffect(() => {
    getUniqueId()
      .then(id => setUniqueId(id))
      .catch(() => setUniqueId(''));
  }, []);

  const handleCameraRoute = (side: 'front' | 'back') => {
    navigation.navigate('FarmerIdCamera', { side });
  };
  const handleSubmit = async () => {
    if (scanAttempts >= 3) {
      navigation.navigate('FarmerRegister' as never);
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
        if (!data.ghana_card_number) {
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
              ghana_card_number: data.ghana_card_number,
              source_flow: 'agent_onboarding',
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
          trigger('notificationError');
          Toast.show({
            type: 'error',
            text1: 'User already exists',
            text2: 'User with provided NADRA ID already exists',
          });
        } else {
          navigation.navigate('FarmerRegister' as never);
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

      trigger('notificationError', { ignoreAndroidSystemSettings: true });

      if (
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
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      reset();
      resetAll();
    });

    return unsubscribe;
  }, [navigation, reset, resetAll]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <AuthHeader title="Let's Verify Your Identity" />
      <ScrollView style={{ marginTop: 20, flex: 1 }}>
        <UITypography variant="medium" style={{ fontSize: 16 }}>
          Please capture your NADRA ID to continue registration.
        </UITypography>
        <View
          style={{
            gap: 24,
            flex: 1,
            // justifyContent: "center",
            marginTop: 24,
          }}
        >
          {frontBase64 ? (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <UITypography variant="semiBold" style={{ fontSize: 16 }}>
                  Front
                </UITypography>
                {scanAttempts < 3 && (
                  <UITypography
                    variant="semiBold"
                    style={{
                      fontSize: 16,
                      color: '#099453',
                      textDecorationLine: 'underline',
                    }}
                    onPress={() => handleCameraRoute('front')}
                  >
                    Retake
                  </UITypography>
                )}
              </View>
              <Image
                source={{ uri: `data:image/jpeg;base64,${frontBase64}` }}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  aspectRatio: 5 / 3,
                }}
              />
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 24,
              }}
            >
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
                  <UITypography variant="medium" style={{ fontSize: 16 }}>
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <UITypography variant="semiBold" style={{ fontSize: 16 }}>
                  Back
                </UITypography>
                {scanAttempts < 3 && (
                  <UITypography
                    variant="semiBold"
                    style={{
                      fontSize: 16,
                      color: '#099453',
                      textDecorationLine: 'underline',
                    }}
                    onPress={() => handleCameraRoute('back')}
                  >
                    Retake
                  </UITypography>
                )}
              </View>
              <Image
                source={{ uri: `data:image/jpeg;base64,${backBase64}` }}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  aspectRatio: 5 / 3,
                }}
              />
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 24,
              }}
            >
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
                  <UITypography variant="medium" style={{ fontSize: 16 }}>
                    Capture the back of your{'\n'}NADRA ID
                  </UITypography>
                </View>
                <UIContainedButton
                  size="small"
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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
              marginBottom: 24,
            }}
            onPress={() => navigation.navigate('FarmerRegister' as never)}
          >
            Skip Scan, Enter Manually
          </UITypography>
        </View>
      </ScrollView>
    </View>
  );
}
