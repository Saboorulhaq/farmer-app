import { axiosPrivate, axiosPublic } from '@/config/axios';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from 'toastify-react-native';

export type FarmerDetails = {
  name: string;
  ghanaCardNumber: string;
  phoneNumber: string;
  email?: string;
  residentialAddress?: string;
};

export type FarmDetails = {
  ownsFarm: string;
  primaryCrop: string;
  secondaryCrop: string | null;
  farmSize: string;
  farmSizeUnit: string;
  ghanaPostGPS: string;
  addressLine: string;
  // interestedServices: string[];
  agreedToTerms: boolean;
};

type AgentFarmerRegisterContextType = {
  farmerDetails: FarmerDetails;
  setFarmerDetails: (data: Partial<FarmerDetails>) => void;

  farmDetails: FarmDetails;
  setFarmDetails: (data: Partial<FarmDetails>) => void;

  submitting: boolean;
  submitRegistration: () => Promise<void>;
  resetAll: () => void;
  startFarmerRegistration: (data: FarmerDetails) => Promise<void>;
  completeFarmerOnboarding: () => Promise<void>;
};

const AgentFarmerRegisterContext = createContext<
  AgentFarmerRegisterContextType | undefined
>(undefined);

export const useAgentFarmerRegister = () => {
  const ctx = useContext(AgentFarmerRegisterContext);
  if (!ctx)
    throw new Error('useAgentFarmerRegister must be used within Provider');
  return ctx;
};

export const AgentFarmerRegisterProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [farmerDetails, setFarmerDetailsState] = useState<FarmerDetails>({
    name: '',
    ghanaCardNumber: '',
    phoneNumber: '',
    email: '',
    residentialAddress: '',
  });

  const [farmDetails, setFarmDetailsState] = useState<FarmDetails>({
    ownsFarm: '',
    primaryCrop: '',
    secondaryCrop: '',
    farmSize: '',
    farmSizeUnit: '',
    ghanaPostGPS: '',
    addressLine: '',
    agreedToTerms: false,
  });
  const { frontBase64, backBase64, cardDetails } = useFarmerIdCardStore();
  const [submitting, setSubmitting] = useState(false);

  const setFarmerDetails = (data: Partial<FarmerDetails>) =>
    setFarmerDetailsState(prev => ({ ...prev, ...data }));

  const setFarmDetails = useCallback((data: Partial<FarmDetails>) => {
    setFarmDetailsState(prev => {
      const entries = Object.entries(data) as Array<[
        keyof FarmDetails,
        FarmDetails[keyof FarmDetails]
      ]>;
      const hasChanges = entries.some(([key, value]) => prev[key] !== value);

      if (!hasChanges) {
        return prev;
      }

      return { ...prev, ...data };
    });
  }, []);

  //Register Farmer
  // --- inside AgentFarmerRegisterProvider ---

  const startFarmerRegistration = useCallback(async (data: FarmerDetails) => {
    try {
      setSubmitting(true);
      const attributes: any = {
        ghana_card_number: data.ghanaCardNumber,
        phone_number: data.phoneNumber,
      };
      
      // Always include email if it has a value
      if (data.email && typeof data.email === 'string') {
        const emailValue = data.email.trim();
        if (emailValue.length > 0) {
          attributes.email = emailValue;
        }
      }
      
      const payload = {
        data: {
          attributes,
        },
      };
      const response = await axiosPrivate.post('/users/check_status', payload);

      const {
        data: {
          attributes: { user_exists },
        },
      } = response.data;
      if (user_exists) {
        const backendStatusMessage =
          response?.data?.data?.message ||
          response?.data?.meta?.message ||
          'User found';

        // Check which field is duplicate by making separate API calls
        let phoneNumberExists = false;
        let ghanaCardExists = false;
        let emailExists = false;
        
        try {
          // Check if phone number exists
          const phoneCheckResponse = await axiosPrivate.post(
            '/users/check_status',
            {
              data: {
                attributes: {
                  phone_number: data.phoneNumber,
                },
              },
            },
          );
          phoneNumberExists = phoneCheckResponse.data?.data?.attributes?.user_exists || false;
        } catch (err) {
          // If check fails, assume it might exist
          console.log('Phone number check failed:', err);
        }
        
        try {
          // Check if Ghana Card exists
          const ghanaCardCheckResponse = await axiosPrivate.post(
            '/users/check_status',
            {
              data: {
                attributes: {
                  ghana_card_number: data.ghanaCardNumber,
                },
              },
            },
          );
          ghanaCardExists = ghanaCardCheckResponse.data?.data?.attributes?.user_exists || false;
        } catch (err) {
          // If check fails, assume it might exist
          console.log('Ghana Card check failed:', err);
        }
        
        // Check if email exists (if provided)
        if (data.email && data.email.trim() !== '') {
          try {
            const emailCheckResponse = await axiosPrivate.post(
              '/users/check_status',
              {
                data: {
                  attributes: {
                    email: data.email.trim(),
                  },
                },
              },
            );
            emailExists = emailCheckResponse.data?.data?.attributes?.user_exists || false;
          } catch (err) {
            // If check fails, assume it might exist
            console.log('Email check failed:', err);
          }
        }
        
        // Determine which field is duplicate and show specific error message
        let errorMessage = 'The user already exists.';
        
        // Single field duplicate
        if (phoneNumberExists && !ghanaCardExists && !emailExists) {
          errorMessage = 'This mobile number is already registered.';
        } else if (ghanaCardExists && !phoneNumberExists && !emailExists) {
          errorMessage = 'This NADRA ID is already registered.';
        } else if (emailExists && !phoneNumberExists && !ghanaCardExists) {
          errorMessage = 'This email address is already registered.';
        }
        // Two fields duplicate
        else if (phoneNumberExists && ghanaCardExists && !emailExists) {
          errorMessage = 'A user with this NADRA ID and mobile number already exists.';
        } else if (phoneNumberExists && emailExists && !ghanaCardExists) {
          errorMessage = 'A user with this mobile number and email already exists.';
        } else if (ghanaCardExists && emailExists && !phoneNumberExists) {
          errorMessage = 'A user with this NADRA ID and email already exists.';
        }
        // All three fields duplicate
        else if (phoneNumberExists && ghanaCardExists && emailExists) {
          errorMessage = 'A user with this NADRA ID, mobile number, and email already exists.';
        }

        Toast.show({
          type: 'error',
          text1: backendStatusMessage,
          text2: errorMessage,
        });

        const duplicateError = new Error(errorMessage) as Error & {
          __handledWithToast?: boolean;
        };
        duplicateError.__handledWithToast = true;
        throw duplicateError;
      } else {
        setFarmerDetailsState(prev => ({
          ...prev,
          ...data,
        }));
      }
    } catch (error: any) {
      if (error?.response?.data?.fields?.length) {
        // Check for phone number field error specifically
        const phoneFieldError = error.response.data.fields.find(
          (field: any) => field.field === 'phone_number' || field.field_key === 'phone_number'
        );
        if (phoneFieldError) {
          throw new Error(
            phoneFieldError.short_error || phoneFieldError.message || 'This mobile number is already registered.',
          );
        }
        
        // Check for ghana card field error
        const ghanaCardFieldError = error.response.data.fields.find(
          (field: any) => field.field === 'ghana_card_number' || field.field_key === 'ghana_card_number'
        );
        if (ghanaCardFieldError) {
          throw new Error(
            ghanaCardFieldError.short_error || ghanaCardFieldError.message || 'This NADRA ID is already registered.',
          );
        }
        
        // Fallback to first field error
        const firstFieldError = error.response.data.fields[0];
        throw new Error(
          firstFieldError.short_error || 'Validation error occurred',
        );
      }

      // Check error message for phone/mobile number keywords
      const apiMessage =
        error?.response?.data?.meta?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      
      const lowerMessage = apiMessage.toLowerCase();
      if (lowerMessage.includes('phone') || lowerMessage.includes('mobile')) {
        throw new Error('This mobile number is already registered.');
      }

      throw new Error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  }, []);
  const completeFarmerOnboarding = async () => {
    try {
      setSubmitting(true);
      const _payload = {
        basic_details: {
          ghana_card_number: farmerDetails.ghanaCardNumber,
          name: farmerDetails.name,
          phone_number: farmerDetails.phoneNumber,
          email: farmerDetails.email,
          ...(farmerDetails.residentialAddress &&
          farmerDetails.residentialAddress.trim() !== '' && {
            residential_address: farmerDetails.residentialAddress,
          }),
        },
        primary_role: 'farmer',
        registration_mode: 'agent',
        card_detected: !!cardDetails,
        details_changed: false,
        source_flow: 'agent_onboarding',
        card_details: {
          country_code: cardDetails?.document_info.country_code,
          issue_date:
            cardDetails?.issue_date || cardDetails?.document_info.date_of_issue,
          expiry_date:
            cardDetails?.expiry_date ||
            cardDetails?.document_info.date_of_expiry,
          date_of_birth: cardDetails?.personal_info.date_of_birth,
          first_name: cardDetails?.personal_info.first_name,
          full_name: cardDetails?.personal_info.full_name,
          full_name_native:
            cardDetails?.full_name_native ||
            cardDetails?.personal_info.full_name_native,
          parent_or_spouse_name:
            cardDetails?.parent_or_spouse_name ||
            cardDetails?.personal_info.father_or_husband_name,
          parent_or_spouse_name_native:
            cardDetails?.parent_or_spouse_name_native ||
            cardDetails?.personal_info.father_or_husband_name_native,
          nationality: cardDetails?.personal_info.nationality,
          other_names: cardDetails?.personal_info.other_names,
          sex: cardDetails?.personal_info.sex,
          surname: cardDetails?.personal_info.surname,
          present_address_native: cardDetails?.present_address_native,
          present_address_romanized: cardDetails?.present_address_romanized,
          permanent_address_native: cardDetails?.permanent_address_native,
          permanent_address_romanized: cardDetails?.permanent_address_romanized,
          document_number: cardDetails?.document_info.document_number,
          document_type: cardDetails?.document_info.document_type,
          raw_mrz: cardDetails?.raw_mrz,
          front_image: frontBase64,
          back_image: backBase64,
        },
        farm_details: {
          ownsFarm: farmDetails.ownsFarm,
          primaryCrops: farmDetails.primaryCrop,
          secondaryCrops: farmDetails.secondaryCrop,
          farmSize: farmDetails.farmSize,
          farmSizeUnit: farmDetails.farmSizeUnit,
          ...(farmDetails.ghanaPostGPS && farmDetails.ghanaPostGPS.trim() !== '' && { gpsNumber: farmDetails.ghanaPostGPS }),
          ...(farmDetails.addressLine && farmDetails.addressLine.trim() !== '' && { address: farmDetails.addressLine }),
        },
      };

      await axiosPrivate.post(`/agents/farmers/complete_registration`, {
        data: { attributes: _payload },
      });
      resetAll();
    } catch (error: any) {
      if (error?.response?.data?.fields?.length) {
        const firstFieldError = error.response.data.fields[0];
        throw new Error(
          firstFieldError.short_error || 'Validation error occurred',
        );
      }

      const apiMessage =
        error?.response?.data?.meta?.message ||
        error?.message ||
        'Something went wrong. Please try again.';

      throw new Error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Submit registration ---
  const submitRegistration = useCallback(async () => {
    try {
      setSubmitting(true);
      await axiosPublic.post('/agent/farmers/register', {
        farmer: farmerDetails,
        farm: farmDetails,
      });
    } catch (error) {
      console.warn('Registration submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  }, [farmerDetails, farmDetails]);

  const resetAll = useCallback(() => {
    setFarmerDetailsState({
      name: '',
      ghanaCardNumber: '',
      phoneNumber: '',
      email: '',
      residentialAddress: '',
    });
    setFarmDetailsState({
      ownsFarm: '',
      primaryCrop: '',
      secondaryCrop: '',
      farmSize: '',
      farmSizeUnit: 'acres',
      ghanaPostGPS: '',
      addressLine: '',
      agreedToTerms: false,
    });
  }, []);

  return (
    <AgentFarmerRegisterContext.Provider
      value={{
        farmerDetails,
        setFarmerDetails,
        farmDetails,
        setFarmDetails,
        submitting,
        submitRegistration,
        resetAll,
        startFarmerRegistration,
        completeFarmerOnboarding,
      }}
    >
      {children}
    </AgentFarmerRegisterContext.Provider>
  );
};
