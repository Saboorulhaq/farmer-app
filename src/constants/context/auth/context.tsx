import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { getAuthToken, clearAuthToken, setAuthToken as setStoredAuthToken, setBiometricAuthToken, getBiometricAuthToken, clearBiometricAuthToken, updateBiometricToken, type BiometricTokenResult } from '@/util/storage';

import { authEventEmitter, AUTH_LOGOUT_EVENT } from '@/util/navigationService';
import { useProductsStore } from '@/store/useProductsStore';
import { useProductSubmissionStore } from '@/store/useProductSubmissionStore';
import { axiosPublic } from '@/config/axios';

export interface CardDetails {
  card_number: string;
  name: string;
  status?: 'locked' | 'active';
}

interface AuthContextType {
  isLoggedIn: boolean;
  authToken: string | null;
  trustedFarmerCard: CardDetails | null;
  trustedAgentCard: CardDetails | null;
  currentAuthedRole: 'farmer' | 'agent' | null;
  loading: boolean;

  checkAuth: () => Promise<void>;
  setAuthToken: (token: string | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  handleLogout: () => Promise<void>;
  handleTrustedCard: (
    role: string,
    number: string,
    name: string,
  ) => Promise<void>;
  removeTrustedCard: (role: string) => Promise<void>;
  ensureTrustedCard: (
    role: string,
    number: string,
    name: string,
  ) => Promise<void>;
  updateCardStatus: (
    role: string,
    status: 'locked' | 'active',
  ) => Promise<void>;
  setCurrentAuthedRole: (role: 'farmer' | 'agent' | null) => void;

  getTrustedCard: (role: string) => CardDetails | null;
  getCardNumber: (role: string, fallback: string) => string;
  getCardName: (role: string) => string | null;
  isAccountLocked: (role: string) => boolean;
  hasTrustedActiveCard: (role: string) => boolean;
  biometricsAvailable: boolean;
  biometricEnabledForFarmer: boolean;
  biometricEnabledForAgent: boolean;
  isBiometricLoginEnabled: (role: string) => boolean;
  getBiometricCardNumber: (role: string) => string | null;
  enableBiometricLogin: (role: string, token: string, cardNumber?: string, credentials?: { pin: string; device_id: string }) => Promise<void>;
  enableBiometricLoginWithCurrentToken: (role: string) => Promise<boolean>;
  refreshBiometricToken: (role: string, token: string, credentials?: { ghana_card_number: string; pin: string; device_id: string }) => Promise<void>;
  disableBiometricLogin: (role: string) => Promise<void>;
  loginWithBiometrics: (role: string) => Promise<'success' | 'cancelled' | false>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [trustedFarmerCard, setTrustedFarmerCard] =
    useState<CardDetails | null>(null);
  const [trustedAgentCard, setTrustedAgentCard] = useState<CardDetails | null>(
    null,
  );
  const [currentAuthedRole, setCurrentAuthedRole] = useState<
    'farmer' | 'agent' | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricEnabledForFarmer, setBiometricEnabledForFarmer] =
    useState(false);
  const [biometricEnabledForAgent, setBiometricEnabledForAgent] =
    useState(false);
  const [biometricFarmerCard, setBiometricFarmerCard] = useState<string | null>(null);
  const [biometricAgentCard, setBiometricAgentCard] = useState<string | null>(null);

  // ✅ Load from storage
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const [
        token,
        farmerCard,
        agentCard,
        farmerBiometricFlag,
        agentBiometricFlag,
        farmerBioCard,
        agentBioCard,
        supportedBiometry,
      ] = await Promise.all([
        getAuthToken(),
        AsyncStorage.getItem('farmer_ghana_card'),
        AsyncStorage.getItem('agent_ghana_card'),
        AsyncStorage.getItem('farmer_biometric_enabled'),
        AsyncStorage.getItem('agent_biometric_enabled'),
        AsyncStorage.getItem('farmer_biometric_card'),
        AsyncStorage.getItem('agent_biometric_card'),
        Keychain.getSupportedBiometryType?.(),
      ]);

      setAuthToken(token);
      setTrustedFarmerCard(farmerCard ? JSON.parse(farmerCard) : null);
      setTrustedAgentCard(agentCard ? JSON.parse(agentCard) : null);
      setIsLoggedIn(!!token);
      setBiometricsAvailable(!!supportedBiometry);
      setBiometricFarmerCard(farmerBioCard);
      setBiometricAgentCard(agentBioCard);
      const farmerEnabled = farmerBiometricFlag === 'true';
      const agentEnabled = agentBiometricFlag === 'true';
      setBiometricEnabledForFarmer(farmerEnabled);
      setBiometricEnabledForAgent(agentEnabled);
    } catch (error) {
      console.log('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogoutEvent = async () => {
      await handleLogout();
    };

    authEventEmitter.on(AUTH_LOGOUT_EVENT, handleLogoutEvent);

    return () => {
      authEventEmitter.off(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle trusted card storage
  const handleTrustedCard = async (
    role: string,
    number: string,
    name: string,
  ) => {
    const newCard: CardDetails = {
      card_number: number,
      name,
      status: 'active',
    };

    try {
      const key = role === 'farmer' ? 'farmer_ghana_card' : 'agent_ghana_card';
      await AsyncStorage.setItem(key, JSON.stringify(newCard));

      if (role === 'farmer') setTrustedFarmerCard(newCard);
      else setTrustedAgentCard(newCard);
    } catch (error) {
      console.log('Error saving trusted card:', error);
    }
  };

  // ✅ Remove trusted card storage
  const removeTrustedCard = async (role: string) => {
    try {
      const key = role === 'farmer' ? 'farmer_ghana_card' : 'agent_ghana_card';
      await AsyncStorage.removeItem(key);

      if (role === 'farmer') setTrustedFarmerCard(null);
      else setTrustedAgentCard(null);
    } catch (error) {
      console.log('Error removing trusted card:', error);
    }
  };

  // ✅ Update card lock/active status
  const updateCardStatus = async (
    role: string,
    status: 'locked' | 'active',
  ) => {
    const card = getTrustedCard(role);
    if (!card) return;

    const updated = { ...card, status };
    const key = role === 'farmer' ? 'farmer_ghana_card' : 'agent_ghana_card';

    await AsyncStorage.setItem(key, JSON.stringify(updated));

    if (role === 'farmer') setTrustedFarmerCard(updated);
    else setTrustedAgentCard(updated);
  };

  // ✅ Ensure card is stored (only if not already)
  const ensureTrustedCard = async (
    role: string,
    number: string,
    name: string,
  ) => {
    const existing = getTrustedCard(role);
    if (!existing) {
      await handleTrustedCard(role, number, name);
    }
  };

  // ✅ Logout user
  const handleLogout = async () => {
    try {
      await clearAuthToken();
      setIsLoggedIn(false);
      setAuthToken(null);
      setCurrentAuthedRole(null);

      // Reset zustand stores to clear any stale state
      // This prevents "Failed to load application" errors after re-authentication
      useProductsStore.getState().resetStore();
      useProductSubmissionStore.getState().clearSubmission();
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  // ✅ Helpers
  const getTrustedCard = (role: string): CardDetails | null => {
    return role === 'farmer' ? trustedFarmerCard : trustedAgentCard;
  };

  const getCardNumber = (role: string, fallback: string): string => {
    const card = getTrustedCard(role);
    console.log('getCardNumber', card);
    return card?.card_number || fallback;
  };

  const getCardName = (role: string): string | null => {
    const card = getTrustedCard(role);
    return card?.name || null;
  };

  const isAccountLocked = (role: string): boolean => {
    const card = getTrustedCard(role);
    return card?.status === 'locked';
  };

  const hasTrustedActiveCard = (role: string): boolean => {
    const card = getTrustedCard(role);
    return !!card && card.status !== 'locked';
  };

  const isBiometricLoginEnabled = (role: string): boolean => {
    return role === 'farmer'
      ? biometricEnabledForFarmer
      : biometricEnabledForAgent;
  };

  const getBiometricCardNumber = (role: string): string | null => {
    return role === 'farmer' ? biometricFarmerCard : biometricAgentCard;
  };

  const enableBiometricLogin = async (
    role: string,
    token: string,
    cardNumber?: string,
    credentials?: { pin: string; device_id: string },
  ): Promise<void> => {
    try {
      const supportedBiometry = await Keychain.getSupportedBiometryType?.();
      if (!supportedBiometry) return;

      const resolvedCard = cardNumber || getTrustedCard(role)?.card_number || '';

      // Store login credentials so biometric can re-authenticate with a fresh token
      const valueToStore = credentials
        ? JSON.stringify({
            type: 'credentials',
            ghana_card_number: resolvedCard,
            pin: credentials.pin,
            device_id: credentials.device_id,
          })
        : token;

      const stored = await setBiometricAuthToken(valueToStore);
      if (!stored) {
        console.warn('Biometric token could not be stored; biometric login will not be available.');
        return;
      }

      const enabledKey =
        role === 'farmer'
          ? 'farmer_biometric_enabled'
          : 'agent_biometric_enabled';
      await AsyncStorage.setItem(enabledKey, 'true');

      // Store which card number the biometric belongs to
      if (resolvedCard) {
        const cardKey =
          role === 'farmer'
            ? 'farmer_biometric_card'
            : 'agent_biometric_card';
        await AsyncStorage.setItem(cardKey, resolvedCard);
        if (role === 'farmer') setBiometricFarmerCard(resolvedCard);
        else setBiometricAgentCard(resolvedCard);
      }

      if (role === 'farmer') setBiometricEnabledForFarmer(true);
      else setBiometricEnabledForAgent(true);
    } catch (error) {
      console.error('Error enabling biometric login:', error);
    }
  };

  const enableBiometricLoginWithCurrentToken = async (
    role: string,
  ): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) return false;
      await enableBiometricLogin(role, token);
      return true;
    } catch (error) {
      console.error('Error enabling biometric with current token:', error);
      return false;
    }
  };

  const refreshBiometricToken = async (
    role: string,
    token: string,
    credentials?: { ghana_card_number: string; pin: string; device_id: string },
  ): Promise<void> => {
    try {
      // If credentials provided, update stored value with fresh credentials
      const valueToStore = credentials
        ? JSON.stringify({
            type: 'credentials',
            ghana_card_number: credentials.ghana_card_number,
            pin: credentials.pin,
            device_id: credentials.device_id,
          })
        : token;
      await updateBiometricToken(valueToStore);
    } catch (error) {
      console.warn('[auth] Failed to silently refresh biometric token', error);
    }
  };

  const disableBiometricLogin = async (role: string): Promise<void> => {
    try {
      await clearBiometricAuthToken();

      const enabledKey =
        role === 'farmer'
          ? 'farmer_biometric_enabled'
          : 'agent_biometric_enabled';
      await AsyncStorage.setItem(enabledKey, 'false');

      const cardKey =
        role === 'farmer'
          ? 'farmer_biometric_card'
          : 'agent_biometric_card';
      await AsyncStorage.removeItem(cardKey);

      if (role === 'farmer') {
        setBiometricEnabledForFarmer(false);
        setBiometricFarmerCard(null);
      } else {
        setBiometricEnabledForAgent(false);
        setBiometricAgentCard(null);
      }
    } catch (error) {
      console.error('Error disabling biometric login:', error);
    }
  };

  const loginWithBiometrics = async (
    role: string,
  ): Promise<'success' | 'cancelled' | false> => {
    try {
      if (!biometricsAvailable || !isBiometricLoginEnabled(role)) {
        return false;
      }

      const result: BiometricTokenResult = await getBiometricAuthToken(
        'Login to your account',
      );

      if (result.status === 'cancelled') {
        return 'cancelled';
      }

      if (result.status === 'noCredential' || result.status === 'error') {
        await disableBiometricLogin(role);
        return false;
      }

      const storedValue = result.token;
      let token: string;

      // Check if stored value contains login credentials (new format)
      // or a plain auth token (legacy/profile-toggle format)
      if (storedValue.startsWith('{')) {
        try {
          const creds = JSON.parse(storedValue);
          if (creds.type === 'credentials') {
            // Re-authenticate with stored credentials to get a fresh token
            const response = await axiosPublic.post(
              '/user_sessions/login_with_pin',
              {
                data: {
                  attributes: {
                    ghana_card_number: creds.ghana_card_number,
                    pin: creds.pin,
                    device_id: creds.device_id,
                  },
                },
              },
            );
            const meta = response.data?.meta;
            token = meta?.auth_token;
            if (!token) {
              console.warn('[auth] Biometric re-auth returned no token.');
              return false;
            }
          } else {
            token = storedValue;
          }
        } catch (loginError: any) {
          const errorCode = loginError?.response?.data?.code;
          if (errorCode === 'ACCOUNT_LOCKED') {
            console.warn('[auth] Account is locked, disabling biometric.');
            await disableBiometricLogin(role);
          }
          console.warn('[auth] Biometric re-auth failed', loginError?.message);
          return false;
        }
      } else {
        // Legacy format: plain token — validate it
        token = storedValue;
        try {
          await axiosPublic.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (validationError: any) {
          const status = validationError?.response?.status;
          if (status === 401) {
            console.warn('[auth] Biometric token is expired, falling back to PIN login.');
            await clearAuthToken();
            return false;
          }
          console.warn('[auth] Token validation request failed, proceeding with biometric login', validationError?.message);
        }
      }

      await setStoredAuthToken(token);
      setAuthToken(token);
      setIsLoggedIn(true);
      setCurrentAuthedRole(role as 'farmer' | 'agent');

      return 'success';
    } catch (error) {
      console.error('Error logging in with biometrics:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        authToken,
        trustedFarmerCard,
        trustedAgentCard,
        currentAuthedRole,
        loading,

        checkAuth,
        setAuthToken,
        setIsLoggedIn,
        handleLogout,
        handleTrustedCard,
        removeTrustedCard,
        ensureTrustedCard,
        updateCardStatus,
        setCurrentAuthedRole,

        getTrustedCard,
        getCardNumber,
        getCardName,
        isAccountLocked,
        hasTrustedActiveCard,
        biometricsAvailable,
        biometricEnabledForFarmer,
        biometricEnabledForAgent,
        isBiometricLoginEnabled,
        getBiometricCardNumber,
        enableBiometricLogin,
        enableBiometricLoginWithCurrentToken,
        refreshBiometricToken,
        disableBiometricLogin,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
