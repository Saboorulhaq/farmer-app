import { create } from 'zustand';

interface FarmerIdCardState {
  frontBase64: string | null;
  backBase64: string | null;
  cardDetails: {
    success?: boolean;
    document_layout?: string;
    identity_number?: string;
    document_info: {
      country_code: string;
      date_of_issue?: string;
      date_of_expiry: string;
      document_number: string;
      document_type: string;
    };
    ghana_card_number: string;
    address?: string;
    issue_date?: string;
    expiry_date?: string;
    full_name_native?: string;
    parent_or_spouse_name?: string;
    parent_or_spouse_name_native?: string;
    present_address_native?: string;
    present_address_romanized?: string;
    permanent_address_native?: string;
    permanent_address_romanized?: string;
    personal_info: {
      date_of_birth: string;
      first_name: string;
      full_name: string;
      full_name_native?: string;
      father_or_husband_name?: string;
      father_or_husband_name_native?: string;
      nationality: string;
      other_names: string | null;
      sex: string;
      surname: string;
    };
    verification?: {
      status?: string;
      reasons?: string[];
      uncertain_fields?: string[];
    };
    raw_mrz?: string;
  } | null;
  setFrontBase64: (val: string) => void;
  setBackBase64: (val: string) => void;
  setCardDetails: (val: FarmerIdCardState['cardDetails']) => void;
  reset: () => void;
}

export type FarmerIdCardDetails = FarmerIdCardState['cardDetails'];

export const useFarmerIdCardStore = create<FarmerIdCardState>(set => ({
  frontBase64: null,
  backBase64: null,
  cardDetails: null,
  setFrontBase64: val => set({ frontBase64: val }),
  setBackBase64: val => set({ backBase64: val }),
  setCardDetails: val => set({ cardDetails: val }),
  reset: () => set({ frontBase64: null, backBase64: null, cardDetails: null }),
}));
