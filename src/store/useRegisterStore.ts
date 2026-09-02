import { create } from 'zustand';

export interface AuthUserDetails {
  //basic details
  ghana_card_number: string;
  name: string;
  phone_number: string;
  email: string;
  residential_address: string;
  pin: string;
  confirm_pin: string;

  //helper
  primary_role: 'farmer' | 'agent' | 'farmer_as_agent';
  registration_mode: 'self';
  card_detected: boolean;
  details_changed: boolean;
  source_flow: 'farmer' | 'agent' | 'farmer_as_agent';

  //card details
  country_code: string;
  issue_date: string;
  expiry_date: string;
  date_of_birth: string;
  first_name: string;
  full_name: string;
  full_name_native: string;
  parent_or_spouse_name: string;
  parent_or_spouse_name_native: string;
  nationality: string;
  other_names: string;
  sex: string;
  surname: string;
  present_address_native: string;
  present_address_romanized: string;
  permanent_address_native: string;
  permanent_address_romanized: string;
  document_number: string;
  document_type: string;
  raw_mrz: string;
  front_image: string;
  back_image: string;
}

export interface AuthFarmDetails {
  ownsFarm: string;
  primaryCrops: string;
  secondaryCrops: string | null;
  farmSize: string;
  farmSizeUnit: string;
  gpsNumber: string;
  addressLine: string;
  agree: boolean;
  lat: number | null;
  long: number | null;
  accuracy: number | null;
}

const initialUserDetails: AuthUserDetails = {
  //basic details
  ghana_card_number: '',
  name: '',
  phone_number: '',
  email: '',
  residential_address: '',
  pin: '',
  confirm_pin: '',

  //helper
  primary_role: 'farmer',
  registration_mode: 'self',
  card_detected: false,
  details_changed: false,
  source_flow: 'farmer',

  //card details
  country_code: '',
  first_name: '',
  issue_date: '',
  expiry_date: '',
  full_name: '',
  full_name_native: '',
  parent_or_spouse_name: '',
  parent_or_spouse_name_native: '',
  date_of_birth: '',
  nationality: '',
  other_names: '',
  sex: '',
  surname: '',
  present_address_native: '',
  present_address_romanized: '',
  permanent_address_native: '',
  permanent_address_romanized: '',
  document_number: '',
  document_type: '',
  raw_mrz: '',

  front_image: '',
  back_image: '',
};
const initialFarmDetails: AuthFarmDetails = {
  ownsFarm: '',
  primaryCrops: '',
  secondaryCrops: null,
  farmSize: '',
  farmSizeUnit: '',
  gpsNumber: '',
  addressLine: '',
  agree: false,
  lat: null,
  long: null,
  accuracy: null,
};

interface RegisterState {
  loading: boolean;
  userDetails: AuthUserDetails;
  farmDetails: AuthFarmDetails;
  phoneNumberChanged: boolean;
  switchAccountRequested: boolean;
  role: 'farmer' | 'agent' | 'farmer_as_agent';
  setLoading: (loading: boolean) => void;
  setPhoneNumberChanged: (phoneNumberChanged: boolean) => void;
  setSwitchAccountRequested: (switchAccountRequested: boolean) => void;
  updateUserDetails: (values: AuthUserDetails) => void;
  updateFarmDetails: (values: AuthFarmDetails) => void;
  updateUserDetailsField: (
    fieldname: keyof AuthUserDetails,
    value: string,
  ) => void;
  resetUserDetails: () => void;
  setRole: (role: 'farmer' | 'agent' | 'farmer_as_agent') => void;
}

export const useRegisterStore = create<RegisterState>()((set, get) => ({
  loading: false,
  userDetails: initialUserDetails,
  farmDetails: initialFarmDetails,
  phoneNumberChanged: false,
  switchAccountRequested: false,
  role: 'farmer',

  setLoading: (loading: boolean) => {
    set({ loading });
  },
  setPhoneNumberChanged: (phoneNumberChanged: boolean) => {
    set({ phoneNumberChanged });
  },
  setSwitchAccountRequested: (switchAccountRequested: boolean) => {
    set({ switchAccountRequested });
  },
  updateUserDetails: (values: AuthUserDetails) => {
    const { userDetails } = get();
    set({
      userDetails: {
        ...userDetails,
        ...values,
      },
    });
  },
  updateFarmDetails: (values: AuthFarmDetails) => {
    const { farmDetails } = get();
    set({
      farmDetails: {
        ...farmDetails,
        ...values,
      },
    });
  },
  updateUserDetailsField: (
    fieldname: keyof AuthUserDetails,
    value: string | boolean,
  ) => {
    const { userDetails } = get();
    set({
      userDetails: {
        ...userDetails,
        [fieldname]: value,
      },
    });
  },

  resetUserDetails: () => {
    set({ userDetails: initialUserDetails });
    set({ farmDetails: initialFarmDetails });
  },

  setRole: (role: 'farmer' | 'agent' | 'farmer_as_agent') => {
    set({ role });
  },
}));
