import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, View } from 'react-native';
import { styles } from './CashCreditScreen.styled';
import HeaderImage from '@/components/screens/farmer/cash-credit/HeaderImage';
import SectionCard from '@/components/screens/farmer/cash-credit/SectionCard';
import TermsText from '@/components/screens/farmer/cash-credit/TermsText';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import CashCredit from '@/assets/images/cash-credit.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProductsStore } from '@/store/useProductsStore';
import { useAuth } from '@/constants/context/auth/context';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';

export default function CashCreditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug || 'cash-credit';
  const { config, configLoading, configStatusCode, fetchProductConfig } =
    useProductsStore();
  const { handleLogout } = useAuth();
  const [privacyVisible, setPrivacyVisible] = useState(false);

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

  const title = config?.attributes?.name || 'Cash Credit';
  // const headerImage = config?.attributes?.picture_url ? { uri: config.attributes.picture_url } : CashCredit;
  const headerImage = CashCredit;

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
        {configLoading && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
            }}
          >
            <ActivityIndicator size="large" color="#099453" />
          </View>
        )}
        <View style={styles.sectionWrap}>
          <SectionCard title="ELIGIBILITY" items={eligibility} />
          <SectionCard title="WHY APPLY WITH US" items={benefits} />
        </View>
        <TermsText onPress={() => setPrivacyVisible(true)} />
        <UIContainedButton
          onPress={() => navigation.navigate('BankApplication')}
          style={{ marginTop: 16 }}
        >
          APPLY NOW
        </UIContainedButton>
      </View>
      <AuthFarmerPrivacyModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
    </ScrollView>
  );
}
