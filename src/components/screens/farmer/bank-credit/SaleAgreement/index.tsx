import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import CardHeader from './components/CardHeader';
import { UIContainedButton } from '@/components/ui/button';
import { UIPicker, UITextInput } from '@/components/ui';
import UITypography from '@/components/ui/typography';
import { axiosFinancingPrivate, axiosPrivate } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';
import type {
  FSAStep,
  ProductConfigurationField,
} from '@/store/useProductsStore';
import type { Buyer } from '@/components/screens/farmer/bank-credit/GovernmentVerifiedBuyers';

type RouteParams = {
  SaleAgreement: {
    buyer?: Buyer;
    fsaSteps?: FSAStep[];
    submissionId?: string | null;
    initiateFsaStaticFlow?: boolean;
  };
};

type FormValues = Record<string, any>;

// Static "Initiate FSA" flow: a self-contained copy of the forward_sale_agreement
// step (mirrors product-config.json) so the real Sale Agreement form UI is shown
// without needing a product configuration API call.
const STATIC_FSA_STEP: FSAStep = {
  step_id: 'static-forward-sale-agreement',
  step_number: 7,
  title: 'Sale Agreement',
  identifier: 'forward_sale_agreement',
  description: null,
  is_required: true,
  is_active: true,
  display_order: 6,
  status: 'not_started',
  sections: [
    {
      section_id: 'static-agreement-details',
      title: 'Agreement Details',
      identifier: 'agreement_details',
      description: null,
      display_order: 0,
      is_required: true,
      is_active: true,
      fields: [
        {
          field_key: 'expected_volume',
          field_type: 'number',
          label: 'Expected Volume',
          placeholder: '0.00',
          helper_text: null,
          is_required: true,
          is_active: true,
          display_order: 0,
          validation_rules: { presence: true, type: 'number', min: 0.01, precision: 2 },
          field_config: {
            decimal_places: 2,
            step: 0.01,
            min: 0,
            unit_field: 'expected_volume_unit',
          },
          conditional_logic: null,
          metadata: {},
          options: [],
        },
        {
          field_key: 'expected_volume_unit',
          field_type: 'select',
          label: 'Units',
          placeholder: 'Select',
          helper_text: null,
          is_required: true,
          is_active: true,
          display_order: 1,
          validation_rules: { presence: true, allowed_values: ['Kgs', 'Tonnes', 'Bags', 'Crates'] },
          field_config: { options_source: 'static', multiple: false, searchable: false },
          conditional_logic: null,
          metadata: {},
          options: [
            { option_value: 'Kgs', option_label: 'Kgs', display_order: 0, is_active: true },
            { option_value: 'Tonnes', option_label: 'Tonnes', display_order: 1, is_active: true },
            { option_value: 'Bags', option_label: 'Bags', display_order: 2, is_active: true },
            { option_value: 'Crates', option_label: 'Crates', display_order: 3, is_active: true },
          ],
        },
        {
          field_key: 'committed_volume',
          field_type: 'number',
          label: 'Committed Volume',
          placeholder: '0.00',
          helper_text: null,
          is_required: true,
          is_active: true,
          display_order: 2,
          validation_rules: { presence: true, type: 'number', min: 0.01, precision: 2 },
          field_config: { decimal_places: 2, step: 0.01, min: 0, unit_field: 'committed_volume_unit' },
          conditional_logic: null,
          metadata: {},
          options: [],
        },
        {
          field_key: 'committed_volume_unit',
          field_type: 'select',
          label: 'Units',
          placeholder: 'Select',
          helper_text: null,
          is_required: true,
          is_active: true,
          display_order: 3,
          validation_rules: { presence: true, allowed_values: ['Kgs', 'Tonnes', 'Bags', 'Crates'] },
          field_config: { options_source: 'static', multiple: false, searchable: false },
          conditional_logic: null,
          metadata: {},
          options: [
            { option_value: 'Kgs', option_label: 'Kgs', display_order: 0, is_active: true },
            { option_value: 'Tonnes', option_label: 'Tonnes', display_order: 1, is_active: true },
            { option_value: 'Bags', option_label: 'Bags', display_order: 2, is_active: true },
            { option_value: 'Crates', option_label: 'Crates', display_order: 3, is_active: true },
          ],
        },
      ],
    },
  ],
};

export default function SaleAgreement() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SaleAgreement'>>();
  const { top } = useSafeAreaInsets();

  const { buyer, fsaSteps, submissionId, initiateFsaStaticFlow } = route.params || {};

  console.log('📥 SaleAgreement received params:', {
    submissionId,
  });

  // Find the Forward Sale Agreement step from fsaSteps
  const fsaStep = useMemo(() => {
    if (initiateFsaStaticFlow) return STATIC_FSA_STEP;
    return fsaSteps?.find(step => step.identifier === 'forward_sale_agreement');
  }, [fsaSteps, initiateFsaStaticFlow]);

  // Get the first section (Agreement Details)
  const section = useMemo(() => {
    if (!fsaStep?.sections?.length) return null;
    return [...fsaStep.sections]
      .filter(s => s.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order)[0];
  }, [fsaStep]);

  // Get sorted fields from section
  const fields = useMemo(() => {
    if (!section?.fields?.length) return [];
    return [...section.fields]
      .filter(f => f.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);
  }, [section]);

  // Form state
  const [formValues, setFormValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingStep, setIsValidatingStep] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState<string | null>(null);
  const isDebugMode = useDebugStore(state => state.isDebugMode);
  
  // Expected volume values fetched from API
  const [expectedVolume, setExpectedVolume] = useState<string>('');
  const [expectedVolumeUnit, setExpectedVolumeUnit] = useState<string>('');

  // Produce image assets mapping
  const PRODUCE_ASSETS: Record<string, { src: any; label: string }> = {
    maize: { src: require('@/assets/images/farmer/buyer-corn.png'), label: 'Maize' },
    soybean: { src: require('@/assets/images/farmer/buyer-tractor.png'), label: 'Soybean' },
    sorghum: { src: require('@/assets/images/farmer/miki39st-vq8p2xu.png'), label: 'Sorghum' },
    rice: { src: require('@/assets/images/farmer/miki3c1v-m1nokpj.png'), label: 'Rice' },
    tomato: { src: require('@/assets/images/farmer/gvb-banner.png'), label: 'Tomato' },
    onion: { src: require('@/assets/images/farmer/miki44o0-bllx5jp.png'), label: 'Onion' },
    pepper: { src: require('@/assets/images/farmer/miki46ls-ou6zhqd.png'), label: 'Pepper' },
    cowpea: { src: require('@/assets/images/farmer/miki48tg-n8cc25j.png'), label: 'Cowpea' },
  };

  // Fetch selected produce and draft data from submission API
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (isDebugMode) return; // Debug Mode: no API calls.
      if (!submissionId) return;

      try {
        setLoading(true);
        const response = await axiosFinancingPrivate.get(`/submissions/${submissionId}`);
        const responseData = response.data?.data || response.data;
        
        console.log('📥 Submission API response received');
        
        let produce = null;
        const draftValues: FormValues = {};
        
        // Get steps and fsa_steps from product_configuration
        const steps = responseData?.attributes?.product_configuration?.steps || [];
        const fsaSteps = responseData?.attributes?.product_configuration?.fsa_steps || [];
        
        // Look for Financial Profile step in steps[] (step_number: 4, identifier: "financial_profile")
        for (const step of steps) {
          if (step.step_number === 4 || step.identifier === 'financial_profile') {
            if (step.sections) {
              for (const section of step.sections) {
                if (section.fields) {
                  // New API: selected_harvest multiselect field with harvest IDs
                  const selectedHarvestField = section.fields.find(
                    (f: any) => f.field_key === 'selected_harvest'
                  );

                  // Normalize value: API returns either a string (single) or an array
                  const rawHarvestValue = selectedHarvestField?.value;
                  const normalizedHarvestIds: string[] = rawHarvestValue
                    ? Array.isArray(rawHarvestValue)
                      ? rawHarvestValue
                      : [rawHarvestValue]
                    : [];

                  if (normalizedHarvestIds.length > 0) {
                    const harvestIds: string[] = normalizedHarvestIds;
                    console.log('✅ Found selected_harvest IDs:', harvestIds);

                    try {
                      const harvestResults = await Promise.all(
                        harvestIds.map(async (harvestId: string) => {
                          try {
                            const hRes = await axiosPrivate.get(`/harvest_details/${harvestId}`);
                            const record = hRes.data?.data;
                            return record?.attributes || record || null;
                          } catch {
                            return null;
                          }
                        }),
                      );

                      const validHarvests = harvestResults.filter(Boolean);

                      if (validHarvests.length > 0) {
                        const firstHarvest = validHarvests[0];

                        // Use first harvest's produce for display
                        produce = firstHarvest.selected_produce ?? null;
                        if (produce) {
                          console.log('✅ Set selected_produce from harvest:', produce);
                          setSelectedProduce(produce.toLowerCase());
                        }

                        // Sum expected volumes if all harvests share the same unit
                        const firstUnit: string = firstHarvest.expected_volume_unit ?? '';
                        const allSameUnit = validHarvests.every(
                          (h: any) => (h.expected_volume_unit ?? '') === firstUnit,
                        );

                        if (allSameUnit) {
                          const totalVolume = validHarvests.reduce((sum: number, h: any) => {
                            const vol = parseFloat(h.expected_volume ?? '0');
                            return sum + (isNaN(vol) ? 0 : vol);
                          }, 0);
                          console.log('✅ Total expected_volume from harvests:', totalVolume, firstUnit);
                          setExpectedVolume(String(totalVolume));
                          setExpectedVolumeUnit(firstUnit);
                        } else {
                          // Different units — fallback to first harvest values
                          const vol = firstHarvest.expected_volume != null
                            ? String(firstHarvest.expected_volume)
                            : '';
                          console.log('✅ expected_volume (first harvest fallback):', vol, firstUnit);
                          setExpectedVolume(vol);
                          setExpectedVolumeUnit(firstUnit);
                        }
                      }
                    } catch (harvestErr) {
                      console.log('❌ Failed to fetch harvest details:', harvestErr);
                    }
                  } else {
                    // Legacy fallback: individual fields in Financial Profile
                    const produceField = section.fields.find(
                      (f: any) => f.field_key === 'selected_produce'
                    );
                    if (produceField?.value) {
                      produce = produceField.value;
                      console.log('✅ Found selected_produce (legacy):', produce);
                      setSelectedProduce(produce);
                    }

                    const expectedVolumeField = section.fields.find(
                      (f: any) => f.field_key === 'expected_volume'
                    );
                    if (expectedVolumeField?.value) {
                      console.log('✅ Found expected_volume (legacy):', expectedVolumeField.value);
                      setExpectedVolume(expectedVolumeField.value);
                    }

                    const expectedVolumeUnitField = section.fields.find(
                      (f: any) =>
                        f.field_key === 'expected_volume_unit' ||
                        f.field_key === 'expected_volume_units',
                    );
                    if (expectedVolumeUnitField?.value) {
                      console.log('✅ Found expected_volume_unit (legacy):', expectedVolumeUnitField.value);
                      setExpectedVolumeUnit(expectedVolumeUnitField.value);
                    }
                  }
                }
              }
            }
          }
        }
        
        // Look for FSA step (forward_sale_agreement) in fsa_steps[] to restore draft values
        for (const step of fsaSteps) {
          if (fsaStep && (step.step_number === fsaStep.step_number || step.identifier === fsaStep.identifier)) {
            console.log('✅ Found FSA step in fsa_steps:', step.identifier);
            if (step.sections) {
              for (const section of step.sections) {
                if (section.fields) {
                  for (const field of section.fields) {
                    // Skip fields that are always derived from Financial Profile or synced automatically.
                    // committed_volume is always skipped — it is buyer-specific and must be
                    // entered fresh each time to avoid stale data when a different buyer is selected.
                    if (
                      field.field_key === 'expected_volume' ||
                      field.field_key === 'expected_volume_unit' ||
                      field.field_key === 'committed_volume_unit' ||
                      field.field_key === 'committed_volume'
                    ) {
                      console.log(`⏭️ Skipping ${field.field_key} from FSA draft - will be set from Financial Profile or entered fresh`);
                      continue;
                    }
                    
                    if (field.value !== undefined && field.value !== null && field.value !== '') {
                      draftValues[field.field_key] = field.value;
                      console.log(`📋 Restored draft value: ${field.field_key} =`, field.value);
                    }
                  }
                }
              }
            }
            break; // Found the step, no need to continue
          }
        }
        
        // Restore draft values to form
        if (Object.keys(draftValues).length > 0) {
          console.log('✅ Restoring draft values:', draftValues);
          setFormValues(prev => ({ ...prev, ...draftValues }));
        }
        
        if (!produce) {
          console.log('⚠️ selected_produce not found in submission data');
        }
      } catch (error: any) {
        console.log('❌ Failed to fetch submission data:', error?.response?.data || error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [submissionId, fsaStep]);

  // Initialize form with default values (only for fields without existing values)
  useEffect(() => {
    console.log('🔄 Initializing form with fields:', fields.length);
    console.log('📊 Available expectedVolume:', expectedVolume);
    console.log('📦 Available expectedVolumeUnit:', expectedVolumeUnit);
    console.log('📋 All field keys:', fields.map(f => `${f.field_key} (${f.label})`).join(', '));

    setFormValues(prev => {
      const defaultValues: FormValues = {};
      
      fields.forEach(field => {
        console.log('🔍 Processing field:', field.field_key, 'label:', field.label, 'type:', field.field_type);

        // Always use expectedVolume from Financial Profile - directly, no matching
        if ((field.field_key === 'expected_volume' || field.field_key === 'expectedVolume') && expectedVolume) {
          console.log('✅ Setting', field.field_key, 'to:', expectedVolume, '(from Financial Profile)');
          defaultValues[field.field_key] = expectedVolume;
          return;
        }
        
        // Always use expectedVolumeUnit from Financial Profile - directly, no matching
        if ((field.field_key === 'expected_volume_unit' || 
             field.field_key === 'expectedVolumeUnit' || 
             field.field_key === 'expected_volume_units') && expectedVolumeUnit) {
          console.log('✅ Setting', field.field_key, 'to:', expectedVolumeUnit, '(directly from Financial Profile)');
          defaultValues[field.field_key] = expectedVolumeUnit;
          return;
        }
        
        // ALWAYS set committed_volume_unit to match expected_volume_unit - directly, no matching
        if ((field.field_key === 'committed_volume_unit' || field.field_key === 'committedVolumeUnit') && expectedVolumeUnit) {
          console.log('✅ Setting', field.field_key, 'to:', expectedVolumeUnit, '(directly synced with expected unit)');
          defaultValues[field.field_key] = expectedVolumeUnit;
          return;
        }
        
        // Skip if field already has a value (from draft restoration or previous input)
        // This applies to other fields like committed_volume
        if (prev[field.field_key] !== undefined && prev[field.field_key] !== null && prev[field.field_key] !== '') {
          console.log(`⏭️ Skipping ${field.field_key} - already has value:`, prev[field.field_key]);
          return;
        }
        // Set default values from field config
        else if (field.field_config?.default_value !== undefined) {
          defaultValues[field.field_key] = field.field_config.default_value;
        }
        // Set default unit values
        else if (
          field.field_type === 'select' &&
          field.options &&
          field.options.length > 0
        ) {
          const activeOptions = field.options.filter(
            opt => opt.is_active !== false,
          );
          if (activeOptions.length > 0 && !defaultValues[field.field_key]) {
            defaultValues[field.field_key] = activeOptions[0].option_value;
          }
        }
      });

      console.log('📝 Final defaultValues:', defaultValues);
      // For expected_volume and expected_volume_unit, always use defaultValues (from Financial Profile)
      // For other fields, existing values (prev) take precedence
      const mergedValues = { ...prev, ...defaultValues };
      return mergedValues;
    });
  }, [fields, expectedVolume, expectedVolumeUnit]);

  // Submit committed_volume_unit when it's synced to match expected_volume_unit
  useEffect(() => {
    if (expectedVolumeUnit && formValues.committed_volume_unit && formValues.committed_volume_unit !== expectedVolumeUnit) {
      console.log('🔄 Syncing committed_volume_unit to backend:', expectedVolumeUnit);
      submitFieldDraft('committed_volume_unit', expectedVolumeUnit);
    }
  }, [expectedVolumeUnit, formValues.committed_volume_unit]);

  // Normalize numeric value by removing leading zeros
  const normalizeNumericValue = (value: string): string => {
    if (!value || typeof value !== 'string') return value;
    
    const trimmed = value.trim();
    if (trimmed === '') return '';
    
    // Handle decimal values - split by decimal point
    const parts = trimmed.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Remove leading zeros from integer part, but keep at least one zero if the entire integer part is zeros
    // e.g., "012" -> "12", "001" -> "1", "0" -> "0", "0.12" -> "0.12"
    let normalizedInteger = integerPart.replace(/^0+/, '') || '0';
    
    // Reconstruct the value
    if (decimalPart !== undefined) {
      return `${normalizedInteger}.${decimalPart}`;
    }
    
    return normalizedInteger;
  };

  // Validate committed volume
  const validateCommittedVolume = (value: string): string | null => {
    // Check for empty or whitespace-only inputs
    if (!value || value.trim() === '') {
      return 'Please enter a valid committed volume.';
    }

    // Get the unit field value to check if it's "bags"
    const committedVolumeUnit = formValues.committed_volume_unit || expectedVolumeUnit;
    const isBags = committedVolumeUnit === 'bags';

    // If unit is "bags", only allow whole numbers (no decimals)
    if (isBags) {
      const wholeNumberRegex = /^\d+$/;
      if (!wholeNumberRegex.test(value.trim())) {
        return 'Decimals are not allowed when unit is Bags.';
      }
    } else {
      // For other units, allow decimals
      const numericRegex = /^\d+(\.\d+)?$/;
      if (!numericRegex.test(value.trim())) {
        return 'Please enter a valid committed volume.';
      }
    }

    const numericValue = parseFloat(value);

    // Check if value is 0
    if (numericValue === 0) {
      return 'Committed volume must be greater than zero.';
    }

    // Check if value is less than or equal to 0
    if (numericValue <= 0) {
      return 'Committed volume must be greater than zero.';
    }

    // Check if committed volume exceeds expected volume
    const expectedVolume = formValues.expected_volume;
    if (expectedVolume) {
      const expectedNumeric = parseFloat(expectedVolume);
      if (!isNaN(expectedNumeric) && numericValue > expectedNumeric) {
        return 'Committed volume cannot exceed your expected harvest volume.';
      }
    }

    return null;
  };

  // Debug Mode: prefill expected/committed volume and units so Next is enabled
  // immediately (the Financial Profile API that normally supplies expected_volume
  // is skipped in debug mode). Units are FORCED to 'Tonnes' because the
  // initialize-defaults effect below sets select fields to their first option
  // ('Kgs'); re-running on `fields` keeps Tonnes winning after fields load.
  useEffect(() => {
    if (isDebugMode) {
      setFormValues(prev => ({
        ...prev,
        expected_volume: prev.expected_volume || '50',
        expected_volume_unit: 'Tonnes',
        committed_volume: prev.committed_volume || '50',
        committed_volume_unit: 'Tonnes',
      }));
    }
  }, [isDebugMode, fields]);

  // Static FSA flow: prefill expected volume / units (no financial profile is
  // fetched), leaving committed volume for the user to fill. No API calls.
  useEffect(() => {
    if (initiateFsaStaticFlow) {
      setFormValues(prev => ({
        ...prev,
        expected_volume: prev.expected_volume || '50',
        expected_volume_unit: 'Tonnes',
        committed_volume_unit: 'Tonnes',
      }));
    }
  }, [initiateFsaStaticFlow, fields]);

  // Submit field value as draft
  const submitFieldDraft = async (fieldKey: string, value: any) => {
    if (isDebugMode) return; // Debug Mode: no draft POSTs.
    if (initiateFsaStaticFlow) return; // Static FSA flow: no draft POSTs.
    // Don't submit draft if step validation is in progress
    if (isValidatingStep) {
      console.log('⏸️ Skipping draft submission - step validation in progress');
      return;
    }

    if (!fsaStep || !submissionId) {
      console.warn('Missing fsaStep or submissionId for draft submission');
      return;
    }

    try {
      const payload = {
        is_draft: true,
        type: 'product_submission',
        product_slug: 'cash-credit', // FSA is part of cash-credit product
        field_values: {
          [fieldKey]: value,
        },
        step_identifier: fsaStep.identifier,
        step_number: fsaStep.step_number,
        submission_id: submissionId,
      };

      console.log('📤 Submitting field draft:', JSON.stringify(payload, null, 2));

      const response = await axiosFinancingPrivate.post('/submissions', payload);

      console.log('✅ Field draft submitted successfully');
    } catch (error: any) {
      console.log('❌ Failed to submit field draft:', error?.response?.data || error?.message);
      // Don't throw - we don't want to block the user from continuing
    }
  };

  // Handle field blur (for text/number inputs)
  const handleFieldBlur = (fieldKey: string, value: any) => {
    console.log(`📤 Field blur triggered for: ${fieldKey}, value:`, value);
    submitFieldDraft(fieldKey, value);
  };

  // Handle field change
  const handleFieldChange = (fieldKey: string, value: any) => {
    // Normalize numeric fields to remove leading zeros
    let normalizedValue = value;
    const field = fields.find(f => f.field_key === fieldKey);
    
    if (field && field.field_type === 'number' && typeof value === 'string') {
      // Check if this is committed_volume and unit is "bags" - prevent decimals
      if (fieldKey === 'committed_volume') {
        const committedVolumeUnit = formValues.committed_volume_unit || expectedVolumeUnit;
        const isBags = committedVolumeUnit === 'bags';
        
        if (isBags) {
          // Remove any decimal point and digits after it for bags
          normalizedValue = value.replace(/\.\d*/g, '');
        } else {
          normalizedValue = normalizeNumericValue(value);
        }
      } else {
        normalizedValue = normalizeNumericValue(value);
      }
    }
    
    setFormValues(prev => {
      const updated = { ...prev, [fieldKey]: normalizedValue };
      
      // If expected_volume_unit changes, also update committed_volume_unit to match
      if (fieldKey === 'expected_volume_unit' || fieldKey === 'expected_volume_units') {
        updated.committed_volume_unit = normalizedValue;
        console.log('✅ Auto-syncing committed_volume_unit to match expected_volume_unit:', normalizedValue);
        
        // If new unit is "bags", remove decimals from committed_volume if it exists
        if (normalizedValue === 'bags' && prev.committed_volume && typeof prev.committed_volume === 'string') {
          updated.committed_volume = prev.committed_volume.replace(/\.\d*/g, '');
        }
      }
      
      // If unit field changed to "bags", remove decimals from committed_volume if it exists
      if (fieldKey === 'committed_volume_unit' && prev.committed_volume) {
        if (normalizedValue === 'bags' && typeof prev.committed_volume === 'string') {
          updated.committed_volume = prev.committed_volume.replace(/\.\d*/g, '');
        }
      }
      
      // Revalidate committed_volume if it exists and unit or expected_volume changed
      if ((fieldKey === 'committed_volume_unit' || fieldKey === 'expected_volume' || fieldKey === 'expected_volume_unit') && updated.committed_volume) {
        const committedVolumeUnit = updated.committed_volume_unit || expectedVolumeUnit;
        const isBags = committedVolumeUnit === 'bags';
        
        // Remove decimals if unit is bags
        if (isBags && typeof updated.committed_volume === 'string') {
          updated.committed_volume = updated.committed_volume.replace(/\.\d*/g, '');
        }
        
        // Validate committed volume
        const error = validateCommittedVolume(updated.committed_volume);
        setFieldErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          if (error) {
            newErrors['committed_volume'] = error;
          } else {
            delete newErrors['committed_volume'];
          }
          return newErrors;
        });
      }
      
      return updated;
    });

    // Validate committed_volume field
    if (fieldKey === 'committed_volume') {
      const committedVolumeUnit = formValues.committed_volume_unit || expectedVolumeUnit;
      const isBags = committedVolumeUnit === 'bags';
      
      // Use the updated value for validation
      const valueToValidate = isBags && typeof normalizedValue === 'string' 
        ? normalizedValue.replace(/\.\d*/g, '')
        : normalizedValue;
      
      const error = validateCommittedVolume(valueToValidate);
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldKey] = error;
        } else {
          delete newErrors[fieldKey];
        }
        return newErrors;
      });
    }

    // For select fields, submit draft immediately (they don't have blur)
    if (field && field.field_type === 'select') {
      console.log(`📤 Field change triggered for select: ${fieldKey}, value:`, normalizedValue);
      submitFieldDraft(fieldKey, normalizedValue);
      
      // If expected_volume_unit changes, also submit committed_volume_unit to keep them in sync
      if (fieldKey === 'expected_volume_unit' || fieldKey === 'expected_volume_units') {
        console.log(`📤 Auto-submitting committed_volume_unit to match: ${normalizedValue}`);
        submitFieldDraft('committed_volume_unit', normalizedValue);
      }
    }
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    // Check for any field errors
    if (Object.keys(fieldErrors).length > 0) {
      return false;
    }

    for (const field of fields) {
      if (field.is_required) {
        const value = formValues[field.field_key];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }
    return true;
  }, [fields, formValues, fieldErrors]);

  // Get options for select fields
  const getFieldOptions = (field: ProductConfigurationField) => {
    if (!field.options?.length) return [];
    let options = field.options
      .filter(opt => opt.is_active !== false)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map(opt => ({
        label: opt.option_label,
        value: opt.option_value,
      }));
    
    // For unit fields, dynamically add the Financial Profile unit if it's not in the options
    if (field.field_key.includes('unit')) {
      console.log(`🔍 Checking ${field.field_key}: expectedVolumeUnit="${expectedVolumeUnit}", formValue="${formValues[field.field_key]}"`);
      
      // Use the current form value or the expectedVolumeUnit from state
      const unitValueToAdd = formValues[field.field_key] || expectedVolumeUnit;
      
      if (unitValueToAdd) {
        const valueExists = options.some(opt => opt.value === unitValueToAdd);
        console.log(`🔍 Does "${unitValueToAdd}" exist in options? ${valueExists}`);
        
        if (!valueExists) {
          console.log(`➕ Adding missing unit "${unitValueToAdd}" to ${field.field_key} options`);
          options = [
            { label: unitValueToAdd, value: unitValueToAdd },
            ...options
          ];
        }
      }
    }
    
    // Debug: Log options for unit fields
    if (field.field_key.includes('unit')) {
      console.log(`📊 Final options for ${field.field_key}:`, options.map(o => o.value).join(', '));
    }
    
    return options;
  };

  // Group fields by their unit_field relationship (for inline display)
  const fieldPairs = useMemo(() => {
    const pairs: {
      main: ProductConfigurationField;
      unit?: ProductConfigurationField;
    }[] = [];
    const processedKeys = new Set<string>();

    for (const field of fields) {
      if (processedKeys.has(field.field_key)) continue;

      // Check if this field has a unit_field
      const unitFieldKey = field.field_config?.unit_field;
      if (unitFieldKey) {
        const unitField = fields.find(f => f.field_key === unitFieldKey);
        if (unitField) {
          pairs.push({ main: field, unit: unitField });
          processedKeys.add(field.field_key);
          processedKeys.add(unitFieldKey);
          continue;
        }
      }

      // Single field
      pairs.push({ main: field });
      processedKeys.add(field.field_key);
    }

    return pairs;
  }, [fields]);

  // Render a field based on its type
  const renderField = (
    field: ProductConfigurationField,
    isUnit: boolean = false,
  ) => {
    const value = formValues[field.field_key];
    const error = fieldErrors[field.field_key];

    // Check if field is prefilled from financial profile (readonly)
    const isPrefilledFromFinancialProfile = !!(
      (field.field_key === 'expected_volume' && expectedVolume) ||
      (field.field_key === 'expected_volume_unit' && expectedVolumeUnit) ||
      (field.field_key === 'committed_volume_unit' && expectedVolumeUnit)
    );

    switch (field.field_type) {
      case 'number':
      case 'text':
        return (
          <>
            <UITextInput
              label={field.label}
              labelStyle={styles.fieldLabel}
              placeholder={field.placeholder || ''}
              value={value?.toString() || ''}
              onChangeText={val => handleFieldChange(field.field_key, val)}
              onBlur={() => handleFieldBlur(field.field_key, value)}
              keyboardType={field.field_type === 'number' ? 'numeric' : 'default'}
              editable={!isPrefilledFromFinancialProfile}
              style={isPrefilledFromFinancialProfile ? { backgroundColor: '#F5F5F5' } : undefined}
              requiredLabel={field.is_required && field.field_key === 'committed_volume'}
            />
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </>
        );

      case 'select':
        return (
          <UIPicker
            label={field.label}
            labelStyles={styles.fieldLabel}
            style={isUnit ? styles.inlinePicker : undefined}
            options={getFieldOptions(field)}
            selectedValue={value}
            onValueChange={val => handleFieldChange(field.field_key, val)}
            disabled={isPrefilledFromFinancialProfile}
          />
        );

      default:
        return (
          <UITextInput
            label={field.label}
            labelStyle={styles.fieldLabel}
            placeholder={field.placeholder || ''}
            value={value?.toString() || ''}
            onChangeText={val => handleFieldChange(field.field_key, val)}
            onBlur={() => handleFieldBlur(field.field_key, value)}
          />
        );
    }
  };

  // Get screen title from FSA step config
  const screenTitle = fsaStep?.title || 'Forward Sale Agreement';

  return (
    <View style={styles.container}>
      <LoanScreenHeader
        title={screenTitle}
        onBack={() => navigation.goBack()}
        containerStyle={[styles.header, { marginTop: top }]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{ marginTop: 12, color: '#666', fontSize: 14 }}>Loading...</Text>
          </View>
        ) : (
          <>
            {section && (
              <View style={styles.card}>
                <CardHeader title={section.title} />

                {/* Display selected produce */}
                {selectedProduce && PRODUCE_ASSETS[selectedProduce] && (
                  <View style={styles.produceBox}>
                    <Image
                      source={PRODUCE_ASSETS[selectedProduce].src}
                      style={styles.produceIcon}
                      resizeMode="contain"
                    />
                    <UITypography variant="semiBold" style={styles.produceText}>
                      {PRODUCE_ASSETS[selectedProduce].label}
                    </UITypography>
                  </View>
                )}

                {fieldPairs.map((pair, idx) => {
                  // If there's a unit field, render inline
                  if (pair.unit) {
                    return (
                      <View key={pair.main.field_key} style={styles.inlineRow}>
                        <View style={styles.inlineLeft}>
                          {renderField(pair.main)}
                        </View>
                        <View style={styles.inlineRight}>
                          {renderField(pair.unit, true)}
                        </View>
                      </View>
                    );
                  }

                  // Single field
                  return (
                    <View key={pair.main.field_key} style={{ marginTop: 16 }}>
                      {renderField(pair.main)}
                    </View>
                  );
                })}
              </View>
            )}

            <UIContainedButton
          style={styles.nextButton}
          onPress={async () => {
            if (!fsaStep || isSubmitting) return;

            setIsSubmitting(true);
            setIsValidatingStep(true);

            try {
              // Static FSA flow: skip the validation/submission POST and go
              // straight to the Forward Sale Agreement preview.
              if (initiateFsaStaticFlow) {
                navigation.navigate('SaleAgreementPreview', {
                  buyer,
                  fsaSteps,
                  formValues,
                  initiateFsaStaticFlow: true,
                });
                return;
              }

              // Debug Mode: skip the validation POST and go straight to preview.
              if (isDebugMode) {
                navigation.navigate('SaleAgreementPreview', {
                  buyer,
                  fsaSteps,
                  formValues,
                  productSubmissionId: submissionId,
                });
                return;
              }

              // Collect all field values for this FSA step
              const stepFields: {[key: string]: any} = {};
              fields.forEach(field => {
                if (formValues[field.field_key] !== undefined) {
                  stepFields[field.field_key] = formValues[field.field_key];
                }
              });

              // Submit step with is_draft: false
              const payload = {
                is_draft: false,
                type: 'product_submission',
                product_slug: 'cash-credit', // TODO: Get from route params if needed
                field_values: stepFields,
                step_identifier: fsaStep.identifier,
                step_number: fsaStep.step_number,
                ...(submissionId && { submission_id: submissionId }),
              };

              console.log('📤 Submitting FSA step:', JSON.stringify(payload, null, 2));

              const { axiosFinancingPrivate } = require('@/config/axios');
              const response = await axiosFinancingPrivate.post('/submissions', payload);

              if (response.status === 201) {
                console.log('✅ FSA step submitted successfully');

                // Navigate to next screen (SaleAgreementPreview or next FSA step)
                navigation.navigate('SaleAgreementPreview', {
                  buyer,
                  fsaSteps,
                  formValues,
                  productSubmissionId: submissionId,
                });
              }
            } catch (error: any) {
              console.log('❌ Failed to submit FSA step:', error?.response?.data || error?.message);
            } finally {
              setIsSubmitting(false);
              // Keep the validation flag active for a brief period to prevent
              // delayed blur events from triggering draft submissions
              setTimeout(() => {
                setIsValidatingStep(false);
              }, 500);
            }
          }}
          disabled={!isFormValid || isSubmitting}
          key={`button-${isFormValid}-${isSubmitting}`}
        >
          {isSubmitting ? 'Submitting...' : 'Next'}
        </UIContainedButton>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
