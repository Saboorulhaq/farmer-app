import { useAuth } from '@/constants/context/auth/context';
import AuthFarmerAccountLockedScreen from '@/screens/auth/farmer/account-locked/AuthFarmerAccountLockedScreen';
import AuthFarmerCaptureLocationScreen from '@/screens/auth/farmer/capture-location/AuthFarmerCaptureLocationScreen';
import AuthFarmerCreatePINScreen from '@/screens/auth/farmer/create-pin/AuthFarmerCreatePINScreen';
import AuthFarmerDetailsScreen from '@/screens/auth/farmer/farm-details/AuthFarmerDetailsScreen';
import AuthFarmerIdVerificationScreen from '@/screens/auth/farmer/id-verification-main/AuthFarmerIdVerificationScreen';
import AuthFarmerLoginPinScreen from '@/screens/auth/farmer/login-pin/AuthFarmerLoginPinScreen';
import AuthFarmerMainScreen from '@/screens/auth/farmer/main/AuthFarmerMain';
import AuthFarmerOTPVerificationRegisterScreen from '@/screens/auth/farmer/otp-verification-register/AuthFarmerOTPVerificationRegisterScreen';
import AuthFarmerOTPVerificationScreen from '@/screens/auth/farmer/otp-verification/AuthFarmerOTPVerificationScreen';
import AuthFarmerResetPINScreen from '@/screens/auth/farmer/reset-pin/AuthFarmerResetPINScreen';
import AuthFarmerSetPINScreen from '@/screens/auth/farmer/set-pin/AuthFarmerSetPINScreen';
import AuthFarmerSuccessScreen from '@/screens/auth/farmer/success/AuthFarmerSuccessScreen';
import AuthFarmerUserDetailsScreen from '@/screens/auth/farmer/user-details/AuthFarmerUserDetailsScreen';
import AuthRoleChangeOTPScreen from '@/screens/auth/farmer/role-change-otp/AuthRoleChangeOTPScreen';
import ConnectivityScreen from '@/screens/shared/connectivity/ConnectivityScreen';
import FrameProcessorsUnavailableScreen from '@/screens/shared/frame-processors-unavailable/FrameProcessorsUnavailableScreen';
import { useRegisterStore } from '@/store/useRegisterStore';
import type { CapturedLocation } from '@/services/location.service';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';

type AuthFarmerStackParamList = {
  FarmerAuthStack: undefined;
  FarmerMain: undefined;
  LoginPin: undefined;
  AccountLocked: undefined;
  UserDetails: undefined;
  RegisterOTPVerification: undefined;
  OTPVerification: undefined;
  ResetPIN: undefined;
  SetPIN: undefined;
  CreatePIN: undefined;
  Details: { capturedLocation?: CapturedLocation } | undefined;
  CaptureLocation: undefined;
  FarmerSuccess: undefined;
  IdVerification: undefined;
  IdVerificationCamera: { side: 'front' | 'back' };
  RoleChangeOTP: { phone: string; ghanaCardNumber: string; farmerName: string; targetRole: 'farmer' | 'agent' };
  Connectivity: undefined;
};

const AuthStack = createNativeStackNavigator<AuthFarmerStackParamList>();

export type FarmerAuthNavigationProp =
  NativeStackNavigationProp<AuthFarmerStackParamList>;

export function AuthFarmerNavigation() {
  const { isAccountLocked, hasTrustedActiveCard } = useAuth();
  const { role } = useRegisterStore();

  const initialRouteName = isAccountLocked(role)
    ? 'AccountLocked'
    : hasTrustedActiveCard(role)
    ? 'LoginPin'
    : 'FarmerMain';

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          // gestureEnabled: false,
        }}
      >
        <AuthStack.Screen name="FarmerMain" component={AuthFarmerMainScreen} />
        <AuthStack.Screen
          name="LoginPin"
          component={AuthFarmerLoginPinScreen}
        />
        <AuthStack.Screen
          name="AccountLocked"
          component={AuthFarmerAccountLockedScreen}
        />
        <AuthStack.Screen
          name="IdVerification"
          component={AuthFarmerIdVerificationScreen}
        />
        <AuthStack.Screen
          name="IdVerificationCamera"
          getComponent={() => {
            const { NativeModules } = require('react-native');
            const hasWorklets =
              !!NativeModules.WorkletsCore || !!NativeModules.Worklets;
            if (hasWorklets) {
              return require('@/screens/auth/farmer/id-verification-camera/AuthFarmerIdVerificationCamera')
                .default;
            }
            return FrameProcessorsUnavailableScreen;
          }}
        />
        <AuthStack.Screen
          name="UserDetails"
          component={AuthFarmerUserDetailsScreen}
        />
        <AuthStack.Screen
          name="OTPVerification"
          component={AuthFarmerOTPVerificationScreen}
        />
        <AuthStack.Screen
          name="RegisterOTPVerification"
          component={AuthFarmerOTPVerificationRegisterScreen}
        />
        <AuthStack.Screen
          name="ResetPIN"
          component={AuthFarmerResetPINScreen}
        />
        <AuthStack.Screen name="SetPIN" component={AuthFarmerSetPINScreen} />
        <AuthStack.Screen
          name="CreatePIN"
          component={AuthFarmerCreatePINScreen}
        />
        <AuthStack.Screen name="Details" component={AuthFarmerDetailsScreen} />
        <AuthStack.Screen
          name="CaptureLocation"
          component={AuthFarmerCaptureLocationScreen}
        />
        <AuthStack.Screen
          name="FarmerSuccess"
          component={AuthFarmerSuccessScreen}
        />
        <AuthStack.Screen
          name="RoleChangeOTP"
          component={AuthRoleChangeOTPScreen}
        />
        <AuthStack.Screen name="Connectivity" component={ConnectivityScreen} />
      </AuthStack.Navigator>
    </>
  );
}

export default AuthFarmerNavigation;
