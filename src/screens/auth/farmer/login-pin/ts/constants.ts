import { RouteProp } from '@react-navigation/native';

export type ParamList = {
  FarmerAuthStack: {
    redirect: 'Details' | 'CreatePIN';
    ghana_card_number: string;
  };
};

export type PINRouteProp = RouteProp<ParamList>;

export const PIN_COUNT = 6;
export const initialPIN = Array(PIN_COUNT).fill('');

export const ERROR_MESSAGES: Record<string, string | ((meta?: any) => string)> =
  {
    FARMER_LOGIN_PIN_VALIDATION_ERROR:
      'Please check your details and try again.',
    FARMER_NOT_FOUND:
      'We couldn’t find your account. Please verify your NADRA ID or contact support.',
    FARMER_INACTIVE:
      'Your account is currently inactive. Please contact support for help reactivating it.',
    REGISTRATION_INCOMPLETE:
      'Your registration isn’t complete yet. Please finish signing up before logging in.',
    PIN_INVALID: meta => {
      let msg = 'Incorrect PIN. Please try again.';
      if (meta?.attempts_remaining !== undefined) {
        msg += ` You have ${meta.attempts_remaining} attempt${
          meta.attempts_remaining === 1 ? '' : 's'
        } remaining.`;
        if (meta?.attempts_remaining === 1) {
          msg += ' One more failed attempt will lock your account.';
        }
      }
      return msg;
    },
    ACCOUNT_LOCKED:
      'Your account has been locked after too many incorrect attempts. Please reset your PIN or contact support to unlock it.',
  };
