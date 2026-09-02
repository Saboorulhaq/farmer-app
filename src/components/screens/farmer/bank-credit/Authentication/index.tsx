import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, ScrollView, Alert, Platform, Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import ConsentRow from './components/ConsentRow';
import SignaturePad, { SignaturePadRef } from './components/SignaturePad';
import { styles } from './index.styled';
import type { FSAStep } from '@/store/useProductsStore';
import { axiosFinancingPrivate, axiosPublic } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';
import { DEBUG_SIGNATURE_DATA_URI } from '@/constants/testing/signatureDebugData';
import { Toast } from 'toastify-react-native';
import { useFarmer } from '@/constants/context/farmer/context';
import { submissionsService } from '@/services/submissions.service';
import { useProductSubmissionStore } from '@/store/useProductSubmissionStore';

const defaultConsent =
  'Your signature confirms that you have read, understood, and agree to the terms of the forward-sale agreement.';
const defaultInstruction =
  'Please sign within the area and proceed to complete your application';

type RouteParams = {
  Authentication: {
    fsaSteps?: FSAStep[];
    buyer?: any;
    formValues?: Record<string, any>;
    productSubmissionId?: string;
    productSlug?: string;
    // Payment context for harvest crop filtering (buy-inputs flow)
    paymentType?: string;
    harvestDetailIds?: string[];
    // Lender offer flow params
    isLenderOfferFlow?: boolean;
    submissionId?: string;
    offerId?: string;
    lenderName?: string;
    // Static "Initiate FSA" flow flag
    initiateFsaStaticFlow?: boolean;
  };
};

export default function Authentication() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'Authentication'>>();
  const { top } = useSafeAreaInsets();
  const { farmer } = useFarmer();

  const { fsaSteps, productSubmissionId, productSlug, paymentType, harvestDetailIds, isLenderOfferFlow, submissionId: lenderSubmissionId, offerId, lenderName, initiateFsaStaticFlow } = route.params || {};
  const fromDashboard = (route.params as any)?.fromDashboard || false;

  const handleBack = React.useCallback(() => {
    // For buy-inputs flow, navigate back to SaleAgreementPreview
    if (productSlug === 'buy-inputs' && productSubmissionId) {
      navigation.navigate('SaleAgreementPreview', {
        fsaSteps,
        productSubmissionId,
        productSlug,
        fromDashboard,
        paymentType,
        harvestDetailIds: harvestDetailIds || [],
      });
      return;
    }
    navigation.goBack();
  }, [productSlug, productSubmissionId, fsaSteps, fromDashboard, navigation, paymentType, harvestDetailIds]);

  // State for signature upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Tracks whether the component is still mounted (to stop retries on unmount)
  const isMountedRef = useRef(true);
  // Tracks whether an in-progress S3 upload retry loop was cancelled
  const uploadCancelledRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      uploadCancelledRef.current = true;
    };
  }, []);

  // Find the authentication step
  const authStep = useMemo(() => {
    return fsaSteps?.find(step => step.identifier === 'authentication');
  }, [fsaSteps]);

  // Get the first section
  const section = useMemo(() => {
    if (!authStep?.sections?.length) return null;
    return [...authStep.sections]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order)[0];
  }, [authStep]);

  // Get sorted fields
  const fields = useMemo(() => {
    if (!section?.fields?.length) return [];
    return [...section.fields]
      .filter(f => f.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);
  }, [section]);

  // Get consent field
  const consentField = useMemo(() => {
    return fields.find(f => f.field_type === 'checkbox');
  }, [fields]);

  // Dynamic content
  const screenTitle = authStep?.title || 'Authentication';
  const instructionText = section?.description || defaultInstruction;
  const consentText = isLenderOfferFlow
    ? 'Your signature confirms that you have read, understood, and agree to the terms of the loan agreement.'
    : (consentField?.label || defaultConsent);

  const { savedSignatureUri, setSavedSignatureUri } = useProductSubmissionStore();

  const [confirm, setConfirm] = useState(false);
  const [signatureUri, setSignatureUri] = useState<string | null>(savedSignatureUri);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  const canSubmit = initiateFsaStaticFlow
    ? confirm && !isSubmitting
    : confirm && !!signatureUri && !isSubmitting;

  // Get the consent field key
  const consentFieldKey = consentField?.field_key || 'consent_given';

  // Fetch and restore draft data from submission API
  useEffect(() => {
    const fetchDraftData = async () => {
      if (isDebugMode) return; // Debug Mode: no API calls.
      if (!productSubmissionId || !authStep) return;

      try {
        setLoading(true);
        const response = await axiosFinancingPrivate.get(`/submissions/${productSubmissionId}`);
        const responseData = response.data?.data || response.data;
        
        console.log('📥 Authentication - Fetching draft data from submission API');
        
        // Look for authentication step in fsa_steps to restore draft values
        const fsaSteps = responseData?.attributes?.product_configuration?.fsa_steps || [];
        
        for (const step of fsaSteps) {
          if (step.step_number === authStep.step_number || step.identifier === authStep.identifier) {
            console.log('✅ Found authentication step in fsa_steps:', step.identifier);
            if (step.sections) {
              for (const section of step.sections) {
                if (section.fields) {
                  for (const field of section.fields) {
                    // Restore consent checkbox state
                    if (field.field_key === consentFieldKey && field.value !== undefined) {
                      const consentValue = field.value === true || field.value === 'true' || field.value === 1;
                      console.log(`📋 Restored draft value: ${field.field_key} =`, consentValue);
                      setConfirm(consentValue);
                    }
                  }
                }
              }
            }
            break; // Found the step, no need to continue
          }
        }
      } catch (error: any) {
        console.log('❌ Failed to fetch draft data:', error?.response?.data || error?.message);
        // Don't block the user - just log the error
      } finally {
        setLoading(false);
      }
    };

    fetchDraftData();
  }, [productSubmissionId, authStep, consentFieldKey, isDebugMode]);

  // Debug Mode: auto-confirm consent and draw the bundled signature image so the
  // button enables without the user having to sign.
  useEffect(() => {
    if (isDebugMode) {
      setConfirm(true);
      setSignatureUri(DEBUG_SIGNATURE_DATA_URI);
    }
  }, [isDebugMode]);

  // Submit field value as draft
  const submitFieldDraft = async (fieldKey: string, value: any) => {
    if (isDebugMode) return; // Debug Mode: no draft POSTs.
    // Skip draft submission for lender offer flow - no FSA steps involved
    if (isLenderOfferFlow) return;
    if (!authStep || !productSubmissionId) {
      console.warn('Missing authStep or productSubmissionId for draft submission');
      return;
    }

    try {
      const payload = {
        is_draft: true,
        type: 'product_submission',
        //product_slug: 'agri-loan', // Adjust if dynamic
        field_values: {
          [fieldKey]: value,
        },
        step_identifier: authStep.identifier,
        step_number: authStep.step_number,
        submission_id: productSubmissionId,
      };

      console.log('📤 Submitting field draft:', JSON.stringify(payload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', payload);

      console.log('✅ Field draft submitted successfully');
    } catch (error: any) {
      console.log('❌ Failed to submit field draft:', error?.response?.data || error?.message);
      // Don't throw - we don't want to block the user from continuing
    }
  };

  // Step 1: Get presigned URL for signature upload
  const getPresignedUrl = async () => {
    const presignedEndpoint = '/documents/presigned-url';

    console.log('📤 Getting presigned URL for signature...');

    const requestBody: Record<string, string> = {
      documentType: 'signature_image',
      documentName: 'Signature Image',
      fileName: 'signature_image.png',
      fileType: 'image/png',
    };

    // Only include productSubmissionId when NOT in the lender offer flow
    if (!isLenderOfferFlow) {
      const effectiveSubmissionId = productSubmissionId || lenderSubmissionId;
      if (!effectiveSubmissionId) {
        throw new Error('Product submission ID is required');
      }
      requestBody.productSubmissionId = effectiveSubmissionId;
    }

    const response = await axiosFinancingPrivate.post(presignedEndpoint, requestBody);

    console.log('✅ Presigned URL response:', response.data);

    if (!response.data?.success || !response.data?.data?.uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    return response.data.data;
  };

  // Step 2: Upload signature to S3 using presigned URL
  const uploadSignatureToS3 = async (
    uploadUrl: string,
    signatureDataUri: string,
  ): Promise<boolean> => {
    console.log('📤 Uploading signature to S3...');

    return new Promise<boolean>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = () => {
        console.log('✅ S3 upload response status:', xhr.status);
        if (xhr.status === 200) {
          resolve(true);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = error => {
        console.log('❌ XHR error:', error);
        reject(new Error('Network request failed during upload'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload request timed out'));
      };

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'image/png');

      // For React Native, send the file as URI object
      xhr.send({
        uri: signatureDataUri,
        type: 'image/png',
        name: 'signature_image.png',
      } as any);
    });
  };

  // Step 3: Submit signature and complete authentication
  const handleSubmitSignature = async () => {
    if (!canSubmit || (!initiateFsaStaticFlow && !signatureUri)) {
      return;
    }

    // Static "Initiate FSA" flow: skip signature upload / submission and go
    // straight to OTP verification (request OTP, then open the OTP screen).
    if (initiateFsaStaticFlow) {
      try {
        setIsSubmitting(true);
        const phoneNumber = farmer?.attributes?.phone_number;
        if (!phoneNumber) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found.' });
          return;
        }
        await axiosPublic.post('/users/request_otp', {
          data: {
            attributes: {
              phone_number: phoneNumber,
              email: farmer?.attributes?.email,
              skip_count_check: true,
              flow: 'LOAN_REQUEST_OTP',
            },
          },
        });
        navigation.navigate('LoanRequestOTPVerification', {
          initiateFsaStaticFlow: true,
          otpFlow: 'LOAN_REQUEST_OTP',
        });
      } catch (err: any) {
        const error = err?.response?.data?.error || 'Failed to request OTP';
        Toast.show({ type: 'error', text1: 'Error', text2: error });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Debug Mode: skip all upload/submission API calls and go to next screen,
    // UNLESS this is the lender offer flow — there we still want the real
    // confirm-authentication + request-OTP calls to fire.
    if (isDebugMode && !isLenderOfferFlow) {
      navigation.navigate('DynamicLoanApplication', {
        submissionId: productSubmissionId,
        initialStepIndex: 4,
        returnFromFsa: true,
        fsaCompleted: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadError(null);
      // Reset cancellation flag for a fresh upload session
      uploadCancelledRef.current = false;

      // Step 1: Get presigned URL
      const presignedData = await getPresignedUrl();
      const { uploadUrl, documentId } = presignedData;

      // Step 2: Upload signature to S3 (retry every 1 second until success)
      const RETRY_DELAY_MS = 1000;
      let uploadSuccess = false;
      let attempt = 0;

      while (true) {
        // Stop retrying if the component unmounted or the upload was cancelled
        if (!isMountedRef.current || uploadCancelledRef.current) {
          console.log('⛔ Signature upload retry stopped (unmounted or cancelled)');
          break;
        }

        attempt += 1;

        try {
          uploadSuccess = await uploadSignatureToS3(uploadUrl, signatureUri!);
          if (uploadSuccess) {
            console.log(`✅ Signature uploaded to S3 on attempt ${attempt}`);
            break;
          }
        } catch (uploadErr: any) {
          console.warn(
            `⚠️ Signature upload attempt ${attempt} failed: ${uploadErr?.message}. ` +
              `Retrying in ${RETRY_DELAY_MS}ms...`,
          );
        }

        if (uploadSuccess) break;

        // Wait 1 second before the next attempt (cancellation is checked at
        // the top of the loop, so this waits at most RETRY_DELAY_MS).
        await new Promise((resolve) =>
          setTimeout(() => resolve(undefined), RETRY_DELAY_MS),
        );
      }

      if (!isMountedRef.current || uploadCancelledRef.current) {
        return;
      }

      if (!uploadSuccess) {
        throw new Error('Failed to upload signature to storage');
      }

      console.log('✅ Signature uploaded successfully, documentId:', documentId);

      // Lender offer flow: call confirm-authentication and navigate to OTP
      if (isLenderOfferFlow && lenderSubmissionId && offerId) {
        console.log('📤 Confirming lender offer authentication...');
        await submissionsService.confirmLenderAuthentication(lenderSubmissionId, offerId, documentId);
        console.log('✅ Lender offer authentication confirmed');

        // Accept lender offer call is temporarily disabled after authentication.
        // console.log('📤 Accepting lender offer after authentication...');
        // await submissionsService.acceptLenderOffer(lenderSubmissionId, offerId);
        // console.log('✅ Lender offer accepted');

        // Request OTP
        try {
          const phoneNumber = farmer?.attributes?.phone_number;
          if (!phoneNumber) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found. Please contact support.' });
          } else {
            const payload = { data: { attributes: { phone_number: phoneNumber, email: farmer?.attributes?.email, skip_count_check: true, flow: 'OFFER_AGREEMENT_OTP' } } };
            console.log('📤 Requesting OTP for:', phoneNumber);
            await axiosPublic.post('/users/request_otp', payload);
          }
        } catch (err: any) {
          const error = err?.response?.data?.error || 'Failed to request OTP';
          Toast.show({ type: 'error', text1: 'Error', text2: error });
        }

        navigation.navigate('LoanRequestOTPVerification', {
          isLenderOfferFlow: true,
          submissionId: lenderSubmissionId,
          offerId,
          lenderName,
          productSubmissionId: lenderSubmissionId,
          otpFlow: 'OFFER_AGREEMENT_OTP',
        });
        return;
      }

      // Original FSA/buy-inputs flow: Submit step 9 to API with documentId
      if (authStep && productSubmissionId) {
        console.log('📤 Submitting Step 9 (Authentication)...');

        // Prepare field values - signature_image should be the documentId
        const fieldValues: Record<string, any> = {
          signature_image: documentId,
          consent_given: confirm,
        };

        const response = await axiosFinancingPrivate.post('/submissions', {
          is_draft: false,
          type: 'product_submission',
          product_slug: productSlug || 'agri-loan',
          field_values: fieldValues,
          step_identifier: authStep.identifier,
          step_number: authStep.step_number,
          submission_id: productSubmissionId,
        });

        console.log('✅ Step 9 submission successful:', response.data);
      }

      // Step 4: Navigate based on product type
      // For buy-inputs: go to OTP verification first, then create order after OTP is verified
      // For other products: return to Step 5 (Documents)
      if (productSlug === 'buy-inputs') {
        // Request OTP (order will be created after OTP verification)
        try {
          const phoneNumber = farmer?.attributes?.phone_number;
          if (!phoneNumber) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found. Please contact support.' });
          } else {
            const payload = { data: { attributes: { phone_number: phoneNumber, email: farmer?.attributes?.email, skip_count_check: true, flow: 'BUY_INPUT_OTP' } } };
            console.log('📤 Requesting OTP for:', phoneNumber);
            await axiosPublic.post('/users/request_otp', payload);
          }
        } catch (err: any) {
          const error = err?.response?.data?.error || 'Failed to request OTP';
          Toast.show({ type: 'error', text1: 'Error', text2: error });
        }
        navigation.navigate('LoanRequestOTPVerification', { productSubmissionId: productSubmissionId, productSlug: productSlug, otpFlow: 'BUY_INPUT_OTP' });
      } else {
        console.log('✅ FSA flow completed, navigating back to Step 5 (Documents)');
        // Navigate directly to DynamicLoanApplication with Step 5 (index 4) selected
        navigation.navigate('DynamicLoanApplication', {
          submissionId: productSubmissionId,
          initialStepIndex: 4, // Step 5 (Documents) is at index 4 (0-based)
          returnFromFsa: true,
          fsaCompleted: true,
        });
      }
    } catch (error: any) {
      console.log('❌ Signature submission error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to submit signature. Please try again.';

      setUploadError(errorMessage);

      Alert.alert(
        'Upload Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    signaturePadRef.current?.clearSignature();
    setSignatureUri(null);
    setSavedSignatureUri(null);
    setUploadError(null);
  };

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={screenTitle}
        onBack={handleBack}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={Platform.OS === 'android'}
        scrollEnabled={Platform.OS === 'ios' ? !isDrawing : true}
        scrollEventThrottle={16}
      >
        <UITypography variant="regular" style={styles.instruction}>
          {instructionText}
        </UITypography>

        <View
          style={styles.signatureWrapper}
          onTouchStart={() => {
            if (Platform.OS === 'ios') {
              setIsDrawing(true);
            }
          }}
          onTouchEnd={() => {
            if (Platform.OS === 'ios') {
              setTimeout(() => setIsDrawing(false), 500);
            }
          }}
        >
          <View style={styles.signatureContainer}>
            <SignaturePad
                ref={signaturePadRef}
                initialDataUri={isDebugMode ? DEBUG_SIGNATURE_DATA_URI : savedSignatureUri}
                onCaptured={(uri) => {
                setSignatureUri(uri);
                setSavedSignatureUri(uri);
                if (Platform.OS === 'ios') {
                  setIsDrawing(false);
                }
              }}
              onCleared={() => {
                setSignatureUri(null);
                setSavedSignatureUri(null);
                setUploadError(null);
                if (Platform.OS === 'ios') {
                  setIsDrawing(false);
                }
              }}
            />
          </View>
          <Pressable
            onPress={handleReset}
            style={[styles.resetLink, !signatureUri && styles.resetLinkHidden]}
            disabled={isSubmitting || !signatureUri}
          >
            <UITypography variant="medium" style={styles.resetLinkText}>
              Reset
            </UITypography>
          </Pressable>
        </View>

        {uploadError && (
          <UITypography
            variant="regular"
            style={[styles.instruction, { color: '#D32F2F', marginTop: 8 }]}
          >
            {uploadError}
          </UITypography>
        )}

        <ConsentRow
          checked={confirm}
          onToggle={() => {
            const newValue = !confirm;
            setConfirm(newValue);
            // Auto-save checkbox state as draft
            submitFieldDraft(consentFieldKey, newValue);
          }}
          text={consentText}
        />

        <UIContainedButton
          style={styles.requestButton}
          disabled={!canSubmit}
          onPress={handleSubmitSignature}
          key={`button-${canSubmit}`}
        >
          {isSubmitting ? 'Submitting...' : isLenderOfferFlow ? 'Accept' : 'Confirm Agreement'}
        </UIContainedButton>
      </ScrollView>
    </View>
  );
}
