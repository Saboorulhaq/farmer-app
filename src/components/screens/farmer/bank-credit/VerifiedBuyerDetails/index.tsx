import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import UITypography from '@/components/ui/typography';
import LocationIcon from '@/components/icons/LocationIcon';
import ShoppingCartIcon from '@/components/icons/ShoppingCartIcon';
import HouseIcon from '@/components/icons/HouseIcon';
import VerifiedUsersIcon from '@/components/icons/VerifiedUsersIcon';
import FingerprintIcon from '@/components/icons/FingerprintIcon';
import NavigationArrowIcon from '@/components/icons/NavigationArrowIcon';
import FeatureBadge from './components/FeatureBadge';
import InfoRow from './components/InfoRow';
import ProductItem from './components/ProductItem';
import { BUYER_IMG_CORN } from '@/assets/images/farmer';
import { TabView } from 'react-native-tab-view';
import type { FSAStep } from '@/store/useProductsStore';
import { axiosFinancingPrivate } from '@/config/axios';

type BuyerDetail = {
  id: string;
  title: string;
  gps: string;
  image?: any;
  deals?: string[];
  products?: { name: string; icon?: any }[];
  crops?: string[];
  uuid?: string;
  company_name?: string;
  ghana_post_gps?: string;
  location?: string;
  phone_number?: string;
  has_catalog?: boolean;
  purchase_disabled_message?: string;
  accepts_provider_credit?: boolean;
  provider_credit_disabled_message?: string;
};

export default function VerifiedBuyerDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top } = useSafeAreaInsets();
  const buyer: BuyerDetail = useMemo(
    () => route.params?.buyer ?? {},
    [route.params],
  );
  const fsaSteps: FSAStep[] | undefined = route.params?.fsaSteps;
  const productSlug: string = route.params?.productSlug || 'bank-credit';
  const harvestData = route.params?.harvestData;
  const selectedOption = route.params?.selectedOption;
  const harvestDetailId = route.params?.harvestDetailId;
  const initiateFsaStaticFlow = route.params?.initiateFsaStaticFlow;

  console.log('📝 VerifiedBuyerDetails received:', {
    productSlug,
    harvestData,
    selectedOption,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(
    route.params?.submissionId || null,
  );

  // Check if this is a buy-inputs product or sell harvest flow
  const isBuyInputsProduct = productSlug === 'buy-inputs';
  const isSellHarvestFlow = !!harvestData && !!selectedOption;

  // Catalog availability - use has_catalog from provider data (no separate API call needed)
  const hasCatalogItems = isBuyInputsProduct ? (buyer.has_catalog ?? true) : null;
  const catalogLoading = false;

  // Handler for primary CTA button
  const handlePrimaryCTA = useCallback(async () => {
    // Static "Initiate FSA" flow: skip the /submissions API call and go
    // straight to the Sale Agreement (forward_sale_agreement) form step.
    if (initiateFsaStaticFlow) {
      navigation.navigate('SaleAgreement', {
        buyer,
        initiateFsaStaticFlow: true,
      });
      return;
    }

    // For sell harvest flow, carry the selected buyer to HarvestOfferSummary.
    // No /submissions call here — the submission is created once at the end of the
    // flow (before OTP) in HarvestOfferSummary.
    if (isSellHarvestFlow) {
      console.log('✅ Buyer selected for sell harvest:', {
        buyer: buyer.title,
        buyerUuid: buyer.id || buyer.uuid,
        harvestData,
        selectedOption,
      });

      navigation.navigate('HarvestOfferSummary', {
        buyer: {
          id: buyer.id || buyer.uuid,
          title: buyer.title || buyer.company_name,
          gps: buyer.gps || buyer.ghana_post_gps,
        },
        harvestData,
        selectedOption,
        harvestDetailId,
        submissionId,
      });
      return;
    }
    
    if (!buyer.uuid) {
      console.warn('No buyer/provider UUID available');
      
      // For buy-inputs, navigate to InputPurchase
      if (isBuyInputsProduct) {
        navigation.navigate('InputPurchase', {
          step: fsaSteps?.find(s => s.identifier === 'input_purchase_details'),
          steps: fsaSteps,
          productSlug,
          submissionId,
          providerId: buyer.id || buyer.uuid,
          providerName: buyer.title || buyer.company_name,
          acceptsProviderCredit: buyer.accepts_provider_credit,
          providerCreditDisabledMessage: buyer.provider_credit_disabled_message,
        });
        return;
      }
      
      navigation.navigate('SaleAgreement', {
        buyer,
        fsaSteps,
        productSlug,
        submissionId,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        is_draft: false,
        type: 'product_submission',
        product_slug: productSlug,
        field_values: {
          [isBuyInputsProduct ? 'provider_id' : 'buyer_uuid']: buyer.uuid,
        },
        step_identifier: isBuyInputsProduct ? 'government_verified_provider' : 'government_verified_buyers',
        step_number: 1,
        ...(submissionId && { submission_id: submissionId }),
      };

      console.log('📤 Submitting buyer selection:', JSON.stringify(payload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', payload);
      const responseData = response.data?.data || response.data;

      console.log('✅ Buyer selection submitted successfully:', responseData);

      // Store submission_id for subsequent calls (check attributes first, then top level)
      const newSubmissionId = responseData?.attributes?.submission_id || responseData?.submission_id || submissionId;
      if (responseData?.attributes?.submission_id || responseData?.submission_id) {
        setSubmissionId(responseData?.attributes?.submission_id || responseData?.submission_id);
      }

      // Navigate based on product type
      if (isBuyInputsProduct) {
        // For buy-inputs, navigate to InputPurchase screen (Step 2)
        navigation.navigate('InputPurchase', {
          step: fsaSteps?.find(s => s.identifier === 'input_purchase_details'),
          steps: fsaSteps,
          productSlug,
          submissionId: newSubmissionId,
          providerId: buyer.uuid || buyer.id,
          providerName: buyer.title || buyer.company_name,
          acceptsProviderCredit: buyer.accepts_provider_credit,
          providerCreditDisabledMessage: buyer.provider_credit_disabled_message,
        });
      } else {
        // For other products, navigate to Sale Agreement
        navigation.navigate('SaleAgreement', {
          buyer,
          fsaSteps,
          productSlug,
          submissionId: newSubmissionId,
        });
      }
    } catch (error: any) {
      console.log('❌ Failed to submit buyer selection:', error?.response?.data || error?.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [buyer, fsaSteps, navigation, productSlug, submissionId, isBuyInputsProduct, isSellHarvestFlow, harvestData, selectedOption, harvestDetailId]);

  // Helper function to capitalize first letter of crop name
  const capitalizeCropName = (crop: string): string => {
    return crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
  };

  // Convert crops array to products array - only include icon if provided by API
  const cropsToProducts = (crops?: string[]): { name: string; icon?: any }[] => {
    if (!crops || crops.length === 0) return [];
    
    return crops.map(crop => {
      return {
        name: capitalizeCropName(crop),
        // Don't add icon property if not provided by API
      };
    });
  };

  const banner = buyer.image || BUYER_IMG_CORN;
  const dealsLine = useMemo(() => {
    // Use deals if available, otherwise convert crops, otherwise use default
    if (buyer.deals && buyer.deals.length > 0) {
      return `Deals in: ${buyer.deals.join(', ')}`;
    }
    if (buyer.crops && buyer.crops.length > 0) {
      const cropNames = buyer.crops.map(crop => capitalizeCropName(crop));
      return `Deals in: ${cropNames.join(', ')}`;
    }
    return 'Deals in: Rice, Sugar, Wheat';
  }, [buyer]);

  const products = useMemo(() => {
    // Use products if available (only show images if they come from API)
    if (buyer.products && buyer.products.length > 0) {
      return buyer.products;
    }
    if (buyer.crops && buyer.crops.length > 0) {
      return cropsToProducts(buyer.crops);
    }
    return [];
  }, [buyer]);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      { key: 'products', title: 'Products' },
      { key: 'about', title: 'About' },
    ],
    [],
  );

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'products':
        return (
          <ScrollView
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          >
            {products.map((p, idx) => (
              <ProductItem key={idx} icon={p.icon} name={p.name} />
            ))}
          </ScrollView>
        );
      case 'about':
        return (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, { marginTop: 22 }]}>
              <UITypography variant="semiBold" style={styles.sectionTitle}>
                About {buyer.title || buyer.company_name || 'Maize Buying Company'}
              </UITypography>
              <UITypography
                variant="regular"
                style={[styles.sectionSub, { marginTop: 8 }]}
              >
                Reliable buyers offering competitive prices and verified sale
                agreements for farmers in your region.
              </UITypography>
            </View>

            <View style={[styles.card, { marginTop: 16 }]}>
              <UITypography variant="semiBold" style={styles.sectionTitle}>
                Buyer's GPS Address
              </UITypography>
              <UITypography
                variant="regular"
                style={[styles.sectionSub, { marginTop: 8 }]}
              >
                {buyer.ghana_post_gps || buyer.gps || 'N/A'}
              </UITypography>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => {
    const inputRange = props.navigationState.routes.map(
      (x: any, i: number) => i,
    );
    return (
      <View style={styles.tabsHeader}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex: number) =>
              inputIndex === i ? 1 : 0.7,
            ),
          });
          return (
            <React.Fragment key={route.key}>
              <Pressable
                style={styles.tabLabelWrap}
                onPress={() => setIndex(i)}
              >
                <Animated.View style={{ opacity }}>
                  <UITypography
                    variant="semiBold"
                    style={
                      i === index
                        ? styles.tabTitle
                        : [styles.tabTitle, styles.tabInactive]
                    }
                  >
                    {route.title}
                  </UITypography>
                </Animated.View>
                {index === i && <View style={styles.underlineBar} />}
              </Pressable>
              {i < props.navigationState.routes.length - 1 && (
                <View style={styles.tabDivider} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={buyer.title || 'Maize Buying Company'}
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={banner} style={styles.banner} resizeMode="cover" />

        <View style={styles.card}>
          <UITypography variant="semiBold" style={styles.companyTitle}>
            {buyer.title || 'Maize Buying Company'}
          </UITypography>
          <InfoRow
            icon={<HouseIcon width={21} height={21} color="#099453" />}
            text={dealsLine}
          />
          <View style={{ marginLeft: 3 }}>
            <InfoRow
              icon={<LocationIcon size={16} color="#099453" />}
              text={buyer.gps || buyer.ghana_post_gps || buyer.location || 'N/A'}
            />
          </View>
        </View>

        <View style={styles.featuresRow}>
          {isBuyInputsProduct ? (
            <>
              <FeatureBadge
                icon={<FingerprintIcon width={24} height={24} />}
                title={'Verified Providers'}
              />
              <FeatureBadge
                icon={<VerifiedUsersIcon width={24} height={24} />}
                title={'Government-set prices'}
              />
              <FeatureBadge
                icon={<ShoppingCartIcon width={24} height={24} />}
                title={'Guaranteed Supply'}
              />
            </>
          ) : (
            <>
              <FeatureBadge
                icon={<FingerprintIcon width={24} height={24} />}
                title={'Verified by the Government'}
              />
              <FeatureBadge
                icon={<VerifiedUsersIcon width={24} height={24} />}
                title={'Guaranteed pricing'}
              />
              <FeatureBadge
                icon={<ShoppingCartIcon width={24} height={24} />}
                title={'Secure and traceable payments'}
              />
            </>
          )}
        </View>

        <View style={styles.ctaWrap}>
          <Pressable
            style={[
              styles.ctaButton,
              isSubmitting && { opacity: 0.6 },
              isBuyInputsProduct && hasCatalogItems === false && { backgroundColor: '#CCCCCC' },
            ]}
            onPress={handlePrimaryCTA}
            disabled={isSubmitting || (isBuyInputsProduct && hasCatalogItems === false)}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <NavigationArrowIcon width={18} height={18} color="#FFFFFF" />
            )}
            <UITypography variant="regular" style={styles.ctaText}>
              {isSubmitting
                ? 'Submitting...'
                : isBuyInputsProduct
                  ? 'Purchase Inputs'
                  : isSellHarvestFlow
                    ? 'Sell Harvest'
                    : 'Secure Sale Agreement'}
            </UITypography>
          </Pressable>
          {isBuyInputsProduct && hasCatalogItems === false && (
            <UITypography
              variant="regular"
              style={{ color: '#E53E3E', fontSize: 12, textAlign: 'center', marginTop: 8 }}
            >
              {buyer.purchase_disabled_message || 'No catalog items available for this provider'}
            </UITypography>
          )}
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          sceneContainerStyle={{ flex: 1 }}
          style={{ height: 400 }}
        />
      </ScrollView>
    </View>
  );
}
