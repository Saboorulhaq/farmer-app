import { axiosFinancingPrivate } from '@/config/axios';

// Types
export interface FinancingRequest {
  id: string;
  product_config_ui_id: string;
  product_type: string;
  product_image: string | null;
  request_status: string;
  requested_by_user_id: string;
  is_requestor_farmer: boolean;
  amount: number;
  currency: string;
  program_id?: string;
  sanctioned_facility_limit?: number;
  total_outstanding?: number;
  reserved_total?: number;
  available_limit?: number;
  utilized_limit?: number;
  created_at: string;
  updated_at: string;
}

export interface FinancingRequestsResponse {
  data: FinancingRequest[];
}

// Marketplace Types
export interface MarketplaceOrder {
  id: string;
  transaction_type: string;
  transaction_number: string;
  counterparty_id: number | string;
  counterparty_name: string;
  transaction_date: string;
  due_date: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  raw_status: string;
  total_amount?: number;
  total_incl_tax?: number;
  balance_due?: number;
  delivery_method?: string;
  payment_method?: string;
  payable_via?: string | null;
  bank_credit_program_id?: string | null;
  product_submission_id: string | null;
  crop?: string | null;
  volume?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  expected_volume?: number | null;
  expected_volume_unit?: string | null;
  pickup_location?: string | null;
  sell_type?: string | null;
  agreement_confirmed?: boolean;
  authentication_confirmed?: boolean;
  otp_confirmed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyOrderDetail {
  transaction_type: string;
  transaction_number: string;
  transaction_date: string;
  due_date: string | null;
  amount: number;
  currency: string | null;
  status: string;
  raw_status: string;
  id: string;
  invoice_number: string;
  bill_to_name: string;
  invoice_date: string;
  sub_total: number;
  invoice_discount: number;
  total_amount: number;
  total_incl_tax: number;
  balance_due: number;
  delivery_method: string;
  payment_method: string;
  notes: string | null;
  shipping_address: string | null;
  product_submission_id: string | null;
  provider: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone_number: string;
  };
  line_items: {
    id: string;
    catalogue_item_id: string;
    item_number: number;
    item_name: string;
    unit_price: number;
    quantity: number;
    quantity_unit: string;
    unit: string;
    total_amount: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface SaleOrderDetail {
  id: string;
  transaction_type: string;
  transaction_number: string;
  transaction_date: string;
  due_date: string | null;
  amount: number | null;
  total: number | null;
  currency: string | null;
  status: string;
  raw_status: string;
  product_submission_id: string | null;
  buyer: {
    id: string;
    name: string;
    email?: string | null;
  };
  shipping_address: string | null;
  delivery: string | null;
  expected_delivery_date: string | null;
  payable_via: string | null;
  expected_payment_date: string | null;
  line_items: {
    id?: string;
    item_number?: number;
    item_name?: string;
    unit_price?: number | null;
    quantity?: number | null;
    quantity_unit?: string | null;
    total_amount?: number | null;
  }[];
  crop: string | null;
  volume: number | null;
  unit: string | null;
  unit_price: number | null;
  expected_volume: number | null;
  expected_volume_unit: string | null;
  expected_yield: number | null;
  expected_yield_unit: string | null;
  pickup_location: string | null;
  sell_type: string | null;
  agreement_confirmed: boolean;
  authentication_confirmed: boolean;
  otp_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActiveFinanceProgram {
  id: string;
  product_config_ui_id: string;
  facility_code: string;
  sanctioned_facility_limit: number;
  available_limit?: number;
  utilized_limit?: number;
  total_outstanding: number;
  reserved_total: number;
  currency: string;
  status: string;
  valid_from: string;
  valid_until: string;
  program_version: string;
  name: string;
  lender_name: string;
  description: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveFinanceProgramsResponse {
  data: ActiveFinanceProgram[];
}

export interface OrderKeyTermsResponse {
  key_terms: {
    description?: string;
    parties_involved?: {
      farmer_name?: string;
      farm_location?: string;
      buyer_name?: string;
      buyer_location?: string;
    };
    contract_breakdown?: {
      product_type?: string;
      committed_volume?: string;
      delivery_window?: string;
      delivery_location?: string;
      forward_price?: string;
    };
    payment_terms?: {
      payment?: string;
      inspection?: string;
    };
    obligations?: string;
  };
  agreement_document_url?: string;
}

// Helpers
const CURRENCY_SYMBOLS: Record<string, string> = {
  PKR: 'Rs',
  GHS: 'Rs',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function formatProductType(productType: string): string {
  // "bank_credit_facility" → "Bank Credit"
  // "Bank Credit Facility" → "Bank Credit"
  const cleaned = productType.replace(/_/g, ' ');
  // Remove "Facility" suffix and trim
  const withoutFacility = cleaned.replace(/\bfacility\b/i, '').trim();
  // Title-case each word
  return withoutFacility
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatSubmittedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export type StatusCategory = 'approved' | 'pending' | 'rejected' | 'other';

export function getStatusCategory(status: string): StatusCategory {
  const lower = status.toLowerCase();
  if (lower === 'approved' || lower === 'offer accepted') return 'approved';
  if (lower === 'rejected') return 'rejected';
  if (lower === 'submitted' || lower === 'pending' || lower === 'in review') return 'pending';
  return 'other';
}

export function getStatusLabel(status: string): string {
  const lower = status.toLowerCase();
  if (lower === 'approved') return 'Approved';
  if (lower === 'offer accepted') return 'Accepted';
  if (lower === 'rejected') return 'Rejected';
  if (lower === 'submitted' || lower === 'pending') return 'Pending';
  return status;
}

// Avatar color by index
const AVATAR_COLORS = ['#4CAF50', '#E91E63', '#FF9800', '#2196F3', '#9C27B0', '#009688'];
export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// Service
export const transactionsService = {
  getFinancingRequests: async (): Promise<FinancingRequestsResponse> => {
    const response = await axiosFinancingPrivate.get<FinancingRequestsResponse>(
      '/farmers/transactions/farmer-financing-requests',
    );
    return response.data;
  },

  getMarketplaceOrders: async (
    transactionType: 'purchase_order' | 'sale_order',
  ): Promise<{ data: MarketplaceOrder[] }> => {
    const response = await axiosFinancingPrivate.get('/transaction/farmer', {
      params: { transaction_type: transactionType },
    });
    return response.data;
  },

  getOrderDetail: async (
    orderId: string,
    transactionType: 'purchase_order' | 'sale_order',
  ): Promise<{ data: BuyOrderDetail | SaleOrderDetail }> => {
    const response = await axiosFinancingPrivate.get(
      `/transaction/farmer/${orderId}`,
      { params: { transaction_type: transactionType } },
    );
    return response.data;
  },

  getOrderKeyTerms: async (
    orderId: string,
    transactionType: string,
  ): Promise<{ data: OrderKeyTermsResponse }> => {
    const response = await axiosFinancingPrivate.get(
      `/transaction/farmer/${orderId}/key_terms`,
      { params: { transaction_type: transactionType } },
    );
    return response.data;
  },

  confirmMarketplaceOrder: async (
    transactionType: 'purchase_order' | 'sale_order',
    transactionId: string,
  ): Promise<any> => {
    const response = await axiosFinancingPrivate.post('/transaction/farmer', {
      transaction_type: transactionType,
      transaction_id: transactionId,
      otp_confirmed: true,
    });
    return response.data;
  },

  getActiveFinancePrograms: async (): Promise<ActiveFinanceProgramsResponse> => {
    const response = await axiosFinancingPrivate.get<ActiveFinanceProgramsResponse>(
      '/farmers/transactions/programs',
    );
    return response.data;
  },
};
