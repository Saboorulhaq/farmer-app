import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { API_URL, API_FARMER_FINANCING_URL, API_DOCUMENTS_URL } from '@env';
import { getAuthToken, clearAuthToken } from '@/util/storage';
import { authEventEmitter, AUTH_LOGOUT_EVENT } from '@/util/navigationService';
import * as Sentry from '@sentry/react-native';
import { Toast } from 'toastify-react-native';

const API_BASE_URL = API_URL;
const API_FARMER_FINANCING_BASE_URL = API_FARMER_FINANCING_URL;
// Extract base URL without /auth suffix for general API calls
const API_V1_BASE_URL = API_BASE_URL.replace(/\/auth$/, '');
// Document endpoints include '/api/v1/...', so strip trailing '/api/v1' from base.
// Prefer financing API base URL to align document upload with product service.
const API_DOCUMENTS_BASE_URL = (
  API_FARMER_FINANCING_BASE_URL || API_DOCUMENTS_URL || API_V1_BASE_URL
).replace(
  /\/api\/v1\/?$/,
  '',
);

console.log(API_BASE_URL);

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const axiosV1Private = axios.create({
  baseURL: API_V1_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const axiosFinancingPrivate = axios.create({
  baseURL: API_FARMER_FINANCING_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const axiosDocumentsPrivate = axios.create({
  baseURL: API_DOCUMENTS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosPrivate.interceptors.request.use(
  async config => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosV1Private.interceptors.request.use(
  async config => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosFinancingPrivate.interceptors.request.use(
  async config => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosDocumentsPrivate.interceptors.request.use(
  async config => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

const logRequest = async (config: InternalAxiosRequestConfig) => {
  const token = await getAuthToken();

  console.log(
    '\n📤 [AXIOS REQUEST]',
    `\n→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    `\n→ Params: ${JSON.stringify(config.params, null, 2)}`,
    `\n→ Headers: ${JSON.stringify(config.headers)}`,
    `\n→ Body: ${JSON.stringify(config.data, null, 2)}`,
  );
  if (token) console.log('→ Token:', token.slice(0, 20) + '...');
  return config;
};


const logResponse = (response: AxiosResponse) => {
  console.log(
    '\n📥 [AXIOS RESPONSE]',
    `\n← ${response.config.method?.toUpperCase()} ${response.config.url}`,
    `\n← Status: ${response.status}`,
    `\n← Data: ${JSON.stringify(response.data, null, 2)}`,
  );
  return response;
};

const logError = (error: any) => {
  // Automatically capture all axios errors in Sentry
  Sentry.captureException(error);

  if (error.response) {
    console.log(
      '\n❌ [AXIOS ERROR RESPONSE]',
      `\n← ${error.response.config?.method?.toUpperCase()} ${error.response.config?.url
      }`,
      `\n← Status: ${error.response.status}`,
      `\n← Data: ${JSON.stringify(error.response.data, null, 2)}`,
    );
  } else if (error.request) {
    console.log('\n🚫 [AXIOS ERROR REQUEST] No response received');
  } else {
    console.log('\n⚠️ [AXIOS ERROR] Setup:', error.message);
  }
  return Promise.reject(error);
};

// Handle 401 Unauthorized errors globally
const handle401Error = async (error: AxiosError) => {
  // Only handle 401 errors
  if (error.response?.status === 401) {
    console.log('\n🔒 [AXIOS 401] Unauthorized - Session expired, logging out user');

    try {
      // Show user-friendly session expiration message
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Your session has expired. Please log in again to continue.',
      });

      await clearAuthToken();

      // Emit logout event to notify auth context
      // The auth context will call handleLogout() which sets currentAuthedRole to null
      // This will cause AppNavigator to re-render and show Splash screen automatically
      authEventEmitter.emit(AUTH_LOGOUT_EVENT);

      // No need to manually reset navigation - the AppNavigator will automatically
      // re-render when currentAuthedRole becomes null and show the Splash screen
    } catch (logoutError) {
      console.log('Error during logout:', logoutError);
      Sentry.captureException(logoutError);
    }

    // Mark error as handled globally to prevent duplicate handling in components
    (error as any).__handledGlobally = true;
  }

  // Re-throw the error so it can still be handled by individual catch blocks if needed
  // Components should check error.__handledGlobally to skip handling if already handled
  return Promise.reject(error);
};

const attachLogger = (instance: AxiosInstance) => {
  instance.interceptors.request.use(logRequest, logError);
  instance.interceptors.response.use(logResponse, logError);
};

// Attach 401 error handler to all private axios instances
const attach401Handler = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      await handle401Error(error);
      return Promise.reject(error);
    },
  );
};

attachLogger(axiosPublic);
attachLogger(axiosPrivate);
attachLogger(axiosV1Private);
attachLogger(axiosFinancingPrivate);
attachLogger(axiosDocumentsPrivate);

attach401Handler(axiosPrivate);
attach401Handler(axiosV1Private);
attach401Handler(axiosFinancingPrivate);
attach401Handler(axiosDocumentsPrivate);
