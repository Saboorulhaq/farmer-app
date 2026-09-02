import { create } from 'zustand';
import { axiosFinancingPrivate } from '@/config/axios';
import { useDebugStore } from '@/store/useDebugStore';

type ProductAttributes = {
  name: string;
  code?: string;
  slug: string;
  short_description?: string;
  picture_url?: string;
  disabled?: boolean;
  status?: string;
};

type ProductInstructions = {
  why_apply_with_us?: string[];
  eligibility_criteria?: string[];
};

export type FSAStepMetadata = {
  icon?: string;
  trigger_condition?: {
    step_number: number;
    field_key: string;
    operator: string;
    value: any;
  };
};

export type FSAExternalApiConfig = {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response_key: string;
  item_identifier?: string;
  item_display?: string;
  display_fields?: Record<string, string>;
  query_params?: Record<string, string>;
};

export type FSASection = {
  section_id: string;
  title: string;
  identifier: string;
  description?: string | null;
  icon?: string | null;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  data_source?: string;
  external_api_config?: FSAExternalApiConfig;
  metadata?: any;
  fields?: ProductConfigurationField[];
};

export type FSAStep = {
  step_id: string;
  step_number: number;
  title: string;
  identifier: string;
  description?: string | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  metadata?: FSAStepMetadata;
  sections?: FSASection[];
};

export type ProductConfigurationAttributes = {
  product_id?: string;
  name: string;
  code?: string;
  slug: string;
  short_description?: string;
  instructions?: ProductInstructions;
  picture_url?: string;
  steps?: ProductConfigurationStep[];
  fsa_steps?: FSAStep[];
  status?: string;
  submission_id?: string;
  version?: number;
};

export type ProductConfigurationStep = {
  step_id: string;
  step_number: number;
  title: string;
  identifier: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  metadata: {
    icon?: string;
    estimated_time?: string;
  };
  sections?: ProductConfigurationSection[];
  status?: 'not_started' | 'in_progress' | 'completed' | string | null;
  is_draft?: boolean;
};

export type ProductConfigurationSection = {
  section_id: string;
  title: string;
  identifier?: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  metadata?: any;
  fields?: ProductConfigurationField[];
  data_source?: 'static' | 'external_api';
  external_api_config?: {
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    response_key?: string;
    api_endpoints?: {
      create_presigned_url?: {
        method: string;
        endpoint: string;
        description?: string;
      };
      list_documents?: {
        method: string;
        endpoint: string;
        description?: string;
      };
      get_document?: {
        method: string;
        endpoint: string;
        description?: string;
      };
      delete_document?: {
        method: string;
        endpoint: string;
        description?: string;
      };
    };
  };
};

export type ValidationRules = {
  presence?: boolean;
  type?: 'number' | 'boolean' | 'date' | 'string';
  must_be_true?: boolean;
  min?: number;
  max?: number;
  divisible_by?: number;
  precision?: number;
  min_length?: number;
  max_length?: number;
  safe_length_threshold?: number;
  pattern?: string;
  allowed_values?: any[];
  min_selections?: number;
  max_date?: string;
  min_date?: string;
  // Edge case validation rules
  ascii_only?: boolean;
  allowed_characters?: string;
  positive_only?: boolean;
  file_types?: string[];
  max_size_mb?: number;
  validation_messages?: Record<string, string>;
};

export type ProductConfigurationField = {
  field_key: string;
  field_type: string;
  label: string;
  placeholder?: string | null;
  helper_text?: string | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  validation_rules?: ValidationRules;
  field_config?: {
    unit?: string;
    currency?: boolean;
    allowed_types?: string[];
    max_size_mb?: number;
    display_format?: string;
    [key: string]: any;
  };
  conditional_logic?: any;
  metadata?: any;
  options?: any[];
  value?: any;
  data_source?: 'static' | 'external_api';
  external_api_config?: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    response_key: string;
    item_identifier?: string;
    item_display?: string;
    display_fields?: Record<string, string>;
    query_params?: Record<string, string>;
  };
};

export type ProductConfiguration = {
  id?: string;
  type?: string;
  attributes: ProductConfigurationAttributes;
  submission_id?: string;
  status?: string;
};

export type Product = {
  id: string;
  type?: string;
  attributes: ProductAttributes;
};

interface ProductsState {
  loading: boolean;
  error: string | null;
  statusCode: number | null;
  products: Product[];
  fetchProducts: () => Promise<void>;
  config: ProductConfiguration | null;
  configLoading: boolean;
  configError: string | null;
  configStatusCode: number | null;
  fetchProductConfig: (slug: string, forceRefresh?: boolean) => Promise<void>;
  submissionId: string | null;
  submissionStatus: string | null;
  setSubmissionStatus: (status: string | null) => void;
  setSubmissionId: (id: string | null) => void;
  // Reset functions for clearing state on logout/login
  clearErrors: () => void;
  resetStore: () => void;
}

export const useProductsStore = create<ProductsState>()(set => ({
  loading: false,
  error: null,
  statusCode: null,
  products: [],
  submissionId: null,
  submissionStatus: null,
  setSubmissionStatus: (status: string | null) => set({ submissionStatus: status }),
  setSubmissionId: (id: string | null) => set({ submissionId: id }),
  
  // Clear only error states (useful after re-authentication)
  clearErrors: () => set({
    error: null,
    statusCode: null,
    configError: null,
    configStatusCode: null,
  }),
  
  // Full store reset (useful on logout)
  resetStore: () => set({
    loading: false,
    error: null,
    statusCode: null,
    products: [],
    config: null,
    configLoading: false,
    configError: null,
    configStatusCode: null,
    submissionId: null,
    submissionStatus: null,
  }),
  
  fetchProducts: async () => {
    set({ loading: true, error: null, statusCode: null });
    try {
      const res = await axiosFinancingPrivate.get('/products/');
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      const products: Product[] = items.map((item: any) => ({
        id: item?.id,
        type: item?.type,
        attributes: {
          name: item?.attributes?.name ?? '',
          code: item?.attributes?.code,
          slug: item?.attributes?.slug ?? '',
          short_description: item?.attributes?.short_description,
          picture_url: item?.attributes?.picture_url,
          status: item?.attributes?.status,
        },
      }));
      set({ products });
    } catch (error: any) {
      const status = error?.response?.status ?? null;
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load products';
      // Don't set statusCode for 401 if already handled globally by axios interceptor
      // This prevents duplicate logout handling in components
      if (status === 401 && (error as any).__handledGlobally) {
        console.log('401 error already handled globally, skipping statusCode update');
        set({ error: message });
      } else {
        set({ error: message, statusCode: status });
      }
    } finally {
      set({ loading: false });
    }
  },

  config: null,
  configLoading: false,
  configError: null,
  configStatusCode: null,
  fetchProductConfig: async (slug: string, forceRefresh: boolean = false) => {
    // Get current state to check if we already have this config
    const currentConfig = useProductsStore.getState().config;

    // Skip fetch if we already have the config for this slug (unless forceRefresh is true)
    if (!forceRefresh && currentConfig?.attributes?.slug === slug) {
      return;
    }

    // Debug Mode: load the bank-credit config from the bundled JSON (no API).
    if (
      useDebugStore.getState().isDebugMode &&
      slug === 'bank-credit-facility'
    ) {
      const raw = require('@/config/procut-config-response.json');
      const cfg = Array.isArray(raw) ? raw[0] : raw?.data ?? raw;
      set({
        config: cfg,
        submissionId: null,
        submissionStatus: null,
        configLoading: false,
        configError: null,
        configStatusCode: null,
      });
      return;
    }


    set({ configLoading: true, configError: null, configStatusCode: null });
    try {
      const res = await axiosFinancingPrivate.get(
        `/product_configurations/${slug}`,
      );
      const cfg: ProductConfiguration | null =
        res.data?.data ?? res.data ?? null;
      
      // Extract submission_id and status from attributes (that's where API returns them)
      const submissionId = cfg?.attributes?.submission_id || null;
      const submissionStatus = cfg?.attributes?.status || null;
      
      set({ config: cfg, submissionId, submissionStatus });
    } catch (error: any) {
      const status = error?.response?.status ?? null;
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to load product configuration';
      // Don't set configStatusCode for 401 if already handled globally by axios interceptor
      // This prevents duplicate logout handling in components
      if (status === 401 && (error as any).__handledGlobally) {
        console.log('401 error already handled globally, skipping configStatusCode update');
        set({ configError: message });
      } else {
        set({ configError: message, configStatusCode: status });
      }
    } finally {
      set({ configLoading: false });
    }
  },
}));

