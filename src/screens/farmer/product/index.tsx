import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, View } from 'react-native';
import { styles } from '@/screens/farmer/cash-credit/CashCreditScreen.styled';
import HeaderImage from '@/components/screens/farmer/cash-credit/HeaderImage';
import SectionCard from '@/components/screens/farmer/cash-credit/SectionCard';
import TermsText from '@/components/screens/farmer/cash-credit/TermsText';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import BankCredit from '@/assets/images/bank-credit.png';
import CashCredit from '@/assets/cash-credit.png';
import BuyInputs from '@/assets/buy-inputs.png';
import SellHarvest from '@/assets/sell-harvest.png';
import GovernmentSubsidies from '@/assets/government-subsidies.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProductsStore } from '@/store/useProductsStore';
import { useAuth } from '@/constants/context/auth/context';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';
import { useAppConfigStore } from '@/store/useAppConfigStore';

export default function BankCreditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug || 'bank-credit-facility';
  const { config, configLoading, configStatusCode, fetchProductConfig } =
    useProductsStore();
  const { handleLogout } = useAuth();
  const isHomeCardDisabled = useAppConfigStore(state => state.isHomeCardDisabled);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  // Map product slug to local image
  const getProductImage = (slug: string) => {
    switch (slug) {
      case 'bank-credit-facility':
        return BankCredit;
      case 'cash-credit':
        return CashCredit;
      case 'buy-inputs':
        return BuyInputs;
      case 'sell-harvest':
        return SellHarvest;
      case 'government-subsidies':
        return GovernmentSubsidies;
      default:
        return BankCredit;
    }
  };

  useEffect(() => {
    fetchProductConfig(slug);
  }, [slug, fetchProductConfig]);

  useEffect(() => {
    if (configStatusCode === 401) {
      handleLogout();
    }
  }, [configStatusCode, handleLogout]);

  const eligibility = useMemo(() => {
    const list = config?.attributes?.instructions?.eligibility_criteria;
    return Array.isArray(list) ? list : [];
  }, [config]);

  const benefits = useMemo(() => {
    const list = config?.attributes?.instructions?.why_apply_with_us;
    return Array.isArray(list) ? list : [];
  }, [config]);

  const title = config?.attributes?.name || 'Bank Credit Facility';
  const headerImage = getProductImage(slug);
  // const headerImage = config?.attributes?.picture_url ? { uri: config.attributes.picture_url } : BankCredit;

  const handleApplyNow = async () => {
    if (isHomeCardDisabled(slug)) {
      navigation.navigate('ComingSoon' as any);
      return;
    }

    // Special routing for sell-harvest: go directly to LogHarvestDetails
    if (slug === 'sell-harvest') {
      console.log('✨ Starting new sell-harvest application');
      // Always start a new submission
      navigation.navigate('LogHarvestDetails');
      return;
    }

    // Special routing for buy-inputs: go directly to first step screen
    if (slug === 'buy-inputs' && config?.attributes?.steps?.length) {
      const steps = [...config.attributes.steps]
        .filter((s: any) => s.is_active)
        .sort((a: any, b: any) => a.display_order - b.display_order);
      const firstStep = steps[0];
      if (firstStep) {
        const identifier = firstStep.identifier;
        // Map to dedicated screens (same mapping as BankApplication)
        const screenMap: Record<string, string> = {
          government_verified_provider: 'GovernmentVerifiedBuyers',
          input_purchase_details: 'InputPurchase',
          cart_summary: 'CartSummary',
          checkout: 'Checkout',
        };
        const screenName = screenMap[identifier];
        if (screenName) {
          if (screenName === 'GovernmentVerifiedBuyers') {
            navigation.navigate(screenName as any, {
              fsaStep: firstStep,
              fsaSteps: steps,
              productSlug: slug,
              submissionId: null,
            });
          } else {
            navigation.navigate(screenName as any, {
              step: firstStep,
              steps,
              productSlug: slug,
              submissionId: null,
            });
          }
          return;
        }
      }
    }
    // Default behavior: open stepper/overview
    navigation.navigate('BankApplication', { slug });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#fff' }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
      <HeaderImage source={headerImage} onBack={() => navigation.goBack()} />
      <UITypography variant="semiBold" style={styles.title}>
        {title}
      </UITypography>
      <View style={styles.content}>
        {configLoading ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
            }}
          >
            <ActivityIndicator size="large" color="#099453" />
          </View>
        ) : (
          <>
            <View style={styles.sectionWrap}>
              <SectionCard title="ELIGIBILITY" items={eligibility} />
              <SectionCard title="WHY APPLY WITH US" items={benefits} />
            </View>
            <TermsText onPress={() => setPrivacyVisible(true)} />
            <UIContainedButton
              onPress={handleApplyNow}
              style={{ marginTop: 16 }}
            >
              {slug === 'sell-harvest' ? 'SELL NOW' : slug === 'buy-inputs' ? 'BUY NOW' : 'APPLY NOW'}
            </UIContainedButton>
          </>
        )}
      </View>
      <AuthFarmerPrivacyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
    </ScrollView>
  );
}
