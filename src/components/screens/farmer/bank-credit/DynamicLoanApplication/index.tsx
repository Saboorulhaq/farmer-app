import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { ProductSteps } from '@/components/screens/farmer/bank-credit/product_steps';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosPublic } from '@/config/axios';
import { Toast } from 'toastify-react-native';

export default function DynamicLoanApplication() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmer } = useFarmer();

  // Get slug from route params, default to 'cash-credit'
  const slug = route.params?.slug || 'cash-credit';
  
  // Get resume data and submissionId from route params (for resuming in-progress applications)
  const resumeData = route.params?.resumeData;
  const submissionId = route.params?.submissionId;
  
  // Get initialStepIndex from route params (for editing specific steps)
  const initialStepIndex = route.params?.initialStepIndex ?? 0;
  
  // Get FSA completion status from route params (when returning from FSA flow)
  const returnFromFsa = route.params?.returnFromFsa || false;
  const fsaCompletedFromRoute = route.params?.fsaCompleted || false;
  
  const fromDashboard = route.params?.fromDashboard || false;
  
  // Get payment context from checkout screen (for harvest crop filtering)
  const paymentType = route.params?.paymentType; // 'transaction_program' | 'provider_credit'
  const harvestDetailIds = route.params?.harvestDetailIds || [];
  
  // Get edit mode flag from route params (when editing a completed step)
  const isEditMode = route.params?.isEditMode || false;
  
  // Whether the user is coming directly from the Checkout screen
  const fromCheckout = route.params?.fromCheckout || false;

  const handleComplete = (formData: Record<string, any>, submissionId?: string | null) => {
    console.log('Loan application completed:', formData, 'Submission ID:', submissionId);
    // Navigate to OTP verification or next step
    
    // Call request_otp
    const requestOtp = async () => {
        try {
            if (farmer?.attributes?.phone_number) {
                console.log('📤 Requesting OTP for:', farmer.attributes.phone_number);
                const payload = {
                    data: {
                    attributes: {
                        phone_number: farmer.attributes.phone_number,
                        email: farmer?.attributes?.email,
                        skip_count_check: true,
                        flow: 'LOAN_REQUEST_OTP',
                    },
                    },
                };
                await axiosPublic.post('/users/request_otp', payload);
            }
             navigation.navigate('LoanRequestOTPVerification', {
                productSubmissionId: submissionId,
                otpFlow: 'LOAN_REQUEST_OTP',
             });
        } catch (error: any) {
             console.log('request_otp error', error);
             const errMsg = error?.response?.data?.error || 'Failed to request OTP';
             Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errMsg,
             });
        }
    }
    
    requestOtp();
  };

  return (
    <ProductSteps
      slug={slug}
      onComplete={handleComplete}
      initialStepIndex={initialStepIndex}
      resumeData={resumeData}
      submissionId={submissionId}
      initialFsaCompleted={returnFromFsa ? fsaCompletedFromRoute : undefined}
      fromDashboard={fromDashboard}
      isEditMode={isEditMode}
      paymentType={paymentType}
      harvestDetailIds={harvestDetailIds}
      fromCheckout={fromCheckout}
    />
  );
}
