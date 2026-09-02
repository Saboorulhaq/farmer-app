import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ViewStyle, Pressable, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import UITypography from '@/components/ui/typography';
import { UIContainedButton } from '@/components/ui/button';
import LoanRequestIcon from '@/components/icons/LoanRequestIcon';
import PersonalDetailIcon from '@/components/icons/PersonalDetailIcon';
import FarmDetailIcon from '@/components/icons/FarmDetailIcon';
import FinancialProfileIcon from '@/components/icons/FinancialProfileIcon';
import DocumentsIcon from '@/components/icons/DocumentsIcon';
import { styles } from './index.styled';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import { useProductsStore } from '@/store/useProductsStore';
import LinearGradient from 'react-native-linear-gradient';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosPublic } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import {  useState } from 'react';
import FsaLinkInfoModal from '@/components/screens/farmer/bank-credit/components/FsaLinkInfoModal';
import { submissionsService } from '@/services/submissions.service';


// Icon styling props type
type IconStyleProps = {
  bgColor?: string;
  color?: string;
  strokeColor?: string;
  bgFill?: string;
  borderColor?: string;
  iconFill?: string;
};

// Icon mapping for dynamic steps - maps step identifier to icons
const getIconForStep = (stepIdentifier?: string, iconUrl?: string, completed: boolean = false): React.ReactElement => {
  // Completed state styling (blue background, white icons)
  const completedProps: IconStyleProps = {
    bgColor: '#1D3A70',
    color: 'white',
    strokeColor: 'white',
    bgFill: '#1D3A70',
    borderColor: '#1D3A70',
    iconFill: 'white',
  };

  // Default/incomplete state styling (let components use their defaults)
  const defaultProps: IconStyleProps = {
    bgColor: undefined,
    color: undefined,
    strokeColor: undefined,
    bgFill: undefined,
    borderColor: undefined,
    iconFill: undefined,
  };

  const props = completed ? completedProps : defaultProps;

  // Map based on step identifier (more reliable)
  const identifierMap: { [key: string]: React.ReactElement } = {
    loan_request: <LoanRequestIcon size={30} bgColor={props.bgColor} color={props.color} />,
    personal_details: <PersonalDetailIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
    farm_details: <FarmDetailIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
    financial_profile: <FinancialProfileIcon iconFill={props.iconFill} bgFill={props.bgFill} borderColor={props.borderColor} />,
    documents: <DocumentsIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
  };

  if (stepIdentifier && identifierMap[stepIdentifier]) {
    return identifierMap[stepIdentifier];
  }

  // Fallback: try to extract icon name from URL (e.g., "https://api.iconify.design/mdi/cash.svg" -> "cash")
  if (iconUrl) {
    const urlMatch = iconUrl.match(/\/mdi\/([^.]+)/);
    const iconName = urlMatch ? urlMatch[1] : iconUrl;

    const iconMap: { [key: string]: React.ReactElement } = {
      cash: <LoanRequestIcon size={30} bgColor={props.bgColor} color={props.color} />,
      account: <PersonalDetailIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
      barn: <FarmDetailIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
      'currency-usd': <FinancialProfileIcon iconFill={props.iconFill} bgFill={props.bgFill} borderColor={props.borderColor} />,
      'file-document': <DocumentsIcon strokeColor={props.strokeColor} bgFill={props.bgFill} borderColor={props.borderColor} />,
    };

    if (iconMap[iconName]) {
      return iconMap[iconName];
    }
  }

  return <LoanRequestIcon size={30} bgColor={props.bgColor} color={props.color} />;
};


export default function BankApplication() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top } = useSafeAreaInsets();
  const { config, submissionStatus: storeSubmissionStatus, submissionId: storeSubmissionId, fetchProductConfig, setSubmissionId: setStoreSubmissionId, setSubmissionStatus: setStoreSubmissionStatus } = useProductsStore();
  const { farmer } = useFarmer();
  const [loading, setLoading] = useState(false);
  const [fsaModalVisible, setFsaModalVisible] = useState(false);
  
  // Track if component is mounting for the first time
  const isInitialMount = useRef(true);

  // Get slug and submissionId from route params
  const slug = route.params?.slug || config?.attributes?.slug || 'cash-credit';
  const routeSubmissionId = route.params?.submissionId;

  // Fetch submission data if submissionId is provided (from route params, store, or config), otherwise fetch product config
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // Get current store state to ensure we have the latest submissionId
        const currentStoreState = useProductsStore.getState();
        const currentStoreSubmissionId = currentStoreState.submissionId;
        const currentConfig = currentStoreState.config;
        
        // Get submissionId from route params, store, or config (in that priority order)
        const currentSubmissionId = routeSubmissionId || currentStoreSubmissionId || currentConfig?.attributes?.submission_id;
        
        if (currentSubmissionId) {
          // Fetch from submissions API to get latest step statuses
          try {
            console.log('📋 Fetching submission data for:', currentSubmissionId);
            const submissionResponse = await submissionsService.getSubmissionResume(currentSubmissionId);
            
            // API response structure: { data: { attributes: { product_configuration: {...} } } }
            // product_configuration has steps and fsa_steps arrays directly with status fields
            const submissionData = submissionResponse?.data;
            const productConfigRaw = submissionData?.attributes?.product_configuration;
            
            if (productConfigRaw) {
              // Extract submission status
              const submissionStatus = submissionData?.attributes?.status || 'in_progress';
              
              // Transform to match ProductConfiguration format expected by store
              // product_configuration from API has steps/fsa_steps directly, not wrapped in attributes
              const transformedConfig = {
                id: submissionData?.id,
                type: 'product_configuration',
                attributes: {
                  ...productConfigRaw,
                  slug: productConfigRaw.slug || slug,
                  submission_id: currentSubmissionId,
                  status: submissionStatus,
                },
              };
              
              console.log('✅ Loaded config from submission with step statuses:', {
                submissionId: currentSubmissionId,
                submissionStatus,
                stepsCount: productConfigRaw.steps?.length || 0,
                fsaStepsCount: productConfigRaw.fsa_steps?.length || 0,
              });
              
              // Update store with the config from submission
              useProductsStore.setState({
                config: transformedConfig,
                submissionId: currentSubmissionId,
                submissionStatus,
              });
            } else {
              console.warn('⚠️ No product_configuration found in submission data, structure:', submissionResponse);
              // Fallback to product config if submission doesn't have it
              fetchProductConfig(slug, true);
            }
          } catch (error: any) {
            console.log('Error fetching submission data:', error);
            // Don't show toast if error was already handled globally (e.g., 401 session timeout)
            // The user will be redirected to login screen by the axios interceptor
            if (!(error as any).__handledGlobally) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.error || 'Failed to load application. Please try again.',
              });
            }
            // Fallback to product config on error
            fetchProductConfig(slug, true);
          }
        } else {
          // No submissionId, fetch product config normally
          fetchProductConfig(slug, true);
        }
      };
      
      fetchData();
      
      // No cleanup on blur - we want to preserve submissionId when navigating to child screens
      // (like DynamicLoanApplication) and coming back
    }, [slug, routeSubmissionId, fetchProductConfig, setStoreSubmissionId, setStoreSubmissionStatus])
  );
  
  // Clear submissionId when component unmounts (going back to home/eligibility)
  // This runs only on unmount, not on blur (when navigating to child screens)
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - clearing submissionId from store');
      setStoreSubmissionId(null);
      setStoreSubmissionStatus(null);
      
      // Re-fetch fresh product config to restore eligibility and why_apply_with_us data
      const currentState = useProductsStore.getState();
      if (currentState.config?.attributes?.submission_id) {
        console.log('🧹 Re-fetching fresh product config to restore instructions');
        fetchProductConfig(slug, true);
      }
    };
  }, [slug, fetchProductConfig, setStoreSubmissionId, setStoreSubmissionStatus]);

  // Use submissionId and status from route params if available, otherwise from store
  const submissionId = routeSubmissionId || storeSubmissionId || config?.attributes?.submission_id;
  const submissionStatus = config?.attributes?.status || storeSubmissionStatus;

  // Check if status is pending OTP verification
  const isPendingOtpVerification = submissionStatus === 'pending_otp_verification';

  // Check if application is submitted
  const isSubmitted = submissionStatus === 'submitted';

  // Check if application is in progress (has in_progress status OR has a submission_id indicating it was started)
  const isApplicationInProgress = submissionStatus === 'in_progress' || !!submissionId;

  // Get steps from product configuration and sort by display_order
  const steps = useMemo(() => {
    const activeSteps = config?.attributes?.steps?.filter(step => step.is_active) || [];
    return activeSteps.sort((a, b) => a.display_order - b.display_order);
  }, [config]);

  // Get FSA steps from product configuration
  const fsaSteps = useMemo(() => {
    const activeFsaSteps = config?.attributes?.fsa_steps?.filter(step => step.is_active) || [];
    return activeFsaSteps.sort((a, b) => a.display_order - b.display_order);
  }, [config]);

  // Check if all 5 main steps are complete
  const allMainStepsComplete = useMemo(() => {
    return steps.length > 0 && steps.every(step => step.status === 'completed');
  }, [steps]);

  // Note: FSA flow always restarts from first step to avoid state inconsistencies
  // This ensures users always go through the complete FSA flow when clicking "Link FSA"
  const firstIncompleteFsaStep = useMemo(() => {
    // Always return the first FSA step to restart the flow
    return fsaSteps && fsaSteps.length > 0 ? fsaSteps[0] : null;
  }, [fsaSteps]);

  // Check if all FSA steps are completed
  const allFsaStepsComplete = useMemo(() => {
    if (!fsaSteps || fsaSteps.length === 0) return false;
    return fsaSteps.every(step => step.status === 'completed');
  }, [fsaSteps]);

  // Separate completed steps from not started steps (maintain display_order)
  const { completedSteps, notStartedSteps, firstNotStartedStep } = useMemo(() => {
    const completed = steps
      .filter(step => step.status === 'completed')
      .sort((a, b) => a.display_order - b.display_order);
    
    const notStarted = steps
      .filter(step => {
        const status = step.status;
        // Check for not_started, in_progress, null, undefined, or empty string
        return status === 'not_started' || 
               status === 'in_progress' || 
               status === null || 
               status === undefined || 
               status === '' ||
               status === 'null' ||
               !status;
      })
      .sort((a, b) => a.display_order - b.display_order);
    
    const firstNotStarted = notStarted.length > 0 ? notStarted[0] : null;
    return { completedSteps: completed, notStartedSteps: notStarted, firstNotStartedStep: firstNotStarted };
  }, [steps]);

  // Helper function to navigate to a step - handles buy-inputs special screens
  const navigateToStep = useCallback((step: any, stepIndex: number, isEdit: boolean = false) => {
    const currentSubmissionId = config?.attributes?.submission_id || submissionId;
    
    // For buy-inputs product, extract providerId and providerName from step 1 if available
    let providerId: string | undefined;
    let providerName: string | undefined;
    
    if (slug === 'buy-inputs') {
      const step1 = steps?.find(s => s.identifier === 'government_verified_provider');
      if (step1?.sections && Array.isArray(step1.sections)) {
        const section = step1.sections[0];
        if (section?.fields && Array.isArray(section.fields)) {
          const providerIdField = section.fields.find(
            f => f.field_key === 'provider_id' || f.field_key === 'selected_provider_id'
          );
          const providerNameField = section.fields.find(
            f => f.field_key === 'provider_name'
          );
          
          if (providerIdField?.value) {
            providerId = providerIdField.value;
          }
          if (providerNameField?.value) {
            providerName = providerNameField.value;
          }
        }
      }
    }
    
    // For buy-inputs product, handle special step navigation
    if (slug === 'buy-inputs') {
      // Check if checkout step is completed to set isOrderLocked
      const checkoutStep = steps?.find(s => s.identifier === 'checkout');
      const isOrderLocked = checkoutStep?.status === 'completed';

      const buyInputsScreenMap: { [key: string]: string } = {
        government_verified_provider: 'GovernmentVerifiedBuyers',
        input_purchase_details: 'InputPurchase',
        cart_summary: 'CartSummary',
        checkout: 'Checkout',
        loan_agreement: 'SaleAgreementPreview',
        authentication: 'Authentication',
        // Step 5 (harvest_details) uses the dynamic approach
      };

      const screenName = buyInputsScreenMap[step.identifier];
      if (screenName) {
        if (screenName === 'GovernmentVerifiedBuyers') {
          navigation.navigate(screenName, {
            fsaStep: step,
            fsaSteps: steps,
            productSlug: slug,
            submissionId: currentSubmissionId,
          });
        } else if (screenName === 'SaleAgreementPreview') {
          // Step 6: Loan Agreement
          navigation.navigate(screenName, {
            fsaSteps: steps,
            productSubmissionId: currentSubmissionId,
            productSlug: slug,
          });
        } else if (screenName === 'Authentication') {
          // Step 7: Authentication
          navigation.navigate(screenName, {
            fsaSteps: steps,
            productSubmissionId: currentSubmissionId,
            productSlug: slug,
          });
        } else {
          // Steps 2-4: InputPurchase, CartSummary, Checkout
          navigation.navigate(screenName, {
            step: step,
            steps: steps,
            productSlug: slug,
            submissionId: currentSubmissionId,
            providerId,
            providerName,
            isOrderLocked: isOrderLocked,
          });
        }
        return;
      }
    }

    // Default: navigate to DynamicLoanApplication
    navigation.navigate('DynamicLoanApplication', {
      slug,
      initialStepIndex: stepIndex,
      submissionId: currentSubmissionId,
      isEditMode: isEdit, // Only set to true when editing a completed step
    });
  }, [config?.attributes?.submission_id, submissionId, slug, steps, navigation]);

  // Helper function to navigate to FSA step (always starts from first step)
  const navigateToFsaStep = useCallback((fsaStep: any) => {
    // Map FSA step identifier to navigation screen
    const fsaScreenMap: { [key: string]: string } = {
      government_verified_buyers: 'GovernmentVerifiedBuyers',
      government_verified_provider: 'GovernmentVerifiedBuyers', // buy-inputs uses provider instead of buyer
      forward_sale_agreement: 'SaleAgreement',
      review_agreement: 'SaleAgreementPreview',
      authentication: 'Authentication',
    };

    const screenName = fsaScreenMap[fsaStep.identifier];

    if (screenName) {
      // Get submission ID from config or submissionId variable
      const currentSubmissionId = config?.attributes?.submission_id || submissionId;
      
      // Prepare navigation params with all required data
      const navParams: any = {
        fsaStep: fsaStep,
        fsaSteps,
        productSlug: slug,
        submissionId: currentSubmissionId,
        productSubmissionId: currentSubmissionId, // Also pass as productSubmissionId for consistency
      };

      // Note: expectedVolume and expectedVolumeUnit are no longer passed as params
      // FSA screens should fetch these values from the submission API using submissionId

      // For SaleAgreementPreview (review_agreement), ensure productSubmissionId is explicitly set
      if (fsaStep.identifier === 'review_agreement') {
        // productSubmissionId is already set above, but ensure it's not undefined
        if (!navParams.productSubmissionId) {
          navParams.productSubmissionId = config?.attributes?.submission_id;
        }
      }

      console.log('🚀 Navigating to FSA step with params:', navParams);
      navigation.navigate(screenName, navParams);
    }
  }, [fsaSteps, slug, config?.attributes?.submission_id, steps, navigation, submissionId]);

  // Handler for navigating to OTP verification
  const navigateToOtpVerification = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            skip_count_check: true,
            flow: 'LOAN_REQUEST_OTP',
          },
        },
      };
      
      if (!farmer?.attributes?.phone_number) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Phone number not found. Please contact support.',
        });
        return;
      }

      console.log('📤 Requesting OTP for:', farmer.attributes.phone_number);
      await axiosPublic.post('/users/request_otp', payload);
      
      navigation.navigate('LoanRequestOTPVerification');
    } catch (err: any) {
       console.log('request_otp error', err);
       const error = err?.response?.data?.error || 'Failed to request OTP';
       
       if (err.code === 'NETWORK_ERROR' || !err?.response) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection and try again',
        });
        return;
       }

       Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
    } finally {
      setLoading(false);
    }
  }, [farmer?.attributes?.phone_number, navigation]);

  // Handler for Request Loan button - navigate to Summary screen
  const handleRequestLoanPress = useCallback(() => {
    if (!submissionId) {
      console.warn('⚠️ No submissionId available for navigating to Summary');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Submission ID not found. Please try again.',
      });
      return;
    }
    
    console.log('📄 Navigating to Summary screen with submissionId:', submissionId);
    
    navigation.navigate('LoanSummary', {
      submissionId: submissionId,
      fromStepper: true,
    });
  }, [submissionId, navigation]);

  // Handler for FSA modal Skip button
  const handleFsaSkip = useCallback(() => {
    setFsaModalVisible(false);
    navigateToOtpVerification();
  }, [navigateToOtpVerification]);

  // Handler for FSA modal Proceed button
  const handleFsaProceed = useCallback(() => {
    setFsaModalVisible(false);
    // Always navigate to the first FSA step to restart the flow from the beginning
    // This prevents state inconsistencies and ensures users go through the complete FSA flow
    const stepToNavigate = fsaSteps && fsaSteps.length > 0 ? fsaSteps[0] : null;
    if (stepToNavigate) {
      navigateToFsaStep(stepToNavigate);
    } else {
      // Fallback: navigate to OTP if no FSA steps available
      navigateToOtpVerification();
    }
  }, [fsaSteps, navigateToFsaStep, navigateToOtpVerification]);

  // Separate first step from remaining steps (for initial state when no steps are completed)
  const [firstStep, ...remainingSteps] = steps;

  const StepItem = ({
    icon,
    label,
    completed = false,
    onEdit,
  }: {
    icon: React.ReactNode;
    label: string;
    completed?: boolean;
    onEdit?: () => void;
  }) => (
    <View style={styles.stepItem}>
      <View>{icon}</View>
      <View style={styles.stepItemContent}>
        <UITypography variant="semiBold" style={[styles.stepLabel, completed && styles.stepLabelActive]}>
          {label}
        </UITypography>
        {completed && onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <UITypography variant="medium" style={styles.editLink}>
              Edit
            </UITypography>
          </TouchableOpacity>
        )}
      </View>
      {completed && (
        <View style={styles.completedBadge}>
          <UITypography variant="medium" style={styles.completedText}>
            Completed
          </UITypography>
        </View>
      )}
    </View>
  );

  // If no steps available, show loading or fallback
  if (!steps || steps.length === 0) {
    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title="Loan Application"
          onBack={() => navigation.goBack()}
          containerStyle={[styles.header, { marginTop: top }]}
          titleStyle={styles.title}
        />
        <View style={styles.content}>
          <UITypography variant="medium" style={styles.getStartedTitle}>
            Loading...
          </UITypography>
        </View>
      </View>
    );
  }

  // Render for submitted status - all steps completed, no edit option
  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title="Loan Application"
          onBack={() => navigation.goBack()}
          containerStyle={[styles.header, { marginTop: top }]}
          titleStyle={styles.title}
        />

        <View style={styles.content}>
          <UITypography variant="medium" style={styles.getStartedTitle}>
            Application Submitted
          </UITypography>
          <UITypography variant="medium" style={styles.subtitle}>
            Your loan application has been successfully submitted and is under review.
          </UITypography>

          <UITypography variant="semiBold" style={styles.sectionLabel}>
            Application Summary
          </UITypography>

          {/* All Steps - Showing as Completed without Edit */}
          <View style={styles.completedStepsWrap}>
            {steps.map((step, index) => (
              <React.Fragment key={step.step_id}>
                <StepItem
                  icon={getIconForStep(step.identifier, step.metadata?.icon, true)}
                  label={step.title}
                  completed={true}
                />
                {index < steps.length - 1 && (
                  <View style={styles.stepLine2} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Render for all main steps complete (in_progress with FSA steps)
  if (isApplicationInProgress && allMainStepsComplete) {
    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title="Loan Application"
          onBack={() => navigation.goBack()}
          containerStyle={[styles.header, { marginTop: top }]}
          titleStyle={styles.title}
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Ready to Submit Card */}
          <LinearGradient
            colors={['#202CAF', '#7297E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.readyToSubmitCard}
          >
            <UITypography variant="semiBold" style={styles.readyToSubmitTitle}>
              Your loan application is ready to submit
            </UITypography>
            <UITypography variant="medium" style={styles.readyToSubmitSubtitle}>
              Tap below to complete your request.
            </UITypography>
            <Pressable
              onPress={handleRequestLoanPress}
              style={({ pressed }) => [
                styles.requestLoanButton,
                { opacity: pressed || loading ? 0.8 : 1 }
              ]}
              disabled={loading}
            >
              <Text style={styles.requestLoanButtonText}>
                {loading ? 'Processing...' : 'Request Loan'}
              </Text>
            </Pressable>
          </LinearGradient>

          <UITypography variant="medium" style={styles.subtitle}>
            Easily apply for a bank credit loan with a simplified, minimal-step
            process
          </UITypography>

          <UITypography variant="semiBold" style={styles.sectionLabel}>
            Get loan offers in few steps
          </UITypography>

          {/* All Steps - Showing as Completed */}
          <View style={styles.completedStepsWrap}>
            {steps.map((step, index) => (
              <React.Fragment key={step.step_id}>
                <StepItem
                  icon={getIconForStep(step.identifier, step.metadata?.icon, true)}
                  label={step.title}
                  completed={true}
                  onEdit={() => navigateToStep(step, index, true)}
                />
                {index < steps.length - 1 && (
                  <View style={styles.stepLine2} />
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
        <FsaLinkInfoModal
          visible={fsaModalVisible}
          onClose={() => setFsaModalVisible(false)}
          onSkip={handleFsaSkip}
          onProceed={handleFsaProceed}
        />
      </View>
    );
  }

  // Render for in-progress application - some steps completed, some not started
  // Show "Continue Your Application" if we have an in-progress status OR a submission_id (indicating app was started)
  // Even if no steps are currently marked as 'completed' (e.g., after editing a step)
  if (isApplicationInProgress) {
    // Helper function to check if a step is in progress
    const isStepInProgress = (step: any) => step.status === 'in_progress';
    
    // Find the first step that is completed (for displaying completed steps with edit option)
    // Show Continue button for ALL steps with status 'in_progress'
    const firstCompletedStepIndex = steps.findIndex(step => step.status === 'completed');

    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title="Loan Application"
          onBack={() => navigation.goBack()}
          containerStyle={[styles.header, { marginTop: top }]}
          titleStyle={styles.title}
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <UITypography variant="medium" style={styles.getStartedTitle}>
            Continue Your Application
          </UITypography>
          <UITypography variant="medium" style={styles.subtitle}>
            Easily apply for a bank credit loan with a simplified, minimal-step
            process
          </UITypography>

          <UITypography variant="semiBold" style={styles.sectionLabel}>
            Get loan offers in few steps
          </UITypography>

          {/* Render all steps in original order */}
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = isStepInProgress(step);
            // Check if this is the first not-started step (should show Continue button)
            const isFirstNotStarted = firstNotStartedStep && step.step_id === firstNotStartedStep.step_id;
            // Show Continue button for in-progress steps OR the first not-started step
            const shouldShowContinue = isInProgress || isFirstNotStarted;
            const isUpcoming = !isCompleted && !shouldShowContinue;

            return (
              <React.Fragment key={step.step_id}>
                {/* Completed steps - show with edit option */}
                {isCompleted && (
                  <View style={styles.completedStepsWrap}>
                    <StepItem
                      icon={getIconForStep(step.identifier, step.metadata?.icon, true)}
                      label={step.title}
                      completed={true}
                      onEdit={() => navigateToStep(step, index, true)}
                    />
                    {index < steps.length - 1 && <View style={styles.stepLine2} />}
                  </View>
                )}

                {/* In-progress steps or first not-started step - Featured Card with Continue button */}
                {shouldShowContinue && (
                  <View style={{ marginTop: index === 0 || firstCompletedStepIndex === index - 1 ? 0 : 16 }}>
                    <View style={styles.cardRow}>
                      <View style={styles.iconWrap}>
                        {getIconForStep(step.identifier, step.metadata?.icon)}
                        {index < steps.length - 1 && <View style={styles.stepLine} />}
                      </View>
                      <View style={styles.cardTextWrap}>
                        <UITypography variant="semiBold" style={styles.cardTitle}>
                          {step.title}
                        </UITypography>
                        <UITypography variant="medium" style={styles.cardDesc}>
                          {step.description}
                        </UITypography>

                        <UIContainedButton
                          size="small"
                          onPress={() => navigateToStep(step, index)}
                          style={styles.startButton}
                        >
                          Continue
                        </UIContainedButton>
                      </View>
                    </View>
                  </View>
                )}

                {/* Upcoming steps - show as disabled */}
                {isUpcoming && (
                  <View style={styles.stepsWrap}>
                    <StepItem
                      icon={getIconForStep(step.identifier, step.metadata?.icon)}
                      label={step.title}
                    />
                    {index < steps.length - 1 && <View style={styles.stepLine2} />}
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title="Loan Application"
        onBack={() => {
          // Check if we can go back, otherwise navigate to Main
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Main');
          }
        }}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={styles.title}
      />

      <View style={styles.content}>
        <UITypography variant="medium" style={styles.getStartedTitle}>
          Let's Get Started!
        </UITypography>
        <UITypography variant="medium" style={styles.subtitle}>
          Easily apply for a bank credit loan with a simplified, minimal-step
          process
        </UITypography>

        <UITypography variant="semiBold" style={styles.sectionLabel}>
          Get loan offers in few steps
        </UITypography>

        {/* First Step - Featured Card */}
        {firstStep && (
          <View style={{ marginTop: 16 }}>
            <View style={styles.cardRow}>
              <View style={styles.iconWrap}>
                {getIconForStep(firstStep.identifier, firstStep.metadata?.icon)}
                <View style={styles.stepLine} />
              </View>
              <View style={styles.cardTextWrap}>
                <UITypography variant="semiBold" style={styles.cardTitle}>
                  {firstStep.title}
                </UITypography>
                <UITypography variant="medium" style={styles.cardDesc}>
                  {firstStep.description}
                </UITypography>

                <UIContainedButton
                  size="small"
                  onPress={() => navigateToStep(firstStep, 0)}
                  style={styles.startButton}
                >
                  Start Now
                </UIContainedButton>
              </View>
            </View>
          </View>
        )}

        {/* Remaining Steps */}
        {remainingSteps.length > 0 && (
          <View style={styles.stepsWrap}>
            {remainingSteps.map((step, index) => (
              <React.Fragment key={step.step_id}>
                <StepItem
                  icon={getIconForStep(step.identifier, step.metadata?.icon)}
                  label={step.title}
                />
                {index < remainingSteps.length - 1 && (
                  <View style={styles.stepLine2} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
