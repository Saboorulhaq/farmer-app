import { create } from 'zustand';
import { axiosFinancingPrivate } from '@/config/axios';
import {
  type ProductConfiguration,
  type ProductConfigurationStep,
  type ProductConfigurationSection,
  type ProductConfigurationField,
} from './useProductsStore';

// Types for submission payload
export type SubmissionFieldValue = {
  field_key: string;
  field_type: string;
  label: string;
  placeholder?: string | null;
  helper_text?: string | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  validation_rules?: any;
  field_config?: any;
  conditional_logic?: any;
  metadata?: any;
  options?: any[];
  value: any; // The user-entered value
};

export type SubmissionSection = {
  section_id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  metadata?: any;
  fields: SubmissionFieldValue[];
  data_source?: string;
  external_api_config?: any;
};

export type SubmissionStep = {
  step_id: string;
  step_number: number;
  title: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  metadata?: any;
  is_draft: boolean;
  status: string | null;
  sections: SubmissionSection[];
};

export type SubmissionPayload = {
  is_draft: boolean;
  type: 'product_submission';
  product_configuration: {
    attributes: {
      product_id: string;
      slug: string;
      name: string;
      short_description?: string;
      instructions?: {
        why_apply_with_us?: string[];
        eligibility_criteria?: string[];
      };
      picture_url?: string;
      version?: number;
      steps: SubmissionStep[];
    };
  };
};

export type SubmissionResponse = {
  id: string;
  type: string;
  attributes: any;
};

interface ProductSubmissionState {
  // State
  submitting: boolean;
  submitError: string | null;
  submitStatusCode: number | null;
  submission: SubmissionResponse | null;

  // Draft state per step
  stepDrafts: Record<string, boolean>;

  // Persisted signature URI so it survives back-navigation
  savedSignatureUri: string | null;

  // Actions
  submitProductApplication: (
    config: ProductConfiguration,
    formValues: Record<string, any>,
    isDraft?: boolean,
  ) => Promise<SubmissionResponse | null>;

  submitStepDraft: (
    config: ProductConfiguration,
    stepIndex: number,
    formValues: Record<string, any>,
  ) => Promise<SubmissionResponse | null>;

  clearSubmission: () => void;
  setStepDraft: (stepId: string, isDraft: boolean) => void;
  setSavedSignatureUri: (uri: string | null) => void;
  
  // Clear only error states (useful after re-authentication)
  clearErrors: () => void;
}

/**
 * Builds the submission payload from product config and form values
 */
export const buildSubmissionPayload = (
  config: ProductConfiguration,
  formValues: Record<string, any>,
  isDraft: boolean = true,
  stepIndexToSubmit?: number, // If provided, only include steps up to this index
): SubmissionPayload => {
  const attributes = config.attributes;

  // Build steps with values
  const steps: SubmissionStep[] = (attributes.steps || []).map(
    (step, index) => {
      // Determine if this step should be marked as draft
      // All steps are draft by default, completed steps can be marked as not draft
      const isStepDraft =
        stepIndexToSubmit !== undefined ? index >= stepIndexToSubmit : isDraft;

      const sections: SubmissionSection[] = (step.sections || []).map(
        section => {
          const fields: SubmissionFieldValue[] = (section.fields || []).map(
            field => ({
              field_key: field.field_key,
              field_type: field.field_type,
              label: field.label,
              placeholder: field.placeholder,
              helper_text: field.helper_text,
              is_required: field.is_required,
              is_active: field.is_active,
              display_order: field.display_order,
              validation_rules: field.validation_rules,
              field_config: field.field_config,
              conditional_logic: field.conditional_logic,
              metadata: field.metadata,
              options: field.options,
              value: formValues[field.field_key] ?? null,
            }),
          );

          return {
            section_id: section.section_id,
            title: section.title,
            description: section.description,
            icon: section.icon,
            display_order: section.display_order,
            is_required: section.is_required,
            is_active: section.is_active,
            metadata: section.metadata,
            fields,
            data_source: section.data_source,
            external_api_config: section.external_api_config,
          };
        },
      );

      return {
        step_id: step.step_id,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
        is_required: step.is_required,
        is_active: step.is_active,
        display_order: step.display_order,
        metadata: step.metadata,
        is_draft: isStepDraft,
        status: isStepDraft ? null : 'completed',
        sections,
      };
    },
  );

  return {
    is_draft: isDraft,
    type: 'product_submission',
    product_configuration: {
      attributes: {
        product_id:
          (config as any).attributes?.product_id || (config as any).id || '',
        slug: attributes.slug,
        name: attributes.name,
        short_description: attributes.short_description,
        instructions: attributes.instructions,
        picture_url: attributes.picture_url,
        version: attributes.version,
        steps,
      },
    },
  };
};

/**
 * Builds submission payload for a single step (for saving drafts)
 */
export const buildStepSubmissionPayload = (
  config: ProductConfiguration,
  stepIndex: number,
  formValues: Record<string, any>,
): SubmissionPayload => {
  return buildSubmissionPayload(config, formValues, true, stepIndex);
};

export const useProductSubmissionStore = create<ProductSubmissionState>()(
  (set, get) => ({
    // Initial state
    submitting: false,
    submitError: null,
    submitStatusCode: null,
    submission: null,
    stepDrafts: {},
    savedSignatureUri: null,

    /**
     * Submit the full product application
     */
    submitProductApplication: async (
      config: ProductConfiguration,
      formValues: Record<string, any>,
      isDraft: boolean = true,
    ) => {
      set({ submitting: true, submitError: null, submitStatusCode: null });

      try {
        const payload = buildSubmissionPayload(config, formValues, isDraft);

        console.log(
          '📤 Submitting product application:',
          JSON.stringify(payload, null, 2),
        );

        const response = await axiosFinancingPrivate.post(
          '/submissions',
          payload,
        );

        const submissionData: SubmissionResponse =
          response.data?.data || response.data;

        set({
          submission: submissionData,
          submitting: false,
        });

        console.log('✅ Product submission successful:', submissionData);

        return submissionData;
      } catch (error: any) {
        const status = error?.response?.status ?? null;
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to submit product application';

        console.log('❌ Product submission failed:', message, error);

        set({
          submitError: message,
          submitStatusCode: status,
          submitting: false,
        });

        return null;
      }
    },

    /**
     * Submit a draft for a specific step
     */
    submitStepDraft: async (
      config: ProductConfiguration,
      stepIndex: number,
      formValues: Record<string, any>,
    ) => {
      set({ submitting: true, submitError: null, submitStatusCode: null });

      try {
        const payload = buildStepSubmissionPayload(
          config,
          stepIndex,
          formValues,
        );

        console.log(
          `📤 Saving draft for step ${stepIndex + 1}:`,
          JSON.stringify(payload, null, 2),
        );

        const response = await axiosFinancingPrivate.post(
          '/submissions',
          payload,
        );

        const submissionData: SubmissionResponse =
          response.data?.data || response.data;

        // Mark step as draft saved
        const step = config.attributes.steps?.[stepIndex];
        if (step) {
          set(state => ({
            stepDrafts: {
              ...state.stepDrafts,
              [step.step_id]: true,
            },
          }));
        }

        set({
          submission: submissionData,
          submitting: false,
        });

        console.log('✅ Step draft saved successfully:', submissionData);

        return submissionData;
      } catch (error: any) {
        const status = error?.response?.status ?? null;
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to save step draft';

        console.log('❌ Step draft save failed:', message, error);

        set({
          submitError: message,
          submitStatusCode: status,
          submitting: false,
        });

        return null;
      }
    },

    /**
     * Clear submission state
     */
    clearSubmission: () => {
      set({
        submission: null,
        submitError: null,
        submitStatusCode: null,
        submitting: false,
        stepDrafts: {},
        savedSignatureUri: null,
      });
    },

    /**
     * Set draft status for a step
     */
    setStepDraft: (stepId: string, isDraft: boolean) => {
      set(state => ({
        stepDrafts: {
          ...state.stepDrafts,
          [stepId]: isDraft,
        },
      }));
    },

    /**
     * Persist the signature URI across back-navigation
     */
    setSavedSignatureUri: (uri: string | null) => {
      set({ savedSignatureUri: uri });
    },

    /**
     * Clear only error states (useful after re-authentication)
     */
    clearErrors: () => {
      set({
        submitError: null,
        submitStatusCode: null,
      });
    },
  }),
);
