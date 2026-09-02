import { axiosPublic } from '@/config/axios';
import axios from 'axios';

export type RoleChangeCheckResult = {
  name: string;
  phone: string;
  ghanaCardNumber: string;
} | null;

/**
 * Check if a Ghana card number belongs to a user eligible for role change.
 * POST /users/check_ghana_card_for_role_change
 */
export async function checkGhanaCardForRoleChange(
  ghanaCardNumber: string,
  targetRole: 'farmer' | 'agent',
): Promise<RoleChangeCheckResult> {
  const payload = {
    data: {
      attributes: {
        ghana_card_number: ghanaCardNumber,
        target_role: targetRole,
      },
    },
  };
  const response = await axiosPublic.post(
    '/users/check_ghana_card_for_role_change',
    payload,
  );
  const attrs = response.data?.data?.attributes;
  if (attrs?.ghana_card_number) {
    return {
      name: attrs.name || attrs.user_name || '',
      phone: attrs.phone || attrs.phone_number || '',
      ghanaCardNumber: attrs.ghana_card_number,
    };
  }
  return null;
}

/**
 * Request OTP for role change flow.
 * POST /users/request_otp
 */
export async function requestRoleChangeOtp(phoneNumber: string): Promise<void> {
  const payload = {
    data: {
      attributes: {
        phone_number: phoneNumber,
        country_code: '+92',
        skip_count_check: true,
      },
    },
  };
  await axiosPublic.post('/users/request_otp', payload);
}

/**
 * Verify OTP for double role.
 * POST /users/verify_otp_double_role
 * Returns the auth_token from meta.
 */
export async function verifyRoleChangeOtp(
  ghanaCardNumber: string,
  otp: string,
): Promise<string> {
  const payload = {
    data: {
      attributes: {
        ghana_card_number: ghanaCardNumber,
        otp,
        include_user_details: true,
      },
    },
  };
  const response = await axiosPublic.post(
    '/users/verify_otp_double_role',
    payload,
  );
  const authToken =
    response.data?.meta?.auth_token || response.data?.data?.meta?.auth_token;
  if (!authToken) {
    throw new Error('No auth token received from OTP verification.');
  }
  return authToken;
}

/**
 * Add a role to an existing user.
 * POST /users/add_role — Requires Bearer token
 */
export async function addRole(authToken: string, targetRole: 'farmer' | 'agent'): Promise<void> {
  const url = `${axiosPublic.defaults.baseURL}/users/add_role`;
  console.log('\n📤 [ROLE CHANGE] POST', url, { target_role: targetRole });
  const response = await axios.post(
    url,
    {
      data: {
        attributes: {
          target_role: targetRole,
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  console.log('\n📥 [ROLE CHANGE] Response:', response.status, JSON.stringify(response.data, null, 2));
}
