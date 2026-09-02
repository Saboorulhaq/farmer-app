import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import { UIContainedButton, UITypography, UIPINInput } from '@/components/ui';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './index.styled';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosFinancingPrivate, axiosPrivate, axiosV1Private, axiosPublic } from '@/config/axios';
import { useProductsStore } from '@/store/useProductsStore';
import type { PINInputRef } from '@/components/ui/pin-input';
import { useDebugStore } from '@/store/useDebugStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trigger } from 'react-native-haptic-feedback';
import { useAuth } from '@/constants/context/auth/context';
import { submissionsService } from '@/services/submissions.service';
import { transactionsService } from '@/services/transactions.service';
import * as Sentry from '@sentry/react-native';

const ResendTimer = memo(({ onResend, isResending, isBlocked, timer }: { onResend: () => void; isResending: boolean; isBlocked: boolean; timer: number; }) => {
  if (timer > 0) {
    return <UITypography>{`Resend in ${timer}s`}</UITypography>;
  }
  if (isResending) {
    return <UITypography>Resending...</UITypography>;
  }
  return (
    <UITypography variant="semiBold" style={styles.resendLink} onPress={onResend} disabled={isResending}>
      Resend code
    </UITypography>
  );
});

export default function LoanRequestOTPVerification() {
  const PIN_COUNT = 6;
  const initialPin = Array(PIN_COUNT).fill('');
  const RESEND_TIME_LIMIT = 120;
  const MAX_FAILED_ATTEMPTS = 3;
  const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const FAILED_ATTEMPTS_KEY = 'failed_loan_otp_attempts_';

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();
  const { farmer } = useFarmer();
  const { handleLogout, getCardNumber, removeTrustedCard } = useAuth();
  const { submissionId: storeSubmissionId, config } = useProductsStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  const pinInputRef = useRef<PINInputRef>(null);

  // Prefer submissionID passed via params (from dynamic flow), fallback to store (from bank app flow)
  const submissionId = route.params?.productSubmissionId || storeSubmissionId;

  // Check if this is a sell-harvest flow
  const isSellHarvestFlow = route.params?.isSellHarvest || route.params?.productSlug === 'sell-harvest';

  // Check if this is a lender offer flow
  const isLenderOfferFlow = route.params?.isLenderOfferFlow;
  const lenderOfferId = route.params?.offerId;
  const lenderSubmissionId = route.params?.submissionId;
  const lenderName = route.params?.lenderName;

  // Check if this is a change-PIN flow
  const isChangePinFlow = route.params?.mode === 'changePin';

  // Check if this is a close-account flow
  const isCloseAccountFlow = route.params?.mode === 'closeAccount';

  // Check if this is a marketplace flow (buy order / sale order confirmation)
  const isMarketplaceFlow = route.params?.isMarketplaceFlow;
  const marketplaceTransactionType = route.params?.marketplaceTransactionType;
  const marketplaceTransactionId = route.params?.marketplaceTransactionId;
  const marketplaceSuccessMessage = route.params?.marketplaceSuccessMessage;

  // Static "Initiate FSA" flow flag
  const initiateFsaStaticFlow = route.params?.initiateFsaStaticFlow;

  // Determine flow based on otpFlow param or fallback logic
  const determinedFlow = useMemo(() => {
    if (route.params?.otpFlow) return route.params.otpFlow;
    if (route.params?.isSellHarvest || route.params?.productSlug === 'sell-harvest') return 'SELL_HARVEST_OTP';
    if (route.params?.isLenderOfferFlow) return 'OFFER_AGREEMENT_OTP';
    if (route.params?.isMarketplaceFlow) {
      if (route.params?.marketplaceTransactionType === 'sale_order') return 'SALE_ORDER_OTP';
      return 'BUY_ORDER_OTP';
    }
    if (route.params?.mode === 'changePin' || route.params?.mode === 'closeAccount') return undefined;
    return 'LOAN_REQUEST_OTP';
  }, [route.params]);

  // Get last 4 digits of phone number
  const maskedPhoneNumber = useMemo(() => {
    const phoneNumber = farmer?.attributes?.phone_number?.toString() || '';
    if (phoneNumber.length >= 4) {
      const last4 = phoneNumber.slice(-4);
      return `**** **** ${last4}`;
    }
    return '**** **** ****';
  }, [farmer?.attributes?.phone_number]);

  // Mask email address
  const maskedEmail = useMemo(() => {
    const email = farmer?.attributes?.email || '';
    if (!email) return null;

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return null;

    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    const maskedLocal = `${firstChar}${'*'.repeat(Math.min(6, localPart.length - 2))}${lastChar}`;
    return `${maskedLocal}@${domain}`;
  }, [farmer?.attributes?.email]);

  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(
    isDebugMode ? ['1','2','3','4','5','6'] : initialPin,
  );
  const [error, setError] = useState('');
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIME_LIMIT);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [isEditable, setIsEditable] = useState(true);

  // Store target end times as refs to persist across background/foreground transitions
  const resendTimerEndRef = useRef<number>(Date.now() + RESEND_TIME_LIMIT * 1000);
  const blockTimerEndRef = useRef<number>(0);

  // Check blocking status on mount
  useEffect(() => {
    const checkBlockingStatus = async () => {
      const phoneNumber = farmer?.attributes?.phone_number?.toString();
      if (!phoneNumber) return;

      const blockKey = `${FAILED_ATTEMPTS_KEY}${phoneNumber}`;
      const blockData = await AsyncStorage.getItem(blockKey);

      if (blockData) {
        const { blockedUntil } = JSON.parse(blockData);
        const currentTime = Date.now();

        if (blockedUntil > currentTime) {
          setIsBlocked(true);
          setIsEditable(false);
          blockTimerEndRef.current = blockedUntil;
          setBlockTimeRemaining(blockedUntil - currentTime);
        } else {
          await AsyncStorage.removeItem(blockKey);
        }
      }
    };

    checkBlockingStatus();
  }, [farmer?.attributes?.phone_number]);

  // Block countdown timer with background time handling
  useEffect(() => {
    if (blockTimeRemaining <= 0) return;

    // Set the target end time when block starts
    if (blockTimerEndRef.current === 0 || blockTimerEndRef.current < Date.now()) {
      blockTimerEndRef.current = Date.now() + blockTimeRemaining;
    }

    const interval = setInterval(() => {
      const remaining = blockTimerEndRef.current - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        setIsBlocked(false);
        setIsEditable(true);
        setBlockTimeRemaining(0);
        blockTimerEndRef.current = 0;
        const phoneNumber = farmer?.attributes?.phone_number?.toString();
        if (phoneNumber) {
          AsyncStorage.removeItem(`${FAILED_ATTEMPTS_KEY}${phoneNumber}`);
        }
        return;
      }

      setBlockTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [blockTimeRemaining > 0, farmer?.attributes?.phone_number]);

  useEffect(() => {
    const code = otpCode.join('');
    setIsCodeComplete(code.length === PIN_COUNT);
  }, [otpCode]);

  const handleResendCode = useCallback(async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    try {
      const payload = {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            ...(determinedFlow ? { flow: determinedFlow } : {}),
          },
        },
      };

      console.log('📤 Resending OTP to:', farmer?.attributes?.phone_number);
      const response = await axiosPublic.post('/users/resend_otp', payload);

      const message = response.data?.data?.attributes?.message || 'A new verification code has been sent.';
      Toast.show({ type: 'success', text1: 'Code Resent', text2: message });

      // Use backend-provided cooldown time if available
      const cooldownSeconds = response.data?.meta?.seconds_remaining || RESEND_TIME_LIMIT;
      resendTimerEndRef.current = Date.now() + cooldownSeconds * 1000;
      setResendTimer(cooldownSeconds);

      // Reset OTP code and unblock user
      setOtpCode(initialPin);
      setError('');
      setIsBlocked(false);
      setIsEditable(true);

      // Small delay to ensure state is updated before focusing
      setTimeout(() => {
        pinInputRef.current?.focusFirst();
      }, 100);
    } catch (err: any) {
      trigger('notificationError');
      const errorMessage = err?.response?.data?.error || 'Failed to resend code. Please try again.';
      Toast.show({ type: 'error', text1: 'Failed to Resend', text2: errorMessage });

      // Use backend-provided cooldown time if available
      if (err?.response?.data?.meta?.seconds_remaining) {
        const cooldownSeconds = err.response.data.meta.seconds_remaining;
        resendTimerEndRef.current = Date.now() + cooldownSeconds * 1000;
        setResendTimer(cooldownSeconds);
      } else if (errorMessage.includes('OTP has expired')) {
        resendTimerEndRef.current = 0;
        setResendTimer(0);
      } else if (errorMessage.includes('You have reached the maximum attempts.')) {
        setIsBlocked(true);
        setIsEditable(false);
      }
    } finally {
      setIsResending(false);
    }
  }, [resendTimer, initialPin, farmer?.attributes?.phone_number]);

  // Resend timer with background time handling
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((resendTimerEndRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        setResendTimer(0);
        return;
      }

      setResendTimer(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer > 0]);

  // Handle app state changes to recalculate timers when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Recalculate resend timer
        const resendRemaining = Math.ceil((resendTimerEndRef.current - Date.now()) / 1000);
        setResendTimer(resendRemaining > 0 ? resendRemaining : 0);

        // Recalculate block timer
        if (blockTimerEndRef.current > 0) {
          const blockRemaining = blockTimerEndRef.current - Date.now();
          if (blockRemaining > 0) {
            setBlockTimeRemaining(blockRemaining);
          } else {
            setBlockTimeRemaining(0);
            setIsBlocked(false);
            setIsEditable(true);
            blockTimerEndRef.current = 0;
            const phoneNumber = farmer?.attributes?.phone_number?.toString();
            if (phoneNumber) {
              AsyncStorage.removeItem(`${FAILED_ATTEMPTS_KEY}${phoneNumber}`);
            }
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [farmer?.attributes?.phone_number]);

  const handleSubmit = async () => {
    if (!isDebugMode && !isChangePinFlow && !isCloseAccountFlow && !isLenderOfferFlow && !isMarketplaceFlow && !initiateFsaStaticFlow && !submissionId) {
      Toast.show({
        type: 'error',
        text1: 'Submission Error',
        text2: 'No submission ID found. Please try again.'
      });
      return;
    }

    if (isBlocked) {
      trigger('notificationError');
      Toast.show({
        type: 'error',
        text1: 'Account Blocked',
        text2: 'Too many failed attempts. Please try again later.'
      });
      return;
    }

    setLoading(true);
    try {
      // Debug Mode: skip all API calls and navigate straight to success,
      // UNLESS this is the lender offer, buy-inputs, or sell-harvest flow —
      // there we still want the real verify-OTP calls to fire.
      const isBuyInputsOtpFlow = determinedFlow === 'BUY_INPUT_OTP' || route.params?.productSlug === 'buy-inputs';
      const isSellHarvestOtpFlow = isSellHarvestFlow || determinedFlow === 'SELL_HARVEST_OTP' || route.params?.productSlug === 'sell-harvest';
      if (isDebugMode && !isLenderOfferFlow && !isBuyInputsOtpFlow && !isSellHarvestOtpFlow) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Main' },
              {
                name: 'LoanApplicationSuccess',
                params: { productSlug: config?.attributes?.slug },
              },
            ],
          }),
        );
        return;
      }

      // 1. Verify OTP first
      const code = otpCode.join('');
      const verifyPayload = {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            otp: code,
            ...(determinedFlow ? { flow: determinedFlow } : {}),
          }
        }
      };

      console.log('📤 Verifying OTP for:', farmer?.attributes?.phone_number);
      const verifyResponse = await axiosPublic.post('/users/verify_otp', verifyPayload);

      const { phone_verified } = verifyResponse.data?.data?.attributes || {};

      if (!phone_verified) {
         throw new Error('Phone verification failed');
      }

      // Static "Initiate FSA" flow: after OTP is verified, return to home.
      if (initiateFsaStaticFlow) {
        Toast.show({
          type: 'success',
          text1: 'Verification Successful',
          text2: 'Your forward sale agreement has been initiated.',
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          }),
        );
        return;
      }

      // Lender offer flow: call confirm-otp and navigate to success
      if (isLenderOfferFlow && lenderSubmissionId && lenderOfferId) {
        console.log('📤 Confirming lender offer OTP...');
        await submissionsService.confirmLenderOtp(lenderSubmissionId, lenderOfferId);
        console.log('✅ Lender offer OTP confirmed');

        Toast.show({
          type: 'success',
          text1: 'Offer Accepted',
          text2: 'You have successfully accepted the lender offer.',
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'TransactionsMain' },
              {
                name: 'LoanApplicationSuccess',
                params: {
                  isLenderOfferFlow: true,
                },
              },
            ],
          }),
        );
        return;
      }

      // Marketplace flow: confirm the order and navigate to success
      if (isMarketplaceFlow && marketplaceTransactionType && marketplaceTransactionId) {
        console.log('📤 Confirming marketplace order...');
        await transactionsService.confirmMarketplaceOrder(
          marketplaceTransactionType,
          marketplaceTransactionId,
        );
        console.log('✅ Marketplace order confirmed');

        Toast.show({
          type: 'success',
          text1: 'Verification Successful',
          text2: 'Order confirmed successfully.',
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'TransactionsMain' },
              {
                name: 'LoanApplicationSuccess',
                params: {
                  isMarketplaceFlow: true,
                  marketplaceSuccessMessage,
                },
              },
            ],
          }),
        );
        return;
      }

      if (isChangePinFlow) {
        // Change PIN flow: call change_pin API after OTP is verified
        const { currentPin, newPin, confirmPin } = route.params;
        try {
          await axiosV1Private.post('/auth/user_sessions/change_pin', {
            data: {
              attributes: {
                current_pin: currentPin,
                new_pin: newPin,
                new_pin_confirmation: confirmPin,
              },
            },
          });
          Toast.show({
            type: 'success',
            text1: 'PIN Updated',
            text2: 'Your PIN has been updated successfully.',
          });
          // Pop OTP screen then go to Profile tab > Settings
          navigation.pop(1);
          navigation.navigate('Profile', { screen: 'Settings' });
        } catch (changePinErr: any) {
          const msg =
            changePinErr?.response?.data?.error ||
            changePinErr?.response?.data?.message ||
            'Failed to update PIN. Please try again.';
          Toast.show({ type: 'error', text1: 'Error', text2: msg });
          // Go back to Change PIN screen so user can correct current PIN
          navigation.pop(1);
          navigation.navigate('ChangePin');
        }
        return;
      }

      if (isCloseAccountFlow) {
        const cardNumber = getCardNumber('farmer', '');
        if (!cardNumber) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'NADRA ID not found.' });
          return;
        }
        await axiosPrivate.post('/users/delete_by_ghana_card', {
          data: {
            attributes: {
              ghana_card_number: cardNumber,
            },
          },
        });
        Toast.show({
          type: 'success',
          text1: 'Account Closed',
          text2: 'Your account has been closed successfully.',
        });
        await removeTrustedCard('farmer');
        await handleLogout();
        return;
      }

      console.log('✅ OTP Verified, submitting application...');

      // Buy-inputs flow: create the purchase order AFTER OTP is verified, then submit
      if (determinedFlow === 'BUY_INPUT_OTP') {
        const buyInputSlug = route.params?.productSlug || 'buy-inputs';

        // Call checkout API to create the order
        try {
          console.log('📤 Fetching submission data for checkout API...');
          const submissionResponse = await axiosFinancingPrivate.get(`/submissions/${submissionId}`, {
            params: { product_slug: buyInputSlug },
          });
          const submissionData = submissionResponse.data?.data || submissionResponse.data;
          const submissionSteps = submissionData?.attributes?.product_configuration?.steps || [];
          const checkoutStep = submissionSteps.find((s: any) => s.identifier === 'checkout');

          let deliveryMethod = 'Pickup';
          let paymentMethod = 'provider_credit';

          if (checkoutStep?.sections) {
            const deliverySection = checkoutStep.sections.find((s: any) => s.identifier === 'delivery_options');
            const deliveryField = deliverySection?.fields?.find((f: any) => f.field_key === 'delivery_option');
            if (deliveryField?.value) {
              deliveryMethod = deliveryField.value === 'doorstep_delivery' ? 'Home Delivery' : 'Pickup';
            }

            const paymentSectionData = checkoutStep.sections.find((s: any) => s.identifier === 'mode_of_payment');
            const paymentField = paymentSectionData?.fields?.find((f: any) => f.field_key === 'payment_method');
            if (paymentField?.value) {
              paymentMethod = paymentField.value;
            }
          }

          const checkoutPayload = {
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
          };

          console.log('📤 Calling checkout API:', checkoutPayload);
          const checkoutResponse = await axiosFinancingPrivate.post('/checkout', checkoutPayload, {
            params: { submission_id: submissionId },
          });
          console.log('✅ Checkout API successful:', checkoutResponse.data?.data || checkoutResponse.data);
        } catch (checkoutErr: any) {
          console.log('❌ Checkout API error:', checkoutErr?.response?.data || checkoutErr?.message);
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create purchase order. Please try again.' });
          return;
        }

        // Submit the application
        const buyInputPayload = {
          type: 'product_submission',
          product_slug: buyInputSlug,
          submission_id: submissionId,
          application_status: 'submitted',
        };

        console.log('📤 Submitting buy-input application:', JSON.stringify(buyInputPayload, null, 2));
        const response = await axiosFinancingPrivate.post('/submissions', buyInputPayload);
        console.log('✅ Buy-input application submitted successfully:', response.data);

        if (response.data) {
          Toast.show({
            type: 'success',
            text1: 'Verification Successful',
            text2: 'Your purchase order has been confirmed!',
          });

          const navState = navigation.getState();
          const rootRouteName = navState?.routes?.[0]?.name;
          const isInTransactionsStack = rootRouteName === 'TransactionsMain';

          if (isInTransactionsStack) {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'TransactionsMain' },
                  {
                    name: 'LoanApplicationSuccess',
                    params: { productSlug: buyInputSlug },
                  },
                ],
              }),
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  { name: 'Main' },
                  {
                    name: 'LoanApplicationSuccess',
                    params: { productSlug: buyInputSlug },
                  },
                ],
              }),
            );
          }
        }
        return;
      }

      // 2. Call the submission API to update application status
      const payload = {
        type: 'product_submission',
        product_slug: isSellHarvestFlow ? 'sell-harvest' : config?.attributes?.slug,
        submission_id: submissionId,
        application_status: 'submitted',
      };

      console.log('📤 Submitting final application:', JSON.stringify(payload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', payload);

      console.log('✅ Application submitted successfully:', response.data);

      if (response.data) {
        const isBuyInputs = config?.attributes?.slug === 'buy-inputs';
        Toast.show({
          type: 'success',
          text1: 'Verification Successful',
          text2: isSellHarvestFlow
            ? 'Your harvest sale has been confirmed!'
            : isBuyInputs
              ? 'Your order has been placed successfully!'
              : 'Consent accepted. Loan request submitted.'
        });

        // When sell-harvest was resumed from Transactions tab, we're inside TransactionsStack
        // (root route is TransactionsMain). Use same reset as marketplace so we land on success.
        const navState = navigation.getState();
        const rootRouteName = navState?.routes?.[0]?.name;
        const isInTransactionsStack = rootRouteName === 'TransactionsMain';

        if (isSellHarvestFlow && isInTransactionsStack) {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'TransactionsMain' },
                {
                  name: 'LoanApplicationSuccess',
                  params: {
                    productSlug: 'sell-harvest',
                    isMarketplaceFlow: true,
                  },
                },
              ],
            }),
          );
        } else if (isInTransactionsStack) {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'TransactionsMain' },
                {
                  name: 'LoanApplicationSuccess',
                  params: { productSlug: config?.attributes?.slug },
                },
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'Main' },
                {
                  name: 'LoanApplicationSuccess',
                  params: {
                    productSlug: isSellHarvestFlow ? 'sell-harvest' : config?.attributes?.slug
                  }
                }
              ],
            }),
          );
        }
      }
    } catch (err: any) {
      Sentry.captureException(err);
      console.log('🔴 Error caught:', err?.response?.data);

      // Clear OTP and trigger error
      setOtpCode(initialPin);
      trigger('notificationError');

      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Invalid OTP. Please try again.';
      const errorCode = err?.response?.data?.code || null;
      const meta = err?.response?.data?.meta || null;
      const phoneNumber = farmer?.attributes?.phone_number?.toString();

      if (errorCode === 'TOO_MANY_ATTEMPTS' && phoneNumber) {
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${phoneNumber}`;
        const blockedUntil = Date.now() + BLOCK_DURATION;

        await AsyncStorage.setItem(
          failedAttemptsKey,
          JSON.stringify({
            attempts: MAX_FAILED_ATTEMPTS,
            blockedUntil,
          }),
        );

        setIsBlocked(true);
        setIsEditable(false);
        blockTimerEndRef.current = blockedUntil;
        setBlockTimeRemaining(BLOCK_DURATION);

        Toast.show({
          type: 'error',
          text1: 'Too many incorrect OTP attempts.',
          text2: 'You\'ve reached the maximum number of OTP attempts. Please verify your mobile number and try again in 5 minutes.',
        });
        return;
      }

      if (errorCode === 'INVALID_OTP' && meta?.attempts_remaining !== undefined && phoneNumber) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: `Invalid OTP. You have ${meta.attempts_remaining} attempt${
            meta.attempts_remaining !== 1 ? 's' : ''
          } remaining.`,
        });

        // Update failed attempts
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${phoneNumber}`;
        await AsyncStorage.setItem(
          failedAttemptsKey,
          JSON.stringify({
            attempts: MAX_FAILED_ATTEMPTS - meta.attempts_remaining,
            blockedUntil: 0,
          }),
        );
      } else if (errorCode === 'NO_OTP_SESSION') {
        setIsEditable(false);
        resendTimerEndRef.current = 0;
        setResendTimer(0);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Please request a new OTP.',
        });
      } else if (errorCode === 'INVALID_OTP' && phoneNumber) {
        const failedAttemptsKey = `${FAILED_ATTEMPTS_KEY}${phoneNumber}`;
        const failedAttemptsData = await AsyncStorage.getItem(failedAttemptsKey);
        let failedAttempts = 0;

        if (failedAttemptsData) {
          const parsedData = JSON.parse(failedAttemptsData);
          failedAttempts = parsedData.attempts;
        }

        failedAttempts += 1;

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const blockedUntil = Date.now() + BLOCK_DURATION;
          await AsyncStorage.setItem(
            failedAttemptsKey,
            JSON.stringify({
              attempts: failedAttempts,
              blockedUntil,
            }),
          );
          setIsEditable(false);
          setIsBlocked(true);
          blockTimerEndRef.current = blockedUntil;
          setBlockTimeRemaining(BLOCK_DURATION);

          Toast.show({
            type: 'error',
            text1: 'Too many incorrect OTP attempts',
            text2: 'You\'ve reached the maximum number of OTP attempts. Please verify your mobile number and try again in 5 minutes.',
          });
        } else {
          await AsyncStorage.setItem(
            failedAttemptsKey,
            JSON.stringify({
              attempts: failedAttempts,
              blockedUntil: 0,
            }),
          );
          Toast.show({
            type: 'error',
            text1: 'Verification Failed',
            text2: `Invalid OTP. ${MAX_FAILED_ATTEMPTS - failedAttempts} attempts remaining.`,
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: errorMessage,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          }),
        );
      }

      if (errorCode === 'OTP_EXPIRED') {
        resendTimerEndRef.current = 0;
        setResendTimer(0);
      }
      if (errorCode === 'OTP_MAX_ATTEMPTS') {
        setIsEditable(false);
        setIsBlocked(true);
      }

      // Auto focus first input after clearing
      setTimeout(() => {
        pinInputRef.current?.focusFirst();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // Format time for block countdown
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LoanScreenHeader
      title="Verification Code"
      onBack={() => navigation.goBack()}
       containerStyle={[styles.header, { marginTop: top }]}
              titleStyle={styles.title}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <UITypography variant="regular" style={styles.subtitle}>
          {isChangePinFlow
            ? 'Verify your identity to update your PIN'
            : isCloseAccountFlow
            ? 'Verify your identity to close your account'
            : isMarketplaceFlow
            ? 'Please provide your consent to confirm\nyour order'
            : isLenderOfferFlow
            ? 'Please provide your consent to confirm\nyour loan agreement'
            : isSellHarvestFlow
            ? 'Please provide your consent to confirm\nyour harvest sale'
            : 'Please provide your consent to submit\nyour loan request'}
        </UITypography>
        <UITypography variant="regular" style={styles.infoLine}>
          Enter the 6-digit code sent to you at
          {'\n'}
          <UITypography variant="semiBold" style={styles.phoneNumber}>{maskedPhoneNumber}</UITypography>
          {maskedEmail && (
            <>
              {'\n'}and {'\n'}
              <UITypography variant="semiBold" style={styles.phoneNumber}>{maskedEmail}</UITypography>
            </>
          )}
        </UITypography>
        <View style={styles.pinInputContainer}>
          <UIPINInput
            ref={pinInputRef}
            code={otpCode}
            setCode={c => { setOtpCode(c); if (error) setError(''); }}
            pinCount={PIN_COUNT}
            error={!!error}
            editable={isEditable && resendTimer > 0}
          />
        </View>
        {/* Display block timer if user is blocked */}
        {isBlocked && blockTimeRemaining > 0 && (
          <View style={styles.blockTimerContainer}>
            <UITypography style={styles.blockTimerText}>
              You've reached the maximum number of OTP attempts. Please verify your mobile number and try again in sometime.
            </UITypography>
          </View>
        )}
        {!isBlocked && blockTimeRemaining <= 0 && (
          <UITypography style={styles.resendContainer}>
            Didn't receive the code?{' '}
            <ResendTimer onResend={handleResendCode} isResending={isResending} isBlocked={isBlocked} timer={resendTimer} />
          </UITypography>
        )}
        <UIContainedButton
          key={isCodeComplete ? 'enabled' : 'disabled'}
          loading={loading}
          disabled={!isCodeComplete || isBlocked}
          onPress={handleSubmit}
          style={styles.verifyButton}
        >
          VERIFY
        </UIContainedButton>
      </ScrollView>
    </View>
  );
}
