import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  View,
  Image,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { styles } from './FarmerMainScreen.styled';
import NotificationBellIcon from '@/components/icons/NotificationBellIcon';
import { UIContainedButton, UITypography } from '@/components/ui';
import Avatar from '@/assets/images/avatar.png';
import { useFarmer } from '@/constants/context/farmer/context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useSubmissionsStore } from '@/store/useSubmissionsStore';
import { useAuth } from '@/constants/context/auth/context';
import BankCreditFacility from '@/assets/images/bank-credit.png';
import InitiateForwardContract from '@/assets/images/initiate-forward-contract.png';
import CashCredit from '@/assets/cash-credit.png';
import BuyInputs from '@/assets/buy-inputs.png';
import SellHarvest from '@/assets/sell-harvest.png';
import GovernmentSubsidies from '@/assets/government-subsidies.png';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import { Toast } from 'toastify-react-native';

export default function FarmerMainScreen() {
  const { loading, farmer } = useFarmer();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    products,
    loading: productsLoading,
    statusCode,
    fetchProducts,
    fetchProductConfig,
  } = useProductsStore();
  const { handleLogout } = useAuth();
  const isHomeCardDisabled = useAppConfigStore(state => state.isHomeCardDisabled);
  const { fetchSubmissions } = useSubmissionsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBuyInputs, setLoadingBuyInputs] = useState(false);
  const isFocused = useIsFocused();
  const lastBackPressRef = useRef(0);

  // "Press again to exit" back handler
  useEffect(() => {
    if (!isFocused) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressRef.current = now;
      Toast.show({
        type: 'info',
        text1: 'Press again to exit',
      });
      return true;
    });
    return () => subscription.remove();
  }, [isFocused]);

  // Map product slug to local image
  const getProductImage = (slug: string) => {
    switch (slug) {
      case 'bank-credit-facility':
        return BankCreditFacility;
      case 'cash-credit':
        return CashCredit;
      case 'buy-inputs':
        return BuyInputs;
      case 'sell-harvest':
        return SellHarvest;
      case 'government-subsidies':
        return GovernmentSubsidies;
      default:
        return BankCreditFacility;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubmissions();
  }, [fetchProducts, fetchSubmissions]);

  useEffect(() => {
    if (statusCode === 401) {
      handleLogout();
    }
  }, [statusCode, handleLogout]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh products and submissions
      await Promise.all([fetchProducts(), fetchSubmissions()]);
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBuyInputsNavigation = async () => {
    try {
      setLoadingBuyInputs(true);
      await fetchProductConfig('buy-inputs');
      
      // Get the config from the store after fetching
      const buyInputsConfig = useProductsStore.getState().config;
      
      if (buyInputsConfig?.attributes?.steps?.length) {
        const steps = [...buyInputsConfig.attributes.steps]
          .filter((s: any) => s.is_active)
          .sort((a: any, b: any) => a.display_order - b.display_order);
        const firstStep = steps[0];
        
        if (firstStep && firstStep.identifier === 'government_verified_provider') {
          navigation.navigate('GovernmentVerifiedBuyers' as any, {
            fsaStep: firstStep,
            fsaSteps: steps,
            productSlug: 'buy-inputs',
            submissionId: null,
          });
          return;
        }
      }
      
      // Fallback: navigate without steps if config is not available
      navigation.navigate('GovernmentVerifiedBuyers' as any, {
        productSlug: 'buy-inputs',
        submissionId: null,
      });
    } catch (error) {
      console.log('Error fetching buy-inputs config:', error);
      // Fallback: navigate anyway
      navigation.navigate('GovernmentVerifiedBuyers' as any, {
        productSlug: 'buy-inputs',
        submissionId: null,
      });
    } finally {
      setLoadingBuyInputs(false);
    }
  };


  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, gap: 20, backgroundColor: '#fff' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#099453"
          colors={['#099453']}
        />
      }
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
      <View style={[styles.header, { marginTop: top }]}>
        <View style={styles.headerContent}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <View>
                <Image source={Avatar} style={styles.avatar} />
              </View>
              <View>
                <UITypography variant="regular" style={styles.hello}>
                  Hello
                </UITypography>
                <UITypography variant="semiBold" style={styles.name}>
                  {farmer?.attributes?.name ?? 'Agent'}
                </UITypography>
              </View>
            </>
          )}
        </View>
        <Pressable onPress={() => navigation.navigate('Notifications' as any)} hitSlop={10}>
          <NotificationBellIcon color="#101010" />
        </Pressable>
      </View>

      <View style={{ gap: 16, paddingHorizontal: 24, paddingBottom: 24 }}>
        {productsLoading && products.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
            }}
          >
            <ActivityIndicator size="large" color="#099453" />
          </View>
        )}
        {products.map((p, index) => {
          const isSellHarvest = p.attributes.slug === 'sell-harvest';
          const isBuyInputs = p.attributes.slug === 'buy-inputs';
          return (
            <View key={index}>
              <View>
                <Image
                  source={getProductImage(p.attributes.slug)}
                  // source={p.attributes.picture_url ? { uri: p.attributes.picture_url } : BankCreditFacility}
                  style={{
                    height: 150,
                    width: '100%',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
              </View>
              <View
                style={{
                  padding: 16,
                  gap: 24,
                  backgroundColor: '#E7F8F0',
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              >
                <View style={{ gap: 8 }}>
                  <UITypography variant="semiBold" style={{ fontSize: 16 }}>
                    {p.attributes.name}
                  </UITypography>
                  <UITypography variant="regular" style={{ fontSize: 16 }}>
                    {p.attributes.short_description}
                  </UITypography>
                </View>
                <UIContainedButton
                  onPress={() => {
                    const slug = p.attributes.slug;
                    // Gate product apply action using app-start feature toggles.
                    if (isHomeCardDisabled(slug)) {
                      navigation.navigate('ComingSoon' as any);
                    } else if (slug === 'buy-inputs') {
                      // Navigate directly to marketplace for buy-inputs
                      handleBuyInputsNavigation();
                    } else if (slug === 'sell-harvest') {
                      // Navigate directly to LogHarvestDetails for sell-harvest
                      navigation.navigate('LogHarvestDetails' as any);
                    } else {
                      navigation.navigate('Product', { slug });
                    }
                  }}
                  disabled={isBuyInputs && loadingBuyInputs}
                >
                  {isBuyInputs && loadingBuyInputs ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    isSellHarvest ? 'SELL NOW' : isBuyInputs ? 'BUY NOW' : 'APPLY NOW'
                  )}
                </UIContainedButton>
              </View>
            </View>
          );
        })}

        {/* Static "Initiate Forward Contract" product card — opens the static FSA flow */}
        <View>
          <View>
            <Image
              source={InitiateForwardContract}
              style={{
                height: 150,
                width: '100%',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            />
          </View>
          <View
            style={{
              padding: 16,
              gap: 24,
              backgroundColor: '#E7F8F0',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            <View style={{ gap: 8 }}>
              <UITypography variant="semiBold" style={{ fontSize: 16 }}>
                Initiate Forward Contract
              </UITypography>
              <UITypography variant="regular" style={{ fontSize: 16 }}>
                Secure future sales by locking in prices today. Agree on quantity, delivery terms, and pricing in advance.
              </UITypography>
            </View>
            <UIContainedButton
              onPress={() =>
                navigation.navigate('GovernmentVerifiedBuyers' as any, {
                  initiateFsaStaticFlow: true,
                })
              }
            >
              APPLY NOW
            </UIContainedButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
