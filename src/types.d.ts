declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '@env' {
  export const API_URL: string;
  export const API_DOCUMENTS_URL: string;
  export const API_MRZ_URL: string;
  export const API_CNIC_OCR_URL: string;
  export const API_X_API_KEY: string;
  export const API_FARMER_FINANCING_URL: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const SENTRY_DNS: string;
  export const COUNTRY: string;
  export const DEBUG_GHANA_CARD: string;
  export const DEBUG_PIN: string;
}
