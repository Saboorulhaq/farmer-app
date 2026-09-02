import React, { useState } from 'react';
import { View, ScrollView, StatusBar, Image, Pressable, ActivityIndicator } from 'react-native';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import DocumentIcon from '@/components/icons/DocumentIcon';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosPublic, axiosFinancingPrivate } from '@/config/axios';
import ShoppingBasketImg from '@/assets/images/shopping-basket.png';

// Crop images mapping
const CROP_IMAGES: Record<string, any> = {
  sorghum: require('@/assets/images/farmer/miki39st-vq8p2xu.png'),
  maize: require('@/assets/images/farmer/buyer-corn.png'),
  rice: require('@/assets/images/farmer/miki3c1v-m1nokpj.png'),
  wheat: require('@/assets/images/farmer/buyer-corn.png'),
  soybean: require('@/assets/images/farmer/buyer-tractor.png'),
  cowpea: require('@/assets/images/farmer/miki48tg-n8cc25j.png'),
  tomato: require('@/assets/images/farmer/gvb-banner.png'),
  onion: require('@/assets/images/farmer/miki44o0-bllx5jp.png'),
};

type RouteParams = {
  HarvestOfferSummary: {
    harvestData?: {
      crop: string;
      expectedYield: string;
      yieldUnit: string;
      pickupLocation: string;
      unitPrice?: number | null;
    };
    selectedOption?: 'aggregators' | 'forward_sale';
    buyer?: {
      id: string;
      title: string;
      gps: string;
    };
    submissionId?: string;
  };
};

export default function HarvestOfferSummary() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'HarvestOfferSummary'>>();
  const { top, bottom } = useSafeAreaInsets();
  const { farmer } = useFarmer();

  const [loading, setLoading] = useState(false);

  const harvestData = route.params?.harvestData;
  const selectedOption = route.params?.selectedOption;
  const buyer = route.params?.buyer;
  const submissionId = route.params?.submissionId;

  // Calculate total
  const volume = parseInt(harvestData?.expectedYield || '0', 10);
  const unitPrice = harvestData?.unitPrice ?? 0;
  const totalAmount = volume * unitPrice;

  // Get crop image
  const cropKey = harvestData?.crop?.toLowerCase() || 'maize';
  const cropImage = CROP_IMAGES[cropKey] || CROP_IMAGES.maize;

  const handlePackageOffer = async () => {
    setLoading(true);
    try {
      // Create the submission once here (at the end of the flow, before OTP) with all
      // the data collected across the previous steps. No submission_id => the backend
      // creates a fresh submission and returns its id, which we hand to the OTP screen.
      const sellTypeValue =
        selectedOption === 'aggregators' ? 'sell_to_aggregators' : 'forward_sale_agreement';

      const payload: Record<string, any> = {
        product_slug: 'sell-harvest',
        is_draft: false,
        type: 'product_submission',
        step_identifier: 'harvest_details',
        step_number: 1,
        field_values: {
          crop: harvestData?.crop?.toLowerCase(),
          expected_yield: volume,
          expected_yield_unit: harvestData?.yieldUnit,
          pickup_location: harvestData?.pickupLocation,
          sell_type: sellTypeValue,
          buyer: buyer?.id,
          volume,
          unit: harvestData?.yieldUnit,
          unit_price: unitPrice,
        },
      };
      if (submissionId) {
        payload.submission_id = submissionId;
      }

      console.log('📤 Submitting harvest offer summary:', JSON.stringify(payload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', payload);
      const responseData = response.data?.data || response.data;
      const finalSubmissionId =
        responseData?.submission_id || responseData?.attributes?.submission_id || submissionId || null;
      console.log('✅ Harvest offer summary submitted successfully:', responseData);

      // Request OTP
      const otpPayload = {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            skip_count_check: true,
            flow: 'SELL_HARVEST_OTP',
          },
        },
      };

      console.log('📤 Requesting OTP for sell harvest:', farmer?.attributes?.phone_number);
      const otpResponse = await axiosPublic.post('/users/request_otp', otpPayload);

      const message = otpResponse.data?.data?.attributes?.message || 'Verification code sent.';
      Toast.show({ type: 'success', text1: 'Code Sent', text2: message });

      // Navigate to OTP verification
      navigation.navigate('LoanRequestOTPVerification', {
        productSlug: 'sell-harvest',
        productSubmissionId: finalSubmissionId,
        harvestData,
        selectedOption,
        buyer,
        isSellHarvest: true,
        otpFlow: 'SELL_HARVEST_OTP',
      });
    } catch (err: any) {
      console.log('❌ Failed to package offer:', err?.response?.data || err?.message);
      const errorMessage = err?.response?.data?.error || 'Failed to process request. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <LoanScreenHeader
        title="Sell Harvest"
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Harvest Details Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.headerIconContainer}>
                <DocumentIcon width={20} height={20} color="#FFFFFF" />
              </View>
              <UITypography variant="semiBold" style={styles.cardTitle}>
                Harvest Details
              </UITypography>
            </View>
          </View>

          {/* Crop Pill */}
          <View style={styles.cropPill}>
            <Image source={cropImage} style={styles.cropImage} resizeMode="contain" />
            <UITypography variant="medium" style={styles.cropText}>
              {harvestData?.crop || 'Sorghum'}
            </UITypography>
          </View>

          {/* Volume and Units Row */}
          <View style={styles.fieldsRow}>
            <View style={styles.fieldContainer}>
              <UITypography variant="medium" style={styles.fieldLabel}>
                Volume
              </UITypography>
              <UITypography variant="semiBold" style={styles.fieldValue}>
                {harvestData?.expectedYield || '500'}
              </UITypography>
            </View>
            <View style={styles.fieldContainerSecond}>
              <UITypography variant="medium" style={styles.fieldLabel}>
                Units
              </UITypography>
              <UITypography variant="semiBold" style={styles.fieldValue}>
                {harvestData?.yieldUnit || 'KGs'}
              </UITypography>
            </View>
          </View>

          {/* Unit Price */}
          <View style={styles.fullWidthField}>
            <UITypography variant="medium" style={styles.fieldLabel}>
              Unit Price
            </UITypography>
            <UITypography variant="semiBold" style={styles.fieldValue}>
              Rs {unitPrice}
            </UITypography>
          </View>

          {/* Total Row */}
          <View style={styles.dividerRow}>
            <View style={styles.totalContainer}>
              <Image source={ShoppingBasketImg} style={styles.cartIcon} resizeMode="contain" />
              <UITypography variant="semiBold" style={styles.totalAmount}>
                Rs {totalAmount.toLocaleString()}
              </UITypography>
            </View>
            <View style={styles.verticalDivider} />
            <UITypography variant="medium" style={styles.itemCount}>
              1 Item
            </UITypography>
          </View>
        </View>

        {/* Package Offer Button */}
        <View style={[styles.buttonContainer, { marginBottom: bottom + 20 }]}>
          <UIContainedButton
            onPress={handlePackageOffer}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              'Package Offer'
            )}
          </UIContainedButton>
        </View>
      </ScrollView>
    </View>
  );
}
