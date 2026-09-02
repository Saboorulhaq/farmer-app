import { UIContainedButton, UITypography } from '@/components/ui';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Image, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductSubmissionStore } from '@/store/useProductSubmissionStore';

export default function LoanApplicationSuccess() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setSavedSignatureUri } = useProductSubmissionStore();

  useEffect(() => {
    setSavedSignatureUri(null);
  }, []);
  const productSlug = route.params?.productSlug || route.params?.slug;
  const isLenderOfferFlow = route.params?.isLenderOfferFlow;
  const isMarketplaceFlow = route.params?.isMarketplaceFlow;
  const marketplaceSuccessMessage = route.params?.marketplaceSuccessMessage;
  const INITIAL_COUNTDOWN = 5;
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);

  // Store target end time as ref to persist across background/foreground transitions
  const countdownEndRef = useRef<number>(Date.now() + INITIAL_COUNTDOWN * 1000);

  // Countdown timer with background time handling
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((countdownEndRef.current - Date.now()) / 1000);
      
      if (remaining <= 0) {
        setCountdown(0);
        return;
      }
      
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown > 0]);

  // Handle app state changes to recalculate timer when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Recalculate countdown timer
        const remaining = Math.ceil((countdownEndRef.current - Date.now()) / 1000);
        setCountdown(remaining > 0 ? remaining : 0);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const isBuyInputsFlow = productSlug === 'buy-inputs';
  const isSellHarvestFlow = productSlug === 'sell-harvest';
  const navigateToMarketplace = isMarketplaceFlow || isBuyInputsFlow || isSellHarvestFlow;

  const navigateToTransactions = () => {
    if (isMarketplaceFlow) {
      navigation.navigate('TransactionsMain', navigateToMarketplace ? { initialTab: 'marketplace' } : undefined);
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
      setTimeout(() => {
        navigation.getParent()?.navigate('Transactions', {
          screen: 'TransactionsMain',
          params: navigateToMarketplace ? { initialTab: 'marketplace' } : undefined,
        });
      }, 100);
    }
  };

  // Separate effect to handle navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      setTimeout(() => navigateToTransactions(), 0);
    }
  }, [countdown, navigation, isMarketplaceFlow]);

  const handleGoHome = () => {
    navigateToTransactions();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top + 20,
        },
      ]}
    >
      

      <UITypography
        variant="medium"
        style={styles.title}
      >
        {isLenderOfferFlow ? 'Congratulations!' : 'Success!'}
      </UITypography>

      <UITypography
        variant="medium"
        style={styles.subtitle}
      >
        {isMarketplaceFlow && marketplaceSuccessMessage
          ? marketplaceSuccessMessage
          : isLenderOfferFlow
          ? 'You have successfully accepted the lender offer.'
          : productSlug === 'sell-harvest' 
          ? 'Congratulations! You have successfully sold your harvest.'
          : productSlug === 'buy-inputs' 
            ? 'Order Placed! Fulfilment is subject to approval of credit by the input provider.'
            : 'Your loan request has been submitted and will be processed shortly.'}
      </UITypography>

      <UITypography
        variant="regular"
        style={styles.countdown}
      >
        Redirecting to transactions in {countdown} second
        {countdown !== 1 ? 's' : ''}...
      </UITypography>

      <UIContainedButton
        onPress={handleGoHome}
        style={styles.homeButton}
      >
        Go to Transaction Screen
      </UIContainedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successGif: {
    width: 146,
    height: 146,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 12,
    color: '#404040',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#404040',
    opacity: 0.6,
    lineHeight: 20,
    letterSpacing: 0.1,
    paddingHorizontal: 40,
  },
  countdown: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  homeButton: {
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
});
