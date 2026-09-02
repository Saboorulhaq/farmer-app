import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Alert,
  Platform,
  Keyboard,
  BackHandler,
  findNodeHandle,
  UIManager,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PagerView from 'react-native-pager-view';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import { UIContainedButton, UISteps, UICheckbox, UITypography } from '@/components/ui';
import {
  useProductsStore,
  type ProductConfigurationStep,
} from '@/store/useProductsStore';
import ProductSection from './product_section';
import { axiosFinancingPrivate } from '@/config/axios';
import FsaLinkInfoModal from '@/components/screens/farmer/bank-credit/components/FsaLinkInfoModal';
import { useDebugStore } from '@/store/useDebugStore';
import { DEBUG_BANK_CREDIT_VALUES } from '@/constants/testing/bankCreditDebugData';

type FormValues = Record<string, any>;

interface ProductStepsProps {
  slug: string;
  onComplete?: (formData: FormValues, submissionId?: string | null) => void;
  initialStepIndex?: number;
  resumeData?: any; // Resume data from API
  submissionId?: string | null; // Submission ID from route params
  initialFsaCompleted?: boolean; // FSA completion status from route params (when returning from FSA flow)
  fromDashboard?: boolean;
  isEditMode?: boolean; // Flag to indicate we're editing a completed step
  paymentType?: string; // 'transaction_program' | 'provider_credit' - from checkout
  harvestDetailIds?: string[]; // Linked harvest detail IDs from selected transaction program
  fromCheckout?: boolean; // Whether the user navigated directly from the Checkout screen
}

const ProductSteps: React.FC<ProductStepsProps> = ({
  slug,
  onComplete,
  initialStepIndex = 0,
  resumeData,
  submissionId: routeSubmissionId,
  initialFsaCompleted,
  fromDashboard = false,
  isEditMode = false,
  paymentType,
  harvestDetailIds = [],
  fromCheckout = false,
}) => {
  const navigation = useNavigation<any>();
  const { top, bottom } = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRefs = useRef<Map<number, KeyboardAwareScrollView | null>>(
    new Map(),
  );
  const fieldRefs = useRef<Map<string, View | null>>(new Map());
  const debugPrefilledRef = useRef(false);

  // Store
  const {
    config,
    configLoading,
    fetchProductConfig,
    submissionId: storeSubmissionId,
    setSubmissionId: setStoreSubmissionId,
  } = useProductsStore();
  const isDebugMode = useDebugStore(state => state.isDebugMode);

  // Local state
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingStep, setIsValidatingStep] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fsaModalVisible, setFsaModalVisible] = useState(false);
  const [fsaCompleted, setFsaCompleted] = useState(
    initialFsaCompleted || false,
  );

  // Register field ref callback
  const registerFieldRef = useCallback((fieldKey: string, ref: View | null) => {
    if (ref) {
      fieldRefs.current.set(fieldKey, ref);
    } else {
      fieldRefs.current.delete(fieldKey);
    }
  }, []);

  // Callback to scroll to a field when it's focused (for conditionally rendered fields)
  const scrollToField = useCallback(
    (fieldRef: View | null) => {
      if (!fieldRef) return;

      const scrollViewRef = scrollViewRefs.current.get(currentStepIndex);
      if (!scrollViewRef) return;

      // Use a delay to ensure the field is fully rendered
      setTimeout(() => {
        try {
          const fieldNodeHandle = findNodeHandle(fieldRef);
          const scrollNodeHandle = findNodeHandle(scrollViewRef as any);

          if (fieldNodeHandle && scrollNodeHandle && UIManager.measureLayout) {
            UIManager.measureLayout(
              fieldNodeHandle,
              scrollNodeHandle,
              () => {
                console.log('Error measuring layout for scroll to field');
              },
              (relX, relY, relWidth, relHeight) => {
                // Scroll to the field position with offset from top
                const scrollResponder = (
                  scrollViewRef as any
                ).getScrollResponder?.();

                if (scrollResponder && scrollResponder.scrollTo) {
                  scrollResponder.scrollTo({
                    x: 0,
                    y: Math.max(0, relY - 150), // Extra offset for keyboard
                    animated: true,
                  });
                } else if ((scrollViewRef as any).scrollTo) {
                  (scrollViewRef as any).scrollTo({
                    x: 0,
                    y: Math.max(0, relY - 150),
                    animated: true,
                  });
                } else if ((scrollViewRef as any).scrollToFocusedInput) {
                  // Use KeyboardAwareScrollView's built-in method
                  (scrollViewRef as any).scrollToFocusedInput(fieldRef);
                }
              },
            );
          } else {
            // Fallback: try to use scrollToFocusedInput if available
            if ((scrollViewRef as any).scrollToFocusedInput) {
              (scrollViewRef as any).scrollToFocusedInput(fieldRef);
            }
          }
        } catch (error) {
          console.log('Error scrolling to field:', error);
        }
      }, 300);
    },
    [currentStepIndex],
  );

  // Callback to receive submission_id from first field submission
  const handleSubmissionIdReceived = useCallback(
    (id: string) => {
      console.log('📝 Received submission_id:', id);
      setSubmissionId(id);
      // Also store it in the global store so BankApplication can access it
      setStoreSubmissionId(id);
    },
    [setStoreSubmissionId],
  );

  // Fetch config on mount
  useEffect(() => {
    if (slug) {
      fetchProductConfig(slug);
    }
  }, [slug, fetchProductConfig]);

  // Debug Mode: once the config is available, prefill every step with valid
  // hardcoded values so the user can just keep pressing Next (no API calls).
  useEffect(() => {
    if (
      isDebugMode &&
      slug === 'bank-credit-facility' &&
      config &&
      !debugPrefilledRef.current
    ) {
      debugPrefilledRef.current = true;
      setFormValues(prev => ({ ...DEBUG_BANK_CREDIT_VALUES, ...prev }));
    }
  }, [isDebugMode, slug, config]);

  // Merge resume data's product_configuration with fetched config
  useEffect(() => {
    if (!resumeData || !config) return;

    const productConfig = resumeData.attributes?.product_configuration;
    if (!productConfig) return;

    console.log('🔄 Merging resume product_configuration with config');

    // Update config with resume data's product_configuration
    // This ensures we have the latest field values from the resume data
    const updatedConfig = {
      ...config,
      attributes: {
        ...config.attributes,
        steps: productConfig.steps || config.attributes.steps,
        fsa_steps: productConfig.fsa_steps || config.attributes.fsa_steps,
      },
    };

    // Update the store's config (we'll need to add a method for this or use local state)
    // For now, we'll work with the merged config locally
    // The form values restoration will handle the field values
  }, [resumeData, config]);

  // Sync submissionId from store to local state when available
  useEffect(() => {
    if (storeSubmissionId && !submissionId) {
      console.log('🔄 Syncing submissionId from store:', storeSubmissionId);
      setSubmissionId(storeSubmissionId);
    }
  }, [storeSubmissionId, submissionId]);

  // Set submissionId from route params if provided (for resume)
  useEffect(() => {
    if (routeSubmissionId && !submissionId) {
      console.log(
        '🔄 Setting submissionId from route params:',
        routeSubmissionId,
      );
      setSubmissionId(routeSubmissionId);
    }
  }, [routeSubmissionId, submissionId]);

  // Fetch submission data when returning from FSA flow (to restore form values)
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (isDebugMode) return; // Debug Mode: never hit the submissions API.
      // Only fetch if we have submissionId (from route or state), no resumeData, and we're returning from FSA
      const currentSubmissionId = submissionId || routeSubmissionId;
      if (
        !initialFsaCompleted ||
        !currentSubmissionId ||
        resumeData ||
        !config
      ) {
        return;
      }

      try {
        console.log(
          '🔄 Fetching submission data to restore form values after FSA completion',
        );
        const response = await axiosFinancingPrivate.get(
          `/submissions/${currentSubmissionId}`,
        );
        const submissionData = response.data?.data || response.data;

        if (submissionData) {
          // Extract form values from submission data
          const productConfig =
            submissionData.attributes?.product_configuration;
          if (productConfig) {
            const resumeSteps = productConfig.steps || [];
            const resumeFormValues: FormValues = {};

            // Extract all field values from resume data
            resumeSteps.forEach((resumeStep: any) => {
              resumeStep.sections?.forEach((section: any) => {
                section.fields?.forEach((field: any) => {
                  if (field.value !== undefined && field.value !== null) {
                    resumeFormValues[field.field_key] = field.value;
                  }
                });
              });
            });

            console.log(
              '📋 Restored form values from submission after FSA:',
              resumeFormValues,
            );
            // Merge with existing form values instead of replacing
            // This preserves pre-filled data from external APIs (like /users/me for personal details)
            setFormValues(prevValues => ({
              ...prevValues,
              ...resumeFormValues,
            }));
          }
        }
      } catch (error: any) {
        console.log(
          '❌ Failed to fetch submission data after FSA:',
          error?.response?.data || error?.message,
        );
      }
    };

    fetchSubmissionData();
  }, [
    initialFsaCompleted,
    submissionId,
    routeSubmissionId,
    resumeData,
    config,
    isDebugMode,
  ]);

  // Fetch submission data when navigating back to the screen (to restore form values)
  useEffect(() => {
    const fetchAndRestoreData = async () => {
      if (isDebugMode) return; // Debug Mode: never hit the submissions API.
      // Only fetch if we have submissionId and no resumeData already provided
      const currentSubmissionId = submissionId || routeSubmissionId;
      if (!currentSubmissionId || resumeData || !config) {
        return;
      }

      // Don't fetch if we already have form values populated
      if (Object.keys(formValues).length > 0) {
        console.log('📋 Form values already populated, skipping fetch');
        return;
      }

      try {
        console.log(
          '🔄 Fetching submission data to restore form values on mount',
        );
        const response = await axiosFinancingPrivate.get(
          `/submissions/${currentSubmissionId}`,
        );
        const submissionData = response.data?.data || response.data;

        if (submissionData) {
          // Extract form values from submission data
          const productConfig =
            submissionData.attributes?.product_configuration;
          if (productConfig) {
            const resumeSteps = productConfig.steps || [];
            const resumeFormValues: FormValues = {};

            // Extract all field values from resume data
            resumeSteps.forEach((resumeStep: any) => {
              resumeStep.sections?.forEach((section: any) => {
                section.fields?.forEach((field: any) => {
                  if (field.value !== undefined && field.value !== null) {
                    resumeFormValues[field.field_key] = field.value;
                  }
                });
              });
            });

            console.log(
              '📋 Restored form values from submission on mount:',
              resumeFormValues,
            );
            // For buy-inputs coming directly from Checkout, drop
            // selected_harvest from server draft so stale selections from a
            // previous payment method are never restored. On resume,
            // preserve the saved selection.
            if (slug === 'buy-inputs' && fromCheckout) {
              delete resumeFormValues.selected_harvest;
            }
            // Merge with existing form values instead of replacing
            // This preserves pre-filled data from external APIs (like /users/me for personal details)
            setFormValues(prevValues => ({
              ...prevValues,
              ...resumeFormValues,
            }));
          }
        }
      } catch (error: any) {
        console.log(
          '❌ Failed to fetch submission data on mount:',
          error?.response?.data || error?.message,
        );
      }
    };

    fetchAndRestoreData();
  }, [submissionId, routeSubmissionId, resumeData, config, isDebugMode]);

  // Clear selected_harvest if it is no longer valid under the current payment
  // context. This handles the case where the user went back to Checkout, changed
  // the payment program, and returned here — the server draft still holds the old
  // selection which may now be disabled.
  const prevPaymentTypeRef = useRef(paymentType);
  useEffect(() => {
    if (slug !== 'buy-inputs' || !formValues.selected_harvest) return;

    const paymentChanged = prevPaymentTypeRef.current !== paymentType;
    prevPaymentTypeRef.current = paymentType;

    // When switching to provider_credit, clear any previous harvest selection
    if (paymentChanged && paymentType === 'provider_credit') {
      console.log('🔄 Clearing selected_harvest — switched to provider_credit');
      setFormValues(prev => {
        const next = { ...prev };
        delete next.selected_harvest;
        return next;
      });
      return;
    }

    // For transaction programs, the selected harvest must be in the allowed list
    if (paymentType === 'transaction_program' && harvestDetailIds.length > 0) {
      const currentSelection = Array.isArray(formValues.selected_harvest)
        ? formValues.selected_harvest
        : [formValues.selected_harvest];
      const allValid = currentSelection.every((id: string) =>
        harvestDetailIds.includes(id),
      );
      if (!allValid) {
        console.log('🔄 Clearing selected_harvest — not valid under current payment program');
        setFormValues(prev => {
          const next = { ...prev };
          delete next.selected_harvest;
          return next;
        });
      }
    }
  }, [slug, paymentType, harvestDetailIds, formValues.selected_harvest]);

  // Set fsaCompleted from route params if provided (when returning from FSA flow)
  useEffect(() => {
    if (initialFsaCompleted && !fsaCompleted) {
      console.log(
        '🔄 Setting fsaCompleted from route params:',
        initialFsaCompleted,
      );
      setFsaCompleted(true);
    }
  }, [initialFsaCompleted, fsaCompleted]);

  // Get sorted active steps (merge resume data steps with config steps to preserve all configuration)
  const steps = useMemo(() => {
    if (!config?.attributes?.steps) return [];

    const configSteps = [...config.attributes.steps]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);

    // If we have resume data, merge field values from resume steps into config steps
    if (resumeData?.attributes?.product_configuration?.steps) {
      const resumeSteps = resumeData.attributes.product_configuration.steps;

      // Create a map of resume steps by step_id for quick lookup
      const resumeStepsMap = new Map(
        resumeSteps.map((rs: any) => [rs.step_id || rs.step_number, rs]),
      );

      // Merge resume step data (especially field values) into config steps
      return configSteps.map(configStep => {
        const resumeStep =
          resumeStepsMap.get(configStep.step_id) ||
          (resumeStepsMap.get(configStep.step_number) as any);

        if (!resumeStep) return configStep;

        // Merge sections and fields, preserving config structure but using resume values
        const mergedSections = configStep.sections?.map(configSection => {
          const resumeSection = (resumeStep.sections as any[])?.find(
            (rs: any) => rs.section_id === configSection.section_id,
          );

          if (!resumeSection) return configSection;

          // Merge fields, preserving config structure but using resume field values
          const mergedFields = configSection.fields?.map(configField => {
            const resumeField = (resumeSection.fields as any[])?.find(
              (rf: any) => rf.field_key === configField.field_key,
            );

            if (!resumeField) return configField;

            // Return config field with resume field's value and status
            return {
              ...configField,
              value: resumeField.value,
              // Preserve other resume field properties that might be useful
              ...(resumeField.status && { status: resumeField.status }),
            };
          });

          return {
            ...configSection,
            fields: mergedFields || configSection.fields,
          };
        });

        return {
          ...configStep,
          sections: mergedSections || configStep.sections,
          status: (resumeStep as any).status || configStep.status,
          is_draft:
            (resumeStep as any).is_draft !== undefined
              ? (resumeStep as any).is_draft
              : configStep.is_draft,
        };
      });
    }

    return configSteps;
  }, [config, resumeData]);

  // Scroll to first error field when validation errors occur
  useEffect(() => {
    if (Object.keys(stepErrors).length === 0) return;

    // Get the scroll view for current step
    const scrollViewRef = scrollViewRefs.current.get(currentStepIndex);
    if (!scrollViewRef) return;

    // Find the first field with an error (in order of appearance in the step)
    const currentStep = steps[currentStepIndex];
    if (!currentStep?.sections) return;

    let firstErrorFieldKey: string | null = null;
    for (const section of currentStep.sections) {
      if (!section.fields) continue;
      const sortedFields = [...section.fields]
        .filter(f => f.is_active !== false)
        .sort((a, b) => a.display_order - b.display_order);

      for (const field of sortedFields) {
        if (stepErrors[field.field_key]) {
          firstErrorFieldKey = field.field_key;
          break;
        }
      }
      if (firstErrorFieldKey) break;
    }

    if (!firstErrorFieldKey) return;

    // Get the field ref
    const fieldRef = fieldRefs.current.get(firstErrorFieldKey);
    if (!fieldRef) return;

    // Wait a bit for the UI to update, then scroll
    setTimeout(() => {
      try {
        const fieldNodeHandle = findNodeHandle(fieldRef);
        const scrollNodeHandle = findNodeHandle(scrollViewRef as any);

        if (fieldNodeHandle && scrollNodeHandle && UIManager.measureLayout) {
          // Use measureLayout to get the field's position relative to the scroll view
          UIManager.measureLayout(
            fieldNodeHandle,
            scrollNodeHandle,
            () => {
              console.log('Error measuring layout for scroll to error');
            },
            (relX, relY, relWidth, relHeight) => {
              // Get the scroll responder to access scrollTo method
              const scrollResponder = (
                scrollViewRef as any
              ).getScrollResponder?.();

              if (scrollResponder && scrollResponder.scrollTo) {
                // Scroll to the field position with offset from top (100px)
                scrollResponder.scrollTo({
                  x: 0,
                  y: Math.max(0, relY - 100),
                  animated: true,
                });
              } else if ((scrollViewRef as any).scrollTo) {
                // Direct scrollTo if available
                (scrollViewRef as any).scrollTo({
                  x: 0,
                  y: Math.max(0, relY - 100),
                  animated: true,
                });
              }
            },
          );
        } else {
          // Fallback: try to use scrollToFocusedInput if available
          if ((scrollViewRef as any).scrollToFocusedInput) {
            (scrollViewRef as any).scrollToFocusedInput(fieldRef);
          }
        }
      } catch (error) {
        console.log('Error scrolling to field:', error);
      }
    }, 300);
  }, [stepErrors, currentStepIndex, steps]);

  // Restore form values and navigate to correct step from resume data
  useEffect(() => {
    if (!resumeData || !config?.attributes?.steps) return;

    console.log('🔄 Restoring form from resume data:', resumeData);

    // Set submissionId from resume data if available
    const resumeSubmissionId = resumeData.id || resumeData.attributes?.id;
    if (resumeSubmissionId && !submissionId) {
      console.log(
        '📝 Setting submissionId from resume data:',
        resumeSubmissionId,
      );
      setSubmissionId(resumeSubmissionId);
    }

    const productConfig = resumeData.attributes?.product_configuration;
    if (!productConfig) {
      console.warn('⚠️ No product_configuration found in resume data');
      return;
    }

    const resumeSteps = productConfig.steps || [];
    const resumeFormValues: FormValues = {};

    // Extract all field values from resume data
    resumeSteps.forEach((resumeStep: any) => {
      resumeStep.sections?.forEach((section: any) => {
        section.fields?.forEach((field: any) => {
          if (field.value !== undefined && field.value !== null) {
            resumeFormValues[field.field_key] = field.value;
          }
        });
      });
    });

    // Also extract FSA step values if available
    const fsaSteps = productConfig.fsa_steps || [];
    fsaSteps.forEach((fsaStep: any) => {
      fsaStep.sections?.forEach((section: any) => {
        section.fields?.forEach((field: any) => {
          if (field.value !== undefined && field.value !== null) {
            resumeFormValues[field.field_key] = field.value;
          }
        });
      });
    });

    // Check if all FSA steps are already completed from resume data
    if (fsaSteps.length > 0) {
      const allFsaCompleted = fsaSteps.every(
        (step: any) => step.status === 'completed',
      );
      if (allFsaCompleted) {
        console.log('✅ FSA was already completed in resumed submission');
        setFsaCompleted(true);
      }
    }

    console.log('📋 Restored form values:', resumeFormValues);
    // Merge with existing form values instead of replacing
    // This preserves pre-filled data from external APIs (like /users/me for personal details)
    setFormValues(prevValues => ({
      ...prevValues,
      ...resumeFormValues,
    }));

    // Find the first incomplete step (status is 'in_progress' or null/undefined)
    // If all steps are completed, navigate to the last step
    let targetStepIndex = 0;
    const activeSteps = [...config.attributes.steps]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);

    for (let i = 0; i < activeSteps.length; i++) {
      const step = activeSteps[i];
      const resumeStep = resumeSteps.find(
        (rs: any) =>
          rs.step_id === step.step_id || rs.step_number === step.step_number,
      );

      if (
        !resumeStep ||
        resumeStep.status === 'in_progress' ||
        !resumeStep.status ||
        resumeStep.status === null
      ) {
        targetStepIndex = i;
        break;
      }

      // If this step is completed, check the next one
      if (resumeStep.status === 'completed') {
        // If this is the last step and it's completed, stay on it
        if (i === activeSteps.length - 1) {
          targetStepIndex = i;
        } else {
          // Otherwise, move to next step
          targetStepIndex = i + 1;
        }
      }
    }

    console.log(
      `📍 Navigating to step ${targetStepIndex + 1} (${
        activeSteps[targetStepIndex]?.title
      })`,
    );
    setCurrentStepIndex(targetStepIndex);

    // Update pager view after a short delay to ensure it's rendered
    setTimeout(() => {
      pagerRef.current?.setPage(targetStepIndex);
    }, 100);
  }, [resumeData, config]);

  // Set default values for fields (like facility_type) when config loads
  useEffect(() => {
    if (!config?.attributes?.steps) return;

    // Skip default values if we have resume data (it will be handled by the resume effect)
    if (resumeData) {
      return;
    }

    const defaultValues: FormValues = {};

    // Map product slug to facility_type value
    const getFacilityTypeFromSlug = (
      productSlug: string,
      options?: Array<{ option_value: string }>,
    ): string => {
      // Normalize the slug by converting to lowercase and trimming
      const normalizedSlug = productSlug?.toLowerCase()?.trim();
      // Convert slug from dash-case to snake_case to match option values
      const snakeCaseValue = normalizedSlug?.replace(/-/g, '_');
      // Priority 1: Match the snake_case slug directly against the option values
      const exactMatch = options?.find(
        opt => opt.option_value === snakeCaseValue,
      );
      if (exactMatch) return exactMatch.option_value;
      // Priority 2: Fallback mapping for slugs that don't match option values directly
      const slugMap: Record<string, string> = {
        'cash-credit': 'cash_credit',
        'bank-credit': 'bank_credit_facility',
        'bank-credit-facility': 'bank_credit_facility',
        'input-credit': 'input_credit',
      };
      return slugMap[normalizedSlug] || '';
    };

    config.attributes.steps.forEach(step => {
      step.sections?.forEach(section => {
        section.fields?.forEach(field => {
          // Priority 1: Use previously submitted value if available (for edit mode)
          if (field.value !== undefined && field.value !== null) {
            defaultValues[field.field_key] = field.value;
          }
          // Priority 2: Set default value for facility_type based on product slug
          else if (field.field_key === 'facility_type') {
            const productSlug = config.attributes.slug || slug;
            const facilityTypeValue = getFacilityTypeFromSlug(
              productSlug,
              field.options,
            );

            // Check if this value exists in the field options
            const optionExists = field.options?.some(
              opt => opt.option_value === facilityTypeValue,
            );

            if (optionExists) {
              defaultValues[field.field_key] = facilityTypeValue;
            } else if (field.options && field.options.length > 0) {
              // Fallback to first option if mapped value doesn't exist
              defaultValues[field.field_key] = field.options[0].option_value;
            }
          }
          // Priority 3: Set other default values from field_config if available
          else if (field.field_config?.default_value !== undefined) {
            defaultValues[field.field_key] = field.field_config.default_value;
          }
          // Priority 4: For slider fields, if no default is provided, use min value (or 0)
          // This ensures the slider has a valid starting value matching the UI
          else if (field.field_type === 'slider') {
            defaultValues[field.field_key] = field.field_config?.min || 0;
          }
        });
      });
    });

    setFormValues(prev => ({ ...defaultValues, ...prev }));
  }, [config, slug]);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  // Handle field change
  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  }, []);

  // Helper function to check if any borrowing detail field has a value
  const hasAnyBorrowingDetailValue = (formValues: FormValues): boolean => {
    const borrowingDetailFields = [
      'lender',
      'borrowing_facility_type',
      'outstanding_amount',
      'outstanding_currency',
    ];
    return borrowingDetailFields.some(fieldKey => {
      const fieldValue = formValues[fieldKey];
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === ''
      ) {
        return false;
      }
      // For number fields, check if value is greater than 0
      if (typeof fieldValue === 'string') {
        const numValue = parseFloat(fieldValue);
        if (!isNaN(numValue)) {
          return numValue > 0;
        }
      }
      return true;
    });
  };

  // Callback to handle field error changes from ProductSection
  const handleFieldErrorChange = useCallback(
    (fieldKey: string, error: string | null) => {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldKey] = error;
          console.log(`⚠️ Field error set for ${fieldKey}:`, error);
        } else {
          delete newErrors[fieldKey];
          console.log(`✅ Field error cleared for ${fieldKey}`);
        }
        console.log('📊 Current fieldErrors:', newErrors);
        return newErrors;
      });
    },
    [],
  );

  // Validate current step
  const isCurrentStepValid = useMemo((): boolean => {
    if (!currentStep?.sections) return true;

    // First check if there are any field validation errors for the current step
    const currentStepFieldKeys = new Set<string>();
    currentStep.sections?.forEach(section => {
      section.fields?.forEach(field => {
        if (field.is_active !== false) {
          currentStepFieldKeys.add(field.field_key);
        }
      });
    });

    // Check if any borrowing detail field has a value
    const hasAnyBorrowingValue = hasAnyBorrowingDetailValue(formValues);

    for (const section of currentStep.sections) {
      if (!section.fields) continue;

      // Check if section is marked as optional (either by title containing "(Optional)" or identifier)
      const isSectionOptional =
        section.title?.toLowerCase().includes('(optional)') ||
        section.identifier === 'supporting_documents';

      for (const field of section.fields) {
        // Check if field is required (either always or conditionally)
        // Treat fields as required when validation_rules.presence is true, even if is_required flag is false
        let isFieldRequired =
          !!field.is_active &&
          (field.is_required === true ||
            field.validation_rules?.presence === true);

        // Handle conditional requirement (required_if)
        if (field.conditional_logic?.required_if) {
          const { field_key, operator } = field.conditional_logic.required_if;
          const conditionValue = formValues[field_key];

          // Only make this field required if the condition is met
          if (operator === 'present') {
            isFieldRequired =
              conditionValue !== undefined &&
              conditionValue !== null &&
              conditionValue !== '';
          } else if (operator === 'blank') {
            // Field is required if the condition field is blank (empty)
            isFieldRequired =
              conditionValue === undefined ||
              conditionValue === null ||
              conditionValue === '' ||
              (typeof conditionValue === 'string' && conditionValue.trim() === '');
          }
        }

        // Special validation for borrowing details: if any field has a value, all are required
        const borrowingDetailFields = [
          'lender',
          'borrowing_facility_type',
          'outstanding_amount',
          'outstanding_currency',
        ];
        const isBorrowingDetailField = borrowingDetailFields.includes(
          field.field_key,
        );
        if (isBorrowingDetailField && hasAnyBorrowingValue) {
          isFieldRequired = true;
        }

        // If the section is optional, override all field requirements to make all fields optional
        // This check comes last so it takes precedence over individual field requirements and conditional requirements
        if (isSectionOptional) {
          isFieldRequired = false;
        }

        // Check if field has a validation error in fieldErrors
        // Must be checked BEFORE skipping non-required fields so XOR errors (e.g. GPS/Address) always block
        if (field.is_active !== false && fieldErrors[field.field_key]) {
          console.log(
            `❌ Field validation error found for ${field.field_key}:`,
            fieldErrors[field.field_key],
          );
          return false;
        }

        if (!isFieldRequired) continue;

        // Check conditional visibility logic (show_if)
        if (field.conditional_logic?.show_if) {
          const { field_key, operator, value } =
            field.conditional_logic.show_if;
          const conditionValue = formValues[field_key];

          let shouldShow = false;
          switch (operator) {
            case 'equals':
              shouldShow = conditionValue === value;
              break;
            case 'not_equals':
              shouldShow = conditionValue !== value;
              break;
            case 'contains':
              // For array fields (multiselect), check if array includes the value
              if (Array.isArray(conditionValue)) {
                shouldShow = conditionValue.includes(value);
              } else {
                shouldShow = conditionValue === value;
              }
              break;
            default:
              shouldShow = true;
          }

          if (!shouldShow) continue; // Skip validation for hidden fields
        }

        const fieldValue = formValues[field.field_key];
        const isEditable = field.field_config?.editable !== false;

        // Check if field exists in formValues
        const hasValue = field.field_key in formValues;

        // For editable fields (except toggles with defaults), require explicit user interaction
        // For toggles/booleans with default values, they will be pre-filled so just validate the value
        if (isEditable && !hasValue) {
          return false;
        }

        // Validate non-empty values (skip for non-editable fields that might not be loaded yet)
        // For number fields in borrowing details, also check if value is greater than 0
        if (
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === ''
        ) {
          // If field is not editable and doesn't have a value, it might still be loading
          // Allow validation to pass in this case
          if (!isEditable) {
            continue;
          }
          return false;
        }

        // For number fields, check if value is greater than 0 (especially for outstanding_amount)
        if (
          field.field_type === 'number' &&
          field.field_key === 'outstanding_amount'
        ) {
          const numValue =
            typeof fieldValue === 'string'
              ? parseFloat(fieldValue)
              : fieldValue;
          if (isNaN(numValue) || numValue <= 0) {
            return false;
          }
        }

        // Array validation for multiselect
        if (Array.isArray(fieldValue) && fieldValue.length === 0) {
          return false;
        }

        // Special validation for checkbox fields that must be true
        if (field.validation_rules?.must_be_true && fieldValue !== true) {
          return false;
        }

        // Validate min/max for number fields (including amount fields)
        const rules = field.validation_rules;
        if (
          rules &&
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          const numValue =
            typeof fieldValue === 'string'
              ? parseFloat(fieldValue)
              : fieldValue;

          if (!isNaN(numValue) && typeof numValue === 'number') {
            // Check minimum value
            if (rules.min !== undefined && numValue < rules.min) {
              return false;
            }

            // Check maximum value
            if (rules.max !== undefined && numValue > rules.max) {
              return false;
            }

            // Check if value is greater than zero for amount/price/volume fields
            if (
              numValue <= 0 &&
              (field.field_key.includes('amount') ||
                field.field_key.includes('price') ||
                field.field_key.includes('volume'))
            ) {
              // Only fail if there's no explicit min rule (to avoid double validation)
              if (rules.min === undefined) {
                return false;
              }
            }
          }
        }
      }
    }

    // Special validation for Step 5 (Documents): If FSA toggle is ON, FSA must be completed
    const isDocumentsStep =
      currentStep.step_number === 5 || currentStep.identifier === 'documents';
    const hasFSAToggleEnabled = formValues.link_to_sale_agreement === true;
    const configFsaSteps = config?.attributes?.fsa_steps;
    const hasFSASteps = configFsaSteps && configFsaSteps.length > 0;

    if (
      isDocumentsStep &&
      hasFSAToggleEnabled &&
      hasFSASteps &&
      !fsaCompleted
    ) {
      // Check if all FSA steps are completed from the config
      const allFsaStepsCompleted = configFsaSteps.every(
        step => step.status === 'completed',
      );
      if (!allFsaStepsCompleted) {
        console.log(
          '❌ Step 5 incomplete: FSA toggle is ON but FSA is not completed',
        );
        return false;
      }
    }

    return true;
  }, [currentStep, formValues, fieldErrors, fsaCompleted, config]);

  // Handle next step
  const handleNext = useCallback(async () => {
    if (!config || !currentStep) return;

    // Debug Mode: skip the validation submission and simply advance to the next
    // step (or skip straight to LoanSummary on the last step). No API calls are made.
    if (isDebugMode) {
      Keyboard.dismiss();
      if (isEditMode) {
        navigation.navigate('BankApplication', { slug });
      } else if (currentStepIndex < totalSteps - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        pagerRef.current?.setPage(nextIndex);
      } else {
        navigation.navigate('BankSelection', {
          productSubmissionId: submissionId,
          otpFlow: 'LOAN_REQUEST_OTP',
        });
      }
      return;
    }

    setIsSubmitting(true);
    setIsValidatingStep(true);
    setStepErrors({});

    try {
      // Collect all field values for current step
      const stepFields: { [key: string]: any } = {};
      currentStep.sections?.forEach(section => {
        section.fields?.forEach(field => {
          if (formValues[field.field_key] !== undefined) {
            stepFields[field.field_key] = formValues[field.field_key];
          }
        });
      });

      // Submit step with is_draft: false for validation
      const payload = {
        is_draft: false,
        type: 'product_submission',
        product_slug: slug,
        field_values: stepFields,
        step_identifier: currentStep.identifier,
        step_number: currentStepIndex + 1,
        ...(submissionId && { submission_id: submissionId }),
      };

      console.log('🔍 Submitting step for validation:', payload);

      const response = await axiosFinancingPrivate.post(
        '/submissions',
        payload,
      );

      if (response.status === 201) {
        console.log('✅ Step validation successful');
        console.log('📋 Response data:', response.data);

        // Extract submission_id from response if available
        const responseData = response.data?.data || response.data;
        console.log('📋 Extracted responseData:', responseData);

        // Try to get submission_id from either direct property or nested in attributes
        const responseSubmissionId =
          responseData?.submission_id ||
          responseData?.attributes?.submission_id;
        console.log('📋 responseSubmissionId:', responseSubmissionId);
        console.log('📋 Current submissionId state:', submissionId);

        if (responseSubmissionId && !submissionId) {
          console.log(
            '📝 Captured submission_id from validation:',
            responseSubmissionId,
          );
          setSubmissionId(responseSubmissionId);
          // Also store it in the global store so BankApplication can access it
          setStoreSubmissionId(responseSubmissionId);
        } else if (responseSubmissionId) {
          console.log(
            '📝 Submission_id already exists, not updating:',
            submissionId,
          );
        } else {
          console.log('⚠️ No submission_id in response');
        }

        setStepErrors({});
        setFieldErrors({}); // Clear field errors on successful validation

        // Special handling for buy-inputs product at Step 4 (index 3)
        // Navigate to SaleAgreementPreview instead of next pager step
        if (slug === 'buy-inputs' && currentStepIndex === 3) {
          const finalSubmissionId = responseSubmissionId || submissionId;
          console.log(
            '🔍 Navigating to SaleAgreementPreview with submissionId:',
            finalSubmissionId,
          );
          navigation.navigate('SaleAgreementPreview', {
            fsaSteps: config?.attributes?.steps || [],
            formValues: formValues,
            productSubmissionId: finalSubmissionId,
            productSlug: slug,
            fromDashboard,
          });
          return; // Early return, cleanup happens in finally block
        }

        // Special handling for buy-inputs product at Step 5 (index 4)
        // Navigate to SaleAgreementPreview instead of next pager step
        if (slug === 'buy-inputs' && currentStepIndex === 4) {
          const finalSubmissionId = responseSubmissionId || submissionId;
          console.log(
            '🔍 Navigating to SaleAgreementPreview with submissionId:',
            finalSubmissionId,
          );
          navigation.navigate('SaleAgreementPreview', {
            fsaSteps: config?.attributes?.steps || [],
            formValues: formValues,
            productSubmissionId: finalSubmissionId,
            productSlug: slug,
            fromDashboard,
            paymentType,
            harvestDetailIds,
          });
          return; // Early return, cleanup happens in finally block
        }

        // If in edit mode, navigate back to BankApplication after validation
        if (isEditMode) {
          console.log(
            '✅ Step edited and saved, navigating back to BankApplication screen',
          );
          
          // Navigate back to BankApplication screen
          if (submissionId) {
            navigation.navigate('BankApplication', {
              slug,
              submissionId: submissionId,
            });
          } else {
            // Fallback: if no submissionId, navigate without it
            console.warn(
              '⚠️ No submissionId available, navigating to BankApplication without it',
            );
            navigation.navigate('BankApplication', {
              slug,
            });
          }
        } else if (currentStepIndex < totalSteps - 1) {
          // Dismiss keyboard before moving to next step
          Keyboard.dismiss();

          // Move to next step
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          pagerRef.current?.setPage(nextIndex);

          // Reset scroll position of the next step's scroll view after a short delay
          // This ensures the scroll view is rendered before we try to reset it
          setTimeout(() => {
            const nextScrollViewRef = scrollViewRefs.current.get(nextIndex);
            if (nextScrollViewRef) {
              // Reset scroll position to top
              try {
                const scrollResponder = (
                  nextScrollViewRef as any
                ).getScrollResponder?.();
                if (scrollResponder && scrollResponder.scrollTo) {
                  scrollResponder.scrollTo({ x: 0, y: 0, animated: false });
                } else if ((nextScrollViewRef as any).scrollTo) {
                  (nextScrollViewRef as any).scrollTo({
                    x: 0,
                    y: 0,
                    animated: false,
                  });
                }
              } catch (error) {
                console.log('Error resetting scroll position:', error);
              }
            }
          }, 100);
        } else {
          // Last step completed OR in edit mode - navigate to BankApplication stepper screen
          if (isEditMode) {
            console.log(
              '✅ Step edited and saved, navigating back to BankApplication screen',
            );
          } else {
            console.log(
              '✅ Step 5 completed, navigating to BankApplication screen',
            );
          }

          console.log('📋 Form values at completion:', formValues);
          console.log(
            '🔗 Link to sales agreement:',
            formValues.link_to_sale_agreement,
          );
          console.log('📊 FSA Completed:', fsaCompleted);

          // Navigate to BankApplication screen after submitting step 5
          // User will click "Request Loan" there to go to Summary screen
          if (submissionId) {
            navigation.navigate('BankApplication', {
              slug,
              submissionId: submissionId,
            });
          } else {
            // Fallback: if no submissionId, navigate without it
            console.warn(
              '⚠️ No submissionId available, navigating to BankApplication without it',
            );
            navigation.navigate('BankApplication', {
              slug,
            });
          }
        }
      }
    } catch (error: any) {
      console.log('❌ Step validation failed:', error);

      if (error.response?.status === 400 && error.response?.data?.errors) {
        // Handle validation errors - set errors to be displayed in respective fields
        const errors = error.response.data.errors;
        setStepErrors(errors);

        console.log('📋 Validation errors:', errors);
        console.log('⚠️ Please fix the highlighted errors in the form fields');
      } else {
      }
    } finally {
      setIsSubmitting(false);
      // Keep the validation flag active for a brief period to prevent
      // delayed blur events from triggering draft submissions
      setTimeout(() => {
        setIsValidatingStep(false);
      }, 500);
    }
  }, [
    config,
    currentStepIndex,
    totalSteps,
    formValues,
    onComplete,
    slug,
    currentStep,
    submissionId,
    setStoreSubmissionId,
    navigation,
    isEditMode,
    fsaCompleted,
    isDebugMode,
  ]);

  // Handle back
  const handleBack = useCallback(() => {
    console.log(
      '🔙 handleBack called - slug:',
      slug,
      'currentStepIndex:',
      currentStepIndex,
    );

    // Special handling for buy-inputs product at Step 5 (index 4)
    // This is the first step in the dynamic stepper for buy-inputs
    // Steps 1-4 are handled by separate screens, so we need to exit the stepper
    if (slug === 'buy-inputs' && currentStepIndex === 4) {
      // Check if Checkout screen is in the navigation stack (normal flow).
      // If so, goBack() preserves the user's delivery/payment selections.
      // If not (resume from dashboard), navigate to a fresh Checkout with step data
      // so the useFocusEffect can restore from the server.
      const navState = navigation.getState?.();
      const routes = navState?.routes || [];
      const currentIndex = navState?.index ?? routes.length - 1;
      const hasCheckoutBelow = routes
        .slice(0, currentIndex)
        .some((r: any) => r.name === 'Checkout');

      if (hasCheckoutBelow) {
        console.log('🔙 Buy-inputs Step 5 - goBack to existing Checkout');
        navigation.goBack();
      } else {
        console.log('🔙 Buy-inputs Step 5 - navigate to new Checkout (resumed from dashboard)');
        // Extract providerId from step 1 so Checkout can resolve the IP's
        // provider-credit eligibility on resume.
        let resumedProviderId: string | undefined;
        let resumedProviderName: string | undefined;
        const step1 = steps.find((s: any) => s.identifier === 'government_verified_provider');
        if (step1?.sections && Array.isArray(step1.sections)) {
          for (const section of step1.sections) {
            const fields = (section as any)?.fields;
            if (!Array.isArray(fields)) continue;
            const idField = fields.find(
              (f: any) => f.field_key === 'provider_id' || f.field_key === 'selected_provider_id',
            );
            const nameField = fields.find((f: any) => f.field_key === 'provider_name');
            if (idField?.value && !resumedProviderId) resumedProviderId = idField.value;
            if (nameField?.value && !resumedProviderName) resumedProviderName = nameField.value;
          }
        }

        navigation.navigate('Checkout', {
          isOrderLocked: true,
          step: steps.find(s => s.identifier === 'checkout'),
          steps,
          productSlug: slug,
          submissionId,
          providerId: resumedProviderId,
          providerName: resumedProviderName,
          fromDashboard,
        });
      }
      return;
    }

    if (currentStepIndex > 0) {
      // Dismiss keyboard before moving to previous step
      Keyboard.dismiss();

      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      pagerRef.current?.setPage(prevIndex);

      // Reset scroll position of the previous step's scroll view after a short delay
      setTimeout(() => {
        const prevScrollViewRef = scrollViewRefs.current.get(prevIndex);
        if (prevScrollViewRef) {
          try {
            const scrollResponder = (
              prevScrollViewRef as any
            ).getScrollResponder?.();
            if (scrollResponder && scrollResponder.scrollTo) {
              scrollResponder.scrollTo({ x: 0, y: 0, animated: false });
            } else if ((prevScrollViewRef as any).scrollTo) {
              (prevScrollViewRef as any).scrollTo({
                x: 0,
                y: 0,
                animated: false,
              });
            }
          } catch (error) {
            console.log('Error resetting scroll position on back:', error);
          }
        }
      }, 100);
    } else {
      navigation.goBack();
    }
  }, [currentStepIndex, navigation, slug, fromDashboard, steps, submissionId]);

  // Handle hardware back button press (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Use the same logic as the on-screen back button
        handleBack();
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [handleBack]),
  );

  // Helper function to navigate to FSA step (always starts from first step)
  const navigateToFsaStep = useCallback(
    (fsaStep: any) => {
      // Map FSA step identifier to navigation screen
      const fsaScreenMap: { [key: string]: string } = {
        government_verified_buyers: 'GovernmentVerifiedBuyers',
        forward_sale_agreement: 'SaleAgreement',
        review_agreement: 'SaleAgreementPreview',
        authentication: 'Authentication',
      };

      const screenName = fsaScreenMap[fsaStep.identifier];

      if (screenName) {
        const navParams: any = {
          fsaStep: fsaStep,
          fsaSteps: config?.attributes?.fsa_steps,
          productSlug: slug,
          submissionId: submissionId,
          productSubmissionId: submissionId,
        };

        // Note: expectedVolume and expectedVolumeUnit are no longer passed as params
        // FSA screens should fetch these values from the submission API using submissionId

        console.log('🚀 Navigating to FSA step with params:', navParams);
        navigation.navigate(screenName, navParams);
      }
    },
    [config?.attributes?.fsa_steps, slug, submissionId, navigation],
  );

  // Handler for showing FSA modal from Link FSA button in Step 5
  const handleShowFsaModal = useCallback(() => {
    setFsaModalVisible(true);
  }, []);

  // Handler for FSA modal Skip button
  const handleFsaSkip = useCallback(() => {
    setFsaModalVisible(false);
    // When skipping from Link FSA button (not from Next button), don't complete
    // Stay on Step 5 - the user can still complete Step 5 without FSA if they turn off the toggle
  }, []);

  // Handler for FSA modal Proceed button
  const handleFsaProceed = useCallback(() => {
    setFsaModalVisible(false);
    const fsaSteps = config?.attributes?.fsa_steps || [];

    // Always navigate to the first FSA step to restart the flow from the beginning
    // This prevents state inconsistencies and ensures users go through the complete FSA flow
    // According to documentation: FSA flow must always restart from Step 1 (Buyer Discovery)
    const stepToNavigate = fsaSteps && fsaSteps.length > 0 ? fsaSteps[0] : null;
    if (stepToNavigate) {
      navigateToFsaStep(stepToNavigate);
    } else {
      // Fallback: complete normally if no FSA steps
      onComplete?.(formValues, submissionId);
    }
  }, [
    config?.attributes?.fsa_steps,
    formValues,
    submissionId,
    navigateToFsaStep,
    onComplete,
  ]);

  // Clear fieldErrors for fields not in the current step when step changes
  useEffect(() => {
    if (!currentStep?.sections) return;

    const currentStepFieldKeys = new Set<string>();
    currentStep.sections?.forEach(section => {
      section.fields?.forEach(field => {
        if (field.is_active !== false) {
          currentStepFieldKeys.add(field.field_key);
        }
      });
    });

    // Clear errors for fields that are no longer in the current step
    setFieldErrors(prev => {
      const newErrors: Record<string, string> = {};
      Object.keys(prev).forEach(fieldKey => {
        if (currentStepFieldKeys.has(fieldKey)) {
          newErrors[fieldKey] = prev[fieldKey];
        }
      });
      return newErrors;
    });
  }, [currentStepIndex, currentStep]);

  // Handle page change from pager
  const handlePageChange = useCallback(
    (e: any) => {
      const newIndex = e.nativeEvent.position;

      // Prevent moving forward if current step is invalid
      if (newIndex > currentStepIndex && !isCurrentStepValid) {
        // Revert to current step
        pagerRef.current?.setPageWithoutAnimation(currentStepIndex);
        return;
      }

      // Dismiss keyboard when page changes
      Keyboard.dismiss();

      setCurrentStepIndex(newIndex);
    },
    [currentStepIndex, isCurrentStepValid],
  );

  // Reset scroll position when step changes and dismiss keyboard
  useEffect(() => {
    // Dismiss keyboard when step changes
    Keyboard.dismiss();

    // Reset scroll position of the current step's scroll view
    // Use a delay to ensure the scroll view is fully rendered
    const timeoutId = setTimeout(() => {
      const scrollViewRef = scrollViewRefs.current.get(currentStepIndex);
      if (scrollViewRef) {
        try {
          const scrollResponder = (scrollViewRef as any).getScrollResponder?.();
          if (scrollResponder && scrollResponder.scrollTo) {
            scrollResponder.scrollTo({ x: 0, y: 0, animated: false });
          } else if ((scrollViewRef as any).scrollTo) {
            (scrollViewRef as any).scrollTo({ x: 0, y: 0, animated: false });
          }
        } catch (error) {
          console.log('Error resetting scroll position on step change:', error);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentStepIndex]);

  // Prevent auto-scroll to bottom when keyboard dismisses
  useEffect(() => {
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Prevent any automatic scrolling when keyboard closes
        // The scroll position should remain where the user left it
        const scrollViewRef = scrollViewRefs.current.get(currentStepIndex);
        if (scrollViewRef) {
          // Cancel any pending scroll animations
          // The resetScrollToCoords={false} already prevents this, but this is an extra safeguard
        }
      },
    );

    return () => {
      keyboardWillHideListener.remove();
    };
  }, [currentStepIndex]);

  // Check FSA completion status when screen comes into focus (e.g., returning from FSA flow)
  useFocusEffect(
    useCallback(() => {
      // Check if FSA steps exist and all are completed
      const fsaSteps = config?.attributes?.fsa_steps;
      if (fsaSteps && fsaSteps.length > 0) {
        const allFsaStepsCompleted = fsaSteps.every(
          step => step.status === 'completed',
        );
        if (allFsaStepsCompleted && !fsaCompleted) {
          console.log('✅ FSA flow completed, marking fsaCompleted as true');
          setFsaCompleted(true);
        }
      }
    }, [config?.attributes?.fsa_steps, fsaCompleted]),
  );

  // Loading state
  if (configLoading || !config) {
    return (
      <View style={styles.container}>
        <LoanScreenHeader
          title="Loading..."
          onBack={() => navigation.goBack()}
          containerStyle={[styles.header, { marginTop: top }]}
        />
      </View>
    );
  }

  // Render a step page
  const renderStepPage = (
    step: ProductConfigurationStep,
    stepIndex: number,
  ) => {
    const sortedSections = [...(step.sections || [])]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);

    // Extract confirmation checkbox field from Declaration section to render it outside
    let confirmationField: any = null;
    let confirmationSectionId: string | null = null;
    const modifiedSections = sortedSections.map(section => {
      if (section.identifier === 'declaration') {
        const confirmField = section.fields?.find(f => f.field_key === 'confirm_id_accuracy');
        if (confirmField) {
          confirmationField = confirmField;
          confirmationSectionId = section.section_id;
          // Return section with confirmation field filtered out
          return {
            ...section,
            fields: section.fields?.filter(f => f.field_key !== 'confirm_id_accuracy')
          };
        }
      }
      return section;
    });

    return (
      <View key={step.step_id} style={styles.pageContainer}>
        <KeyboardAwareScrollView
          ref={ref => {
            if (ref) {
              scrollViewRefs.current.set(stepIndex, ref);
            } else {
              scrollViewRefs.current.delete(stepIndex);
            }
          }}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={Platform.OS === 'ios' ? 80 : 100}
          extraHeight={Platform.OS === 'ios' ? 80 : 100}
          keyboardOpeningTime={Platform.OS === 'ios' ? 250 : 300}
          enableResetScrollToCoords={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 24 },
          ]}
          onScrollBeginDrag={() => Platform.OS === 'ios' && Keyboard.dismiss()}
          nestedScrollEnabled={true}
          scrollEnabled={true}
        >
          {slug !== 'buy-inputs' && (
            <UISteps
              steps={totalSteps}
              current={stepIndex + 1}
              style={styles.stepsWrap}
            />
          )}

          {modifiedSections.map(section => (
            <ProductSection
              key={section.section_id}
              section={section}
              formValues={formValues}
              onFieldChange={handleFieldChange}
              stepNumber={step.step_number}
              errors={stepErrors}
              fsaSteps={config?.attributes?.fsa_steps}
              productSlug={slug}
              stepIdentifier={step.identifier || step.step_id}
              submissionId={submissionId}
              onSubmissionIdReceived={handleSubmissionIdReceived}
              isValidatingStep={isValidatingStep}
              registerFieldRef={registerFieldRef}
              onFieldErrorChange={handleFieldErrorChange}
              scrollToField={scrollToField}
              onShowFsaModal={handleShowFsaModal}
              fsaCompleted={fsaCompleted}
              paymentType={paymentType}
              harvestDetailIds={harvestDetailIds}
            />
          ))}

          {/* Render confirmation checkbox outside Declaration section */}
          {confirmationField && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const newValue = !formValues[confirmationField.field_key];
                handleFieldChange(confirmationField.field_key, newValue);
              }}
              style={confirmationStyles.container}
            >
              <UICheckbox
                checked={formValues[confirmationField.field_key] === true}
                onPress={() => {
                  const newValue = !formValues[confirmationField.field_key];
                  handleFieldChange(confirmationField.field_key, newValue);
                }}
                size={24}
              />
              <UITypography variant="regular" style={confirmationStyles.label}>
                {confirmationField.label}
              </UITypography>
            </TouchableOpacity>
          )}
          {confirmationField && stepErrors[confirmationField.field_key] && (
            <UITypography variant="regular" style={confirmationStyles.error}>
              {stepErrors[confirmationField.field_key]}
            </UITypography>
          )}

          {/* Note text for Documents step */}
          {step.step_number === 5 && sortedSections[0]?.description && (
            <View style={{ marginTop: 16 }}>
              <UISteps
                steps={0}
                current={0}
                style={{ opacity: 0, height: 0 }}
              />
            </View>
          )}

          <UIContainedButton
            style={styles.nextButton}
            onPress={handleNext}
            disabled={!isCurrentStepValid || isSubmitting}
            key={`button-${isCurrentStepValid}-${isSubmitting}`}
          >
            {(() => {
              if (isSubmitting) return 'Validating...';

              // Show "Save" when in edit mode, otherwise "Next"
              return isEditMode ? 'Save' : 'Next';
            })()}
          </UIContainedButton>
        </KeyboardAwareScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={currentStep?.title || config.attributes.name}
        onBack={handleBack}
        containerStyle={[styles.header, { marginTop: top }]}
        titleStyle={styles.title}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={initialStepIndex}
        onPageSelected={handlePageChange}
        scrollEnabled={false}
      >
        {steps.map((step, index) => renderStepPage(step, index))}
      </PagerView>
      <FsaLinkInfoModal
        visible={fsaModalVisible}
        onClose={() => setFsaModalVisible(false)}
        onSkip={handleFsaSkip}
        onProceed={handleFsaProceed}
      />
    </View>
  );
};

const confirmationStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#404040',
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 4,
    paddingHorizontal: 16,
  },
});

export default ProductSteps;
