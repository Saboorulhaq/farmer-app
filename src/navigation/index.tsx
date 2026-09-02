import { toastConfig } from '@/components/ui/toast';

import AuthFarmerNavigation from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import ToastManager from 'toastify-react-native';
import { NotFound } from '../screens/NotFound';
import AppSplashScreen from '../screens/SplashScreen';
import UpdateRequiredScreen from '../screens/shared/update-required/UpdateRequiredScreen';
import { AgentNavigation } from './agent/AgentNavigation';
import { FarmerNavigation } from './farmer/FarmerNavigation';
import { AuthProvider, useAuth } from '@/constants/context/auth/context';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import { navigationRef } from '@/util/navigationService';

interface NavigationProps {
  theme?: Theme;
  linking?: any;
  onReady?: () => void;
}

const RootStack = createNativeStackNavigator();

function AppNavigator() {
  const { currentAuthedRole, trustedFarmerCard, trustedAgentCard, loading } =
    useAuth();
  const isUpdateRequired = useAppConfigStore(state => state.isUpdateRequired());
  console.log(trustedFarmerCard, trustedAgentCard);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isUpdateRequired) {
    return <UpdateRequiredScreen />;
  }

  return (
    <RootStack.Navigator
      initialRouteName={
        currentAuthedRole === 'agent'
          ? 'AgentNavigation'
          : currentAuthedRole === 'farmer'
          ? 'FarmerNavigation'
          : 'Splash'
      }
      screenOptions={{
        headerShown: false,
      }}
    >
      {currentAuthedRole === 'agent' ? (
        <RootStack.Screen name="AgentNavigation" component={AgentNavigation} />
      ) : currentAuthedRole === 'farmer' ? (
        <RootStack.Screen
          name="FarmerNavigation"
          component={FarmerNavigation}
        />
      ) : (
        <>
          <RootStack.Screen name="Splash" component={AppSplashScreen} />
          <RootStack.Screen
            name="FarmerAuthStack"
            component={AuthFarmerNavigation}
          />
        </>
      )}
      <RootStack.Screen
        name="NotFound"
        component={NotFound}
        options={{
          title: '404',
          headerShown: true,
        }}
      />
    </RootStack.Navigator>
  );
}

export function Navigation({ theme, linking, onReady }: NavigationProps) {
  const onNavigationReady = () => {
    if (onReady) {
      onReady();
    }
  };

  return (
    <AuthProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={theme}
        linking={linking}
        onReady={onNavigationReady}
      >
        <AppNavigator />
        <ToastManager
          config={toastConfig}
          position="top"
          showProgressBar
          showCloseIcon
          useModal={false}
        />
      </NavigationContainer>
    </AuthProvider>
  );
}
export default Navigation;
