import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './ActiveRequestsSection.styled';
import UITypography from '@/components/ui/typography';
import ActiveRequestCard from './ActiveRequestCard';
import LoanApplicationDeleteModal from '@/components/screens/farmer/bank-credit/components/LoanApplicationDeleteModal';
import { submissionsService, Submission } from '@/services/submissions.service';
import { Toast } from 'toastify-react-native';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosPublic, axiosFinancingPrivate } from '@/config/axios';

interface ActiveRequest {
  id: string;
  status: string;
  loanAmount: string;
  loanDuration: string;
  loanType: string;
  farmNumber: string;
  loanTypeLabel?: string;
  farmNumberLabel?: string;
  rejectionNote?: string | null;
  onComplete?: () => void;
  onDelete?: () => void;
}

interface ActiveRequestsSectionProps {
  requests?: ActiveRequest[];
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface ActiveRequestsSectionRef {
  refresh: () => Promise<void>;
}

const ActiveRequestsSection = forwardRef<ActiveRequestsSectionRef, ActiveRequestsSectionProps>(({
  requests = [],
  onComplete,
  onDelete,
}, ref) => {
  const navigation = useNavigation<any>();
  const { farmer } = useFarmer();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await submissionsService.getAllSubmissions();
      setSubmissions(response.data);
    } catch (error) {
      console.log('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchSubmissions,
  }), [fetchSubmissions]);

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, [fetchSubmissions])
  );

// Transform API submissions to ActiveRequest format
  const transformedRequests: ActiveRequest[] = submissions?.map((submission) => {
    const isBuyInputs = submission.product_slug === 'buy-inputs';
    const isSellHarvest = submission.product_slug === 'sell-harvest';
    const inputType = submission.selected_input_type;
    const inputCategory = submission.selected_input_category;

    let loanAmountDisplay = `Rs ${(submission.loan_amount ?? 0).toLocaleString()}`;
    let loanDurationDisplay = submission.loan_duration || '-';
    let loanTypeDisplay = submission.transaction_type || submission.loan_type || '-';
    let farmNumberDisplay = inputCategory || submission.farm_number || '-';
    let loanTypeLabel = isBuyInputs ? 'Transaction Type' : 'Loan Type';
    let farmNumberLabel = inputCategory ? 'Input Category' : 'Farm Number';
    
    // For sell-harvest, show crop and volume info
    if (isSellHarvest) {
      loanAmountDisplay = submission.crop || 'Harvest';
      loanDurationDisplay = ''; // Empty to avoid duplicate display
      loanTypeDisplay = submission.volume && submission.unit 
        ? `${submission.volume} ${submission.unit}` 
        : '-';
      farmNumberDisplay = submission.sell_type || '-';
      loanTypeLabel = 'Volume';
      farmNumberLabel = 'Sell Type';
    }
    // For buy-inputs, if no loan amount (item purchase), show item as main display
    else if (isBuyInputs) {
       // If input type exists, show it as duration/subtitle
       if (inputType) {
         loanDurationDisplay = inputType;
       }
       // Note: loanAmount will show Rs 0 if null, which is correct for unpriced items
    }

    // Determine status display (only "In Progress" is shown in the list)
    let statusDisplay = 'In Progress';
    if (submission.status === 'submitted') {
      statusDisplay = 'Submitted';
    } else if (submission.status === 'rejected' || submission.rejection_note) {
      statusDisplay = 'Rejected';
    } else if (submission.status === 'approved') {
      statusDisplay = 'Approved';
    } else if (
      submission.status === 'completed' ||
      submission.status?.toLowerCase() === 'completed'
    ) {
      statusDisplay = 'Completed';
    }

    return {
      id: submission.submission_id,
      status: statusDisplay,
      loanAmount: loanAmountDisplay,
      loanDuration: loanDurationDisplay,
      loanType: loanTypeDisplay,
      farmNumber: farmNumberDisplay,
      
      // Dynamic labels
      loanTypeLabel, 
      farmNumberLabel,
      
      // Rejection note
      rejectionNote: submission.rejection_note,
    };
  });

  // Only show applications that are In Progress (exclude Submitted/Completed/Accepted/Rejected)
  const displayRequests = (transformedRequests.length > 0 ? transformedRequests : []).filter(
    (req) => req.status === 'In Progress'
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#099453" />
        </View>
      </View>
    );
  }

  if (displayRequests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <UITypography variant="regular" style={{ fontSize: 16, color: '#8B8B8B', textAlign: 'center' }}>
            No applications in progress.
          </UITypography>
          <UITypography variant="regular" style={{ fontSize: 14, color: '#8B8B8B', textAlign: 'center', marginTop: 8 }}>
            Applications you have started but not yet submitted will appear here.
          </UITypography>
        </View>
      </View>
    );
  }

  const handleDeleteClick = (id: string) => {
    setSelectedRequestId(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteProceed = async () => {
    if (!selectedRequestId) {
      setDeleteModalVisible(false);
      setSelectedRequestId(null);
      return;
    }

    try {
      // Call the DELETE API with force=true
      await submissionsService.deleteSubmission(selectedRequestId, true);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Request deleted successfully',
      });

      // Refresh the submissions list
      await fetchSubmissions();

      // Close modal and reset state
      setDeleteModalVisible(false);
      setSelectedRequestId(null);

      // Call optional onDelete callback if provided
      onDelete?.(selectedRequestId);
    } catch (error: any) {
      console.log('Error deleting submission:', error);

      // Don't show toast if error was already handled globally (e.g., 401 session timeout)
      if (!(error as any).__handledGlobally) {
        // Show error message
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete request. Please try again.',
        });
      }

      // Close modal but keep selectedRequestId in case user wants to retry
      setDeleteModalVisible(false);
      setSelectedRequestId(null);
    }
  };

  const handleDeleteClose = () => {
    setDeleteModalVisible(false);
    setSelectedRequestId(null);
  };

  const handleDeleteUpdate = async () => {
    if (selectedRequestId) {
      setDeleteModalVisible(false);
      // Do the same thing as Complete Request - resume the application
      await handleCompleteRequest(selectedRequestId);
      setSelectedRequestId(null);
    }
  };

  const handleViewRequest = (submissionId: string) => {
    navigation.navigate('LoanStatus', { submissionId });
  };

  const handleCompleteRequest = async (submissionId: string) => {
    try {
      // Get product slug and status from submission
      const submission = submissions.find(s => s.submission_id === submissionId);
      const slug = submission?.product_slug || 'cash-credit';
      const status = submission?.status;

      console.log('📋 Resuming application for submission:', submissionId, 'Status:', status);

      // Check if status is pending_otp_verification - call OTP API then navigate to OTP screen
      if (status === 'pending_otp_verification' && slug === 'buy-inputs') {
        console.log('🔐 Requesting OTP for verification');
        
        try {
          if (!farmer?.attributes?.phone_number) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Phone number not found. Please contact support.',
            });
            return;
          }

          const payload = {
            data: {
              attributes: {
                phone_number: farmer.attributes.phone_number,
                email: farmer?.attributes?.email,
                skip_count_check: true,
                flow: 'BUY_INPUT_OTP',
              },
            },
          };

          console.log('📤 Requesting OTP for:', farmer.attributes.phone_number);
          await axiosPublic.post('/users/request_otp', payload);
          
          console.log('✅ OTP requested successfully, navigating to verification screen');
          navigation.navigate('LoanRequestOTPVerification', {
            productSubmissionId: submissionId,
            otpFlow: 'BUY_INPUT_OTP',
          });
          return;
        } catch (err: any) {
          console.log('❌ request_otp error', err);
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
          return;
        }
      }

      // For sell-harvest product, navigate to LogHarvestDetails to continue
      if (slug === 'sell-harvest') {
        navigation.navigate('LogHarvestDetails', {
          submissionId,
          fromDashboard: true,
        });
        return;
      }

      // For buy-inputs product, navigate directly to the latest incomplete/in-progress step
      if (slug === 'buy-inputs') {
        try {
          // Fetch full submission data with step details
          const submissionResponse = await submissionsService.getSubmissionResume(submissionId);
          const submissionData = submissionResponse?.data;
          const productConfig = submissionData?.attributes?.product_configuration;
          
          if (productConfig?.steps && Array.isArray(productConfig.steps)) {
            const steps = productConfig.steps;
            
            // Find first step that is not completed (in_progress, not_started, or null status)
            const firstIncompleteStep = steps.find((step: any) => 
              step.status !== 'completed'
            );
            
            if (firstIncompleteStep) {
              console.log('🎯 Navigating directly to incomplete step:', firstIncompleteStep.identifier);
              
              // Map step identifiers to screen names for buy-inputs
              const buyInputsScreenMap: { [key: string]: string } = {
                government_verified_provider: 'GovernmentVerifiedBuyers',
                input_purchase_details: 'InputPurchase',
                cart_summary: 'CartSummary',
                checkout: 'Checkout',
                loan_agreement: 'SaleAgreementPreview',
                authentication: 'Authentication',
              };
              
              const screenName = buyInputsScreenMap[firstIncompleteStep.identifier];
              
              // Extract providerId from step 1 if navigating to steps 2-4
              let providerId: string | undefined;
              let providerName: string | undefined;
              
              if (screenName && screenName !== 'GovernmentVerifiedBuyers') {
                const step1 = steps.find((s: any) => s.identifier === 'government_verified_provider');
                if (step1?.sections && Array.isArray(step1.sections)) {
                  const section = step1.sections[0];
                  if (section?.fields && Array.isArray(section.fields)) {
                    const providerIdField = section.fields.find(
                      (f: any) => f.field_key === 'provider_id' || f.field_key === 'selected_provider_id'
                    );
                    const providerNameField = section.fields.find(
                      (f: any) => f.field_key === 'provider_name'
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
              
              if (screenName) {
                // Navigate directly to the screen
                if (screenName === 'GovernmentVerifiedBuyers') {
                  navigation.navigate(screenName, {
                    fsaStep: firstIncompleteStep,
                    fsaSteps: steps,
                    productSlug: slug,
                    submissionId,
                    fromDashboard: true,
                  });
                } else if (screenName === 'SaleAgreementPreview') {
                  // Step 6: Loan Agreement / Sale Agreement Preview
                  // Extract payment context from checkout step for harvest crop filtering (needed when going back)
                  let salePaymentType: string | undefined;
                  let saleHarvestDetailIds: string[] = [];

                  const saleCheckoutStep = steps.find((s: any) => s.identifier === 'checkout');
                  if (saleCheckoutStep?.sections) {
                    for (const section of saleCheckoutStep.sections) {
                      const paymentField = section.fields?.find(
                        (f: any) => f.field_key === 'payment_method',
                      );
                      if (paymentField?.value) {
                        if (paymentField.value === 'provider_credit') {
                          salePaymentType = 'provider_credit';
                        } else {
                          salePaymentType = 'transaction_program';
                          try {
                            const progResponse = await axiosFinancingPrivate.get(
                              '/farmers/transactions/programs',
                            );
                            const allPrograms = progResponse.data?.data || progResponse.data || [];
                            const selectedProgram = allPrograms.find(
                              (p: any) => p.id === paymentField.value,
                            );
                            if (selectedProgram?.harvest_detail_ids) {
                              saleHarvestDetailIds = selectedProgram.harvest_detail_ids;
                            }
                          } catch (progError) {
                            console.log('⚠️ Could not fetch programs for harvest filtering:', progError);
                          }
                        }
                        break;
                      }
                    }
                  }

                  navigation.navigate(screenName, {
                    fsaSteps: steps,
                    productSubmissionId: submissionId,
                    productSlug: slug,
                    fromDashboard: true,
                    paymentType: salePaymentType,
                    harvestDetailIds: saleHarvestDetailIds,
                  });
                } else if (screenName === 'Authentication') {
                  // Step 7: Authentication
                  // Extract payment context from checkout step for harvest crop filtering
                  let authPaymentType: string | undefined;
                  let authHarvestDetailIds: string[] = [];

                  const authCheckoutStep = steps.find((s: any) => s.identifier === 'checkout');
                  if (authCheckoutStep?.sections) {
                    for (const section of authCheckoutStep.sections) {
                      const paymentField = section.fields?.find(
                        (f: any) => f.field_key === 'payment_method',
                      );
                      if (paymentField?.value) {
                        if (paymentField.value === 'provider_credit') {
                          authPaymentType = 'provider_credit';
                        } else {
                          authPaymentType = 'transaction_program';
                          try {
                            const progResponse = await axiosFinancingPrivate.get(
                              '/farmers/transactions/programs',
                            );
                            const allPrograms = progResponse.data?.data || progResponse.data || [];
                            const selectedProgram = allPrograms.find(
                              (p: any) => p.id === paymentField.value,
                            );
                            if (selectedProgram?.harvest_detail_ids) {
                              authHarvestDetailIds = selectedProgram.harvest_detail_ids;
                            }
                          } catch (progError) {
                            console.log('⚠️ Could not fetch programs for harvest filtering:', progError);
                          }
                        }
                        break;
                      }
                    }
                  }

                  navigation.navigate(screenName, {
                    fsaSteps: steps,
                    productSubmissionId: submissionId,
                    productSlug: slug,
                    fromDashboard: true,
                    paymentType: authPaymentType,
                    harvestDetailIds: authHarvestDetailIds,
                  });
                } else {
                  // Steps 2-4: InputPurchase, CartSummary, Checkout
                  navigation.navigate(screenName, {
                    step: firstIncompleteStep,
                    steps: steps,
                    productSlug: slug,
                    submissionId,
                    providerId,
                    providerName,
                    fromDashboard: true,
                  });
                }
                return;
              } else {
                // For unmapped steps (like step 5: harvest_details), use DynamicLoanApplication
                const stepIndex = steps.findIndex((s: any) => s.step_id === firstIncompleteStep.step_id);

                // Extract payment context from checkout step for harvest crop filtering
                let paymentType: string | undefined;
                let harvestDetailIds: string[] = [];

                const checkoutStep = steps.find((s: any) => s.identifier === 'checkout');
                if (checkoutStep?.sections) {
                  for (const section of checkoutStep.sections) {
                    const paymentField = section.fields?.find(
                      (f: any) => f.field_key === 'payment_method',
                    );
                    if (paymentField?.value) {
                      if (paymentField.value === 'provider_credit') {
                        paymentType = 'provider_credit';
                      } else {
                        // payment_method is a program ID — fetch harvest_detail_ids
                        paymentType = 'transaction_program';
                        try {
                          const progResponse = await axiosFinancingPrivate.get(
                            '/farmers/transactions/programs',
                          );
                          const allPrograms = progResponse.data?.data || progResponse.data || [];
                          const selectedProgram = allPrograms.find(
                            (p: any) => p.id === paymentField.value,
                          );
                          if (selectedProgram?.harvest_detail_ids) {
                            harvestDetailIds = selectedProgram.harvest_detail_ids;
                          }
                        } catch (progError) {
                          console.log('⚠️ Could not fetch programs for harvest filtering:', progError);
                        }
                      }
                      break;
                    }
                  }
                }

                navigation.navigate('DynamicLoanApplication', {
                  slug,
                  initialStepIndex: stepIndex >= 0 ? stepIndex : 0,
                  submissionId,
                  fromDashboard: true,
                  paymentType,
                  harvestDetailIds,
                });
                return;
              }
            }
          }
        } catch (error) {
          console.log('Error fetching submission details, falling back to BankApplication:', error);
        }
      }

      // Default behavior: Navigate to BankApplication (stepper screen) which will:
      // 1. Fetch submission data with step statuses from /submissions/:id
      // 2. Display stepper with completed steps marked
      // 3. Show next incomplete step with Continue button
      navigation.navigate('BankApplication', {
        slug,
        submissionId,
        fromDashboard: true,
      });
    } catch (error: any) {
      console.log('Error resuming application:', error);
      // Don't show toast if error was already handled globally (e.g., 401 session timeout)
      // The user will be redirected to login screen by the axios interceptor
      if (!(error as any).__handledGlobally) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.error || 'Failed to load application. Please try again.',
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <UITypography variant="semiBold" style={styles.title}>
        Active Requests
      </UITypography>
      {displayRequests.map((request) => (
        <ActiveRequestCard
          key={request.id}
          status={request.status}
          loanAmount={request.loanAmount}
          loanDuration={request.loanDuration}
          loanType={request.loanType}
          farmNumber={request.farmNumber}
          loanTypeLabel={request.loanTypeLabel}
          farmNumberLabel={request.farmNumberLabel}
          rejectionNote={request.rejectionNote}
          onComplete={() => handleCompleteRequest(request.id)}
          onDelete={() => handleDeleteClick(request.id)}
          onViewRequest={() => handleViewRequest(request.id)}
        />
      ))}
      <LoanApplicationDeleteModal
        visible={deleteModalVisible}
        onClose={handleDeleteClose}
        onSkip={handleDeleteUpdate}
        onProceed={handleDeleteProceed}
      />
    </View>
  );
});

ActiveRequestsSection.displayName = 'ActiveRequestsSection';

export default ActiveRequestsSection;

