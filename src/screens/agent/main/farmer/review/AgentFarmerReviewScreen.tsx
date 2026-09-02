import AuthHeader from '@/components/layout/auth/AuthHeader';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';
import { UICheckbox, UIContainedButton, UITypography } from '@/components/ui'; // assuming your UI components folder
import { axiosPrivate, axiosPublic } from '@/config/axios';
import { useAgentFarmerRegister } from '@/constants/context/agent/agent-farmer-register/context';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './AgentFarmerReviewScreen.styled';
import { trigger } from 'react-native-haptic-feedback';

export default function AgentFarmerReviewScreen() {
  const { replace } = useNavigation();
  const { top, bottom } = useSafeAreaInsets();
  const { farmerDetails, farmDetails } = useAgentFarmerRegister();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          attributes: {
            phone_number: farmerDetails.phoneNumber,
            email: farmerDetails.email,
            skip_count_check: true,
            flow: 'REGISTRATION_OTP',
          },
        },
      };
      await axiosPublic.post('/users/request_otp', payload);

      // await axiosPrivate.post(`/agents/farmers/${farmerId}/request_otp`);
      replace('FarmerOTP');
    } catch (err: any) {
      trigger('notificationError');

      const error = err.response.data?.error;
      console.log(error);
      if (err.code === 'NETWORK_ERROR' || !err?.response) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection and try again',
        });
        return;
      }
      const { data } = err?.response;
      if (data?.error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.error,
        });
      }
    } finally {
      setLoading(false);
    }
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
      <AuthHeader title="Summary" />

      <ScrollView
        style={{
          flex: 1,
          paddingBottom: Platform.OS === 'ios' ? bottom : bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <UITypography variant="regular" style={styles.contentTitle}>
          Please verify your customer information.
        </UITypography>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <View>
            <UITypography variant="regular" style={styles.label}>
              Farmer Name
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 16, color: '#101010' }}
            >
              {farmerDetails.name}
            </UITypography>
          </View>
          <View>
            <UITypography variant="regular" style={styles.label}>
              NADRA ID
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 16, color: '#101010' }}
            >
              {farmerDetails.ghanaCardNumber}
            </UITypography>
          </View>
          <View>
            <UITypography variant="regular" style={styles.label}>
              Mobile number
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 16, color: '#101010' }}
            >
              {farmerDetails.phoneNumber}
            </UITypography>
          </View>
          {farmerDetails.residentialAddress &&
          farmerDetails.residentialAddress.trim() !== '' ? (
            <View>
              <UITypography variant="regular" style={styles.label}>
                Residential Address
              </UITypography>
              <UITypography
                variant="semiBold"
                style={{ fontSize: 16, color: '#101010' }}
              >
                {farmerDetails.residentialAddress}
              </UITypography>
            </View>
          ) : null}
        </View>

        {/* Farm Info Card */}
        <View style={styles.card}>
          <View>
            <UITypography variant="regular" style={styles.label}>
              Farm Ownership
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{
                fontSize: 16,
                color: '#101010',
                textTransform: 'capitalize',
              }}
            >
              {farmDetails.ownsFarm}
            </UITypography>
          </View>
          <View>
            <UITypography variant="regular" style={styles.label}>
              Farm Size
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 16, color: '#101010' }}
            >
              {farmDetails.farmSize} {farmDetails.farmSizeUnit}
            </UITypography>
          </View>
          <View>
            <UITypography variant="regular" style={styles.label}>
              Primary Produce
            </UITypography>
            <UITypography
              variant="semiBold"
              style={{ fontSize: 16, color: '#101010' }}
            >
              {farmDetails.primaryCrop}
            </UITypography>
          </View>
          {farmDetails.secondaryCrop !== null && (
            <View>
              <UITypography variant="regular" style={styles.label}>
                Secondary Produce (Optional)
              </UITypography>
              <UITypography
                variant="semiBold"
                style={{ fontSize: 16, color: '#101010' }}
              >
                {farmDetails.secondaryCrop || '-'}
              </UITypography>
            </View>
          )}

          {farmDetails.ghanaPostGPS && farmDetails.ghanaPostGPS.trim() !== '' && (
            <View>
              <UITypography variant="regular" style={styles.label}>
                Postal Code
              </UITypography>
              <UITypography
                variant="semiBold"
                style={{ fontSize: 16, color: '#101010' }}
              >
                {farmDetails.ghanaPostGPS}
              </UITypography>
            </View>
          )}

          {farmDetails.addressLine && farmDetails.addressLine.trim() !== '' && (
            <View>
              <UITypography variant="regular" style={styles.label}>
                Address
              </UITypography>
              <UITypography
                variant="semiBold"
                style={{ fontSize: 16, color: '#101010' }}
              >
                {farmDetails.addressLine}
              </UITypography>
            </View>
          )}
        </View>

        {/* Terms and Privacy */}
        <View style={styles.agreement}>
          <UICheckbox
            checked={agreed}
            onPress={() => {
              setAgreed(!agreed);
            }}
          />
          <UITypography variant="regular" style={styles.agreementText}>
            Farmer agrees to the Terms and{'\n'}Conditions and{' '}
            <UITypography
              variant="semiBold"
              style={{ color: '#16A34A' }}
              onPress={() => setPrivacyVisible(true)}
            >
              Privacy Policy
            </UITypography>
          </UITypography>
        </View>

        {/* Confirm Button */}
        <UIContainedButton
          key={agreed ? 'enabled' : 'disabled'}
          loading={loading}
          onPress={handleConfirm}
          disabled={!agreed}
        >
          CONFIRM
        </UIContainedButton>
        <AuthFarmerPrivacyModal
          visible={privacyVisible}
          onClose={() => setPrivacyVisible(false)}
        />
      </ScrollView>
    </View>
  );
}
