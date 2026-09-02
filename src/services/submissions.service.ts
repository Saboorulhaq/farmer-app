import { axiosFinancingPrivate } from '@/config/axios';

// Types
export interface Submission {
  submission_id: string;
  status: string;
  loan_amount: number | null;
  loan_duration: string | null;
  loan_type: string | null; // Deprecated, use transaction_type
  transaction_type?: string; // New field replacing loan_type
  farm_number: string | null;
  product_slug: string;
  submitted_at: string | null;
  created_at: string;
  selected_input_category?: string;
  selected_input_type?: string;
  rejection_note: string | null;
  // Sell-harvest specific fields
  crop?: string;
  volume?: number;
  unit?: string;
  sell_type?: string;
}

export interface SubmissionsResponse {
  data: Submission[];
}

export interface FacilitySummary {
  loan_amount: number;
  loan_duration?: string;
  loan_type: string;
  farm_number?: string;
  selected_input_category?: string;
  selected_input_type?: string;
}

export interface NextStep {
  title: string;
  status: 'in_progress' | 'pending' | 'completed';
  order: number;
}

export interface NextSteps {
  steps: NextStep[];
}

// Progress Tracker types (new API response)
export interface ProgressStep {
  title: string;
  status: 'In Progress' | 'Pending' | 'Completed';
  description: string;
  started_tag: string | null;
  order: number;
}

export interface ProgressTracker {
  steps: ProgressStep[];
}

export interface HarvestSummary {
  crop: string;
  volume: number;
  unit: string;
  sell_type: string;
}

export interface SubmissionStatusAttributes {
  submission_id: string;
  facility_summary?: FacilitySummary;
  harvest_summary?: HarvestSummary;
  current_status?: string;
  submitted_date: string | null;
  next_steps?: NextSteps | string[];
  progress_tracker?: ProgressTracker;
  fsa_linked?: boolean;
  can_refresh: boolean;
  product_slug?: string;
  rejection_note: string | null;
  status?: string;
}

export interface SubmissionStatusResponse {
  data: {
    id: string;
    type: string;
    attributes: SubmissionStatusAttributes;
  };
}

export interface FacilityDetails {
  loan_amount: number;
  facility_type: string;
  tenure: string;
  intended_purpose: string[];
  intended_purpose_description: string | null;
  linked_to_fsa: boolean;
}

export interface PersonalDetails {
  residence_type: string | null;
  gps_address: string | null;
  cooperative_membership: string | boolean | null;
}

export interface FarmReference {
  farm_id: string;
}

export interface FarmDetails {
  farms: FarmReference[];
  can_add_farm: boolean;
}

export interface HarvestDetails {
  // For loan products
  crop_financed?: string;
  expected_volume?: number;
  unit?: string;
  expected_price?: number | null;
  borrowing_information?: string | null;
  selected_produce?: string;
  expected_volume_unit?: string;
  expected_selling_price_per_unit?: number | null;
  expected_grade?: string;
  // For sell-harvest product
  crop?: string;
  expected_yield?: number;
  expected_yield_unit?: string;
  pickup_location?: string;
  sell_type?: string;
  buyer?: string;
  volume?: number;
  unit_price?: number;
}

// Buy Inputs specific types
export interface ProviderDetails {
  provider_id: string;
  provider_name: string | null;
}

export interface PurchaseDetails {
  inputs_required: string;
  selected_variety: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
}

export interface CartItem {
  selected_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  quantity_unit: string;
  total_price: number;
  currency_symbol: string;
  provider_id: string;
  provider_name: string;
}

export interface CartDetails {
  item_count: number;
  invoice_discount: number;
  total: number;
  total_incl_tax: number;
  currency_symbol: string;
}

export interface CartSummary {
  cart_items: CartItem[];
  cart_details: CartDetails;
}

export interface CheckoutDetailSummary {
  bill_to: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  price: number;
  currency_symbol: string;
}

export interface CheckoutTotalSummary {
  sub_total: number;
  total: number;
  balance_due: number;
  currency_symbol: string;
}

export interface CheckoutDetails {
  checkout_detail_summary: CheckoutDetailSummary;
  checkout_total_summary: CheckoutTotalSummary;
  amount_requested: number | null;
  delivery_option?: string;
  delivery_address?: string;
}

export interface FSADetails {
  selected_buyer: string | null;
  committed_volume: string | null;
}

export interface SubmissionSummaryAttributes {
  submission_id: string;
  status: string;
  submitted_at: string | null;
  // Loan product fields
  facility_details?: FacilityDetails;
  personal_details?: PersonalDetails;
  farm_details?: FarmDetails;
  fsa_details?: FSADetails;
  // Buy inputs fields
  provider_details?: ProviderDetails;
  purchase_details?: PurchaseDetails;
  cart_summary?: CartSummary;
  checkout_details?: CheckoutDetails;
  // Common fields
  harvest_details?: HarvestDetails;
  is_readonly: boolean;
  product_slug: string;
  product_name: string;
  rejection_note: string | null;
}

export interface SubmissionSummaryResponse {
  data: {
    id: string;
    type: string;
    attributes: SubmissionSummaryAttributes;
  };
}

export interface Farm {
  uuid: string;
  ghana_post_gps_number: string;
  owns_farm: string;
  farm_size: number;
  farm_size_unit: string;
  primary_crop: string;
  secondary_crop: string;
}

export interface FarmsResponse {
  data: Farm[];
}

// API Service Functions
export const submissionsService = {
  // Get all submissions
  getAllSubmissions: async (): Promise<SubmissionsResponse> => {
    const response = await axiosFinancingPrivate.get<SubmissionsResponse>(
      '/submissions'
    );
    return response.data;
  },

  // Get submission status
  getSubmissionStatus: async (
    submissionId: string
  ): Promise<SubmissionStatusResponse> => {
    const response = await axiosFinancingPrivate.get<SubmissionStatusResponse>(
      `/submissions/${submissionId}?view=status`
    );
    return response.data;
  },

  // Get submission summary
  getSubmissionSummary: async (
    submissionId: string
  ): Promise<SubmissionSummaryResponse> => {
    const response = await axiosFinancingPrivate.get<SubmissionSummaryResponse>(
      `/submissions/${submissionId}?view=summary`
    );
    return response.data;
  },

  // Get all farms
  getAllFarms: async (): Promise<FarmsResponse> => {
    const response = await axiosFinancingPrivate.get<FarmsResponse>(
      '/farms'
    );
    return response.data;
  },

  // Get submission resume data (for resuming in-progress applications)
  getSubmissionResume: async (submissionId: string): Promise<any> => {
    const response = await axiosFinancingPrivate.get(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  // Delete a submission
  deleteSubmission: async (submissionId: string, force: boolean = true): Promise<void> => {
    await axiosFinancingPrivate.delete(
      `/submissions/${submissionId}?force=${force}`
    );
  },

  // Get lender offers for a submission
  getLenderOffers: async (
    submissionId: string
  ): Promise<LenderOffersResponse> => {
    const response = await axiosFinancingPrivate.get<LenderOffersResponse>(
      `/submissions/${submissionId}/lender-offers`
    );
    return response.data;
  },

  // Get lender offer details for a submission
  getLenderOfferDetails: async (
    submissionId: string
  ): Promise<LenderOfferDetailsResponse> => {
    const response = await axiosFinancingPrivate.get<LenderOfferDetailsResponse>(
      `/submissions/${submissionId}/lender-offers?view=details`
    );
    return response.data;
  },

  // Accept a lender offer
  acceptLenderOffer: async (
    submissionId: string,
    offerId: string
  ): Promise<void> => {
    await axiosFinancingPrivate.post(
      `/submissions/${submissionId}/lender-offers/${offerId}/accept`
    );
  },

  // Get key terms for a lender offer
  getLenderOfferKeyTerms: async (
    submissionId: string,
    offerId: string
  ): Promise<LenderOfferKeyTermsResponse> => {
    const response = await axiosFinancingPrivate.get<LenderOfferKeyTermsResponse>(
      `/submissions/${submissionId}/lender-offers/${offerId}/key-terms`
    );
    return response.data;
  },

  // Confirm agreement for a lender offer
  confirmLenderAgreement: async (
    submissionId: string,
    offerId: string
  ): Promise<void> => {
    await axiosFinancingPrivate.post(
      `/submissions/${submissionId}/lender-offers/${offerId}/confirm-agreement`,
      { agreement_accepted: true }
    );
  },

  // Confirm authentication (signature) for a lender offer
  confirmLenderAuthentication: async (
    submissionId: string,
    offerId: string,
    documentId: string
  ): Promise<void> => {
    await axiosFinancingPrivate.post(
      `/submissions/${submissionId}/lender-offers/${offerId}/confirm-authentication`,
      { signature_image: documentId, consent_given: true }
    );
  },

  // Confirm OTP for a lender offer
  confirmLenderOtp: async (
    submissionId: string,
    offerId: string
  ): Promise<void> => {
    await axiosFinancingPrivate.post(
      `/submissions/${submissionId}/lender-offers/${offerId}/confirm-otp`,
      { otp_verified: true }
    );
  },
};

// Lender Offer Key Terms response
export interface LenderOfferKeyTermsResponse {
  data: {
    key_terms: Record<string, any>;
    agreement_document_url?: string;
  };
}

// Lender Offer types
export interface LenderOffer {
  id: string;
  lender_name: string;
  provider_name: string | null;
  buyer_name: string;
  tenure: string;
  interest_rate: string;
  interest_rate_type: string;
  repayment_frequency: string;
  penalty_charges_rate: string;
  loan_amount: string;
  net_disbursed_amount: string;
  total_interest: number;
  total_amount_to_be_repaid: number;
  number_of_installments: string;
  amount_of_each_installment: string;
  approved_limit: string;
  currency: string;
  processing_fee: string;
  offer_expiry_date: string;
  offer_status: string;
  sanction_letter_url: string;
}

export interface LenderOffersResponse {
  data: LenderOffer[];
}

export interface LenderOfferFee {
  id: string;
  lender_offer_id: string;
  company_entity_id: string;
  fee_code: string;
  fee_type: string;
  fee_amount: number | null;
  fee_percent: string;
  payable_timing: string | null;
  calculation_basis: string | null;
  buyer_entity_id: string | null;
  supplier_entity_id: string | null;
  currency: string;
  taxable: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface LenderOfferDocument {
  id: string;
  lender_offer_id: string;
  document_code: string;
  blob_id: string | null;
  required: boolean;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LenderOfferDetail {
  id: string;
  line_request_id: string;
  lender_id: string;
  financing_participation_percent: string;
  product_config_ui_id: string;
  offer_code: string;
  offer_version: string;
  approved_limit: string;
  currency: string;
  offer_terms: {
    interest_rate: number;
    interest_rate_type: string;
    repayment_frequency: string;
  };
  status: string;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
  facilities: any[];
  fees: LenderOfferFee[];
  participants: any[];
  documents: LenderOfferDocument[];
}

export interface LenderOfferDetailsResponse {
  data: LenderOfferDetail[];
}

