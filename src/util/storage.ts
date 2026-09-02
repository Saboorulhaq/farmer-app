import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

const AUTH_TOKEN_SERVICE = 'auth_token';
const BIOMETRIC_GATE_SERVICE = 'auth_biometric_gate_v1';
const BIOMETRIC_TOKEN_SERVICE = 'auth_token_biometric_v1';
const BIOMETRIC_GATE_ACCESS_CONTROL =
  Platform.OS === 'ios'
    ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET
    : Keychain.ACCESS_CONTROL.BIOMETRY_ANY;

export async function setAuthToken(token: string): Promise<void> {
  if (!token) return;
  await Keychain.setGenericPassword('token', token, {
    service: AUTH_TOKEN_SERVICE,
  });
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: AUTH_TOKEN_SERVICE,
    });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: AUTH_TOKEN_SERVICE });
  } catch {
    try {
      await Keychain.setGenericPassword('token', '', { service: AUTH_TOKEN_SERVICE });
    } catch {
      // ignore
    }
  }
}

export async function setBiometricAuthToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const gateResult = await Keychain.setGenericPassword('gate', '1', {
      service: BIOMETRIC_GATE_SERVICE,
      accessControl: BIOMETRIC_GATE_ACCESS_CONTROL,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    if (gateResult === false) {
      console.warn('[storage] Failed to write biometric gate credential.');
      return false;
    }

    const tokenResult = await Keychain.setGenericPassword('token', token, {
      service: BIOMETRIC_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });

    return tokenResult !== false;
  } catch (error) {
    console.warn('Failed to store biometric auth token', error);
    return false;
  }
}

export async function updateBiometricToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const result = await Keychain.setGenericPassword('token', token, {
      service: BIOMETRIC_TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return result !== false;
  } catch (error) {
    console.warn('[storage] Failed to update biometric token', error);
    return false;
  }
}


export async function hasBiometricAuthToken(): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: BIOMETRIC_TOKEN_SERVICE,
    });
    return !!credentials && !!credentials.password;
  } catch {
    return false;
  }
}

export type BiometricTokenResult =
  | { status: 'success'; token: string }
  | { status: 'cancelled' }
  | { status: 'noCredential' }
  | { status: 'error'; error: unknown };

export async function getBiometricAuthToken(
  promptTitle?: string,
): Promise<BiometricTokenResult> {
  try {
    const gate = await Keychain.getGenericPassword({
      service: BIOMETRIC_GATE_SERVICE,
      authenticationPrompt: {
        title: promptTitle || 'Login to your account',
        subtitle: 'Verify your fingerprint or face to continue.',
        description: 'Use biometrics to sign in.',
        cancel: 'Cancel',
      },
    });

    if (!gate) {
      return { status: 'noCredential' };
    }
  } catch (error: any) {
    const msg: string = error?.message ?? '';
    const code: string = error?.code ?? '';

    const isCancelled =
      code === 'USER_CANCELED' ||
      code === 'user_canceled' ||
      msg.toLowerCase().includes('cancel') ||
      msg.includes('code: -3') ||      // Android: user pressed negative button
      msg.includes('error code: 10') || // BiometricPrompt.ERROR_USER_CANCELED
      msg.includes('error code: 13');   // BiometricPrompt.ERROR_NEGATIVE_BUTTON

    if (isCancelled) {
      return { status: 'cancelled' };
    }

    console.warn('[storage] Biometric gate failed', error);
    return { status: 'error', error };
  }
  try {
    const credentials = await Keychain.getGenericPassword({
      service: BIOMETRIC_TOKEN_SERVICE,
    });

    if (credentials && credentials.password) {
      return { status: 'success', token: credentials.password };
    }
    console.warn('[storage] Gate passed but no token found. Biometric setup may be incomplete.');
    return { status: 'noCredential' };
  } catch (error) {
    console.warn('[storage] Failed to read token after biometric gate passed', error);
    return { status: 'error', error };
  }
}

export async function clearBiometricAuthToken(): Promise<void> {
  for (const service of [BIOMETRIC_GATE_SERVICE, BIOMETRIC_TOKEN_SERVICE]) {
    try {
      await Keychain.resetGenericPassword({ service });
    } catch {
      // ignore
    }
  }
}
