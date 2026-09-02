import { ImageSourcePropType } from 'react-native';
import type { FarmerIdCardDetails } from '@/store/useFarmerIdCardStore';
import type { AuthFarmDetails } from '@/store/useRegisterStore';

/**
 * Fixtures used to fast-forward the farmer self-registration flow while the app
 * is in Debug Mode (useDebugStore.isDebugMode). In debug mode every screen is
 * prefilled and NO network calls are made — the user just presses "Next".
 *
 * front.jpeg / back.jpeg are placeholder NADRA card images; replace them with
 * the real sample images at src/assets/images/.
 */
export const DEBUG_FRONT_IMAGE: ImageSourcePropType = require('@/assets/images/front.jpeg');
export const DEBUG_BACK_IMAGE: ImageSourcePropType = require('@/assets/images/back.jpeg');

// Sentinel values stored as the "captured" base64 so the ID screen's preview
// renders and CONFIRM enables. Never sent anywhere while in debug mode.
export const DEBUG_FRONT_BASE64 = 'debug-front-image';
export const DEBUG_BACK_BASE64 = 'debug-back-image';

// OTP auto-filled on the registration OTP screen.
export const DEBUG_OTP = '123456';

// CNIC OCR result (mirrors a real /identity-documents/extract response).
export const DEBUG_CARD_DETAILS: NonNullable<FarmerIdCardDetails> = {
  success: true,
  document_layout: 'old',
  identity_number: '35202-6787205-9',
  ghana_card_number: '35202-6787205-9',
  address: 'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  issue_date: '2009-03-31',
  expiry_date: '2019-03-31',
  full_name_native: 'محمد رمضان',
  parent_or_spouse_name: 'Fazal Muhammad',
  parent_or_spouse_name_native: '',
  present_address_native: 'مکان نمبر 7/8 محلہ ایم بلاک گلبرگ 111 لاہور',
  present_address_romanized:
    'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  permanent_address_native: 'مکان نمبر 7/8 محلہ ایم بلاک گلبرگ 111 لاہور',
  permanent_address_romanized:
    'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  document_info: {
    country_code: 'PAK',
    date_of_issue: '2009-03-31',
    date_of_expiry: '2019-03-31',
    document_number: '35202-6787205-9',
    document_type: 'CNIC',
  },
  personal_info: {
    date_of_birth: '1939-01-01',
    first_name: 'Muhammad',
    full_name: 'Muhammad Ramzan',
    full_name_native: 'محمد رمضان',
    father_or_husband_name: 'Fazal Muhammad',
    father_or_husband_name_native: 'فضل محمد',
    nationality: 'Pakistani',
    other_names: null,
    sex: 'M',
    surname: 'Ramzan',
  },
  raw_mrz: '',
};

// Contact + security fields the CNIC scan can't provide (needed for a valid form).
export const DEBUG_USER_CONTACT = {
  phone_number: '+92 300 123 4567',
  email: 'debug.farmer@fauree.com',
  residential_address: 'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  pin: '256256',
};

// Farm details prefilled on the farm-details screen (uses a hardcoded address).
export const DEBUG_FARM_DETAILS: AuthFarmDetails = {
  ownsFarm: 'owned',
  primaryCrops: 'Maize',
  secondaryCrops: 'Soybean',
  farmSize: '5',
  farmSizeUnit: 'acres',
  gpsNumber: '',
  addressLine: 'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  agree: true,
  lat: null,
  long: null,
  accuracy: null,
};
