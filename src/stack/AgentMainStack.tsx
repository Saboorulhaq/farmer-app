import { AgentFarmerRegisterProvider } from '@/constants/context/agent/agent-farmer-register/context';
import AgentMainScreen from '@/screens/agent/main/AgentMainScreen';
import AgentRegisterFarmerScreen from '@/screens/agent/main/farmer/add-farmer/AgentRegisterFarmerScreen';
import AgentFarmDetailsScreen from '@/screens/agent/main/farmer/farm-details/AgentFarmDetailsScreen';
import AgentFarmerIdVerificationCamera from '@/screens/agent/main/farmer/id-verification-camera/AgentFarmerIdVerificationCamera';
import AgentFarmerIdVerificationScreen from '@/screens/agent/main/farmer/id-verification-main/AgentFarmerIdVerificationScreen';

import AgentFarmerReviewScreen from '@/screens/agent/main/farmer/review/AgentFarmerReviewScreen';
import AgentFarmerRegisterSuccesss from '@/screens/agent/main/farmer/success/AgentFarmerRegisterSuccess';
import AgentFarmerOTPScreen from '@/screens/agent/main/farmer/verify-farmer/AgentFarmerOTPScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationsScreen from '@/screens/shared/notifications/NotificationsScreen';
import AllFarmersScreen from '@/screens/agent/main/farmers/AllFarmersScreen';
import FarmerDetailScreen from '@/screens/agent/main/farmers/FarmerDetailScreen';

const AgentStack = createNativeStackNavigator();
const FarmerRegistrationStack = createNativeStackNavigator();

function AgentFarmerRegistrationFlowNavigator() {
  return (
    <AgentFarmerRegisterProvider>
      <FarmerRegistrationStack.Navigator screenOptions={{ headerShown: false }}>
        <FarmerRegistrationStack.Screen
          name="FarmerIdVerification"
          component={AgentFarmerIdVerificationScreen}
        />
        <FarmerRegistrationStack.Screen
          name="FarmerIdCamera"
          component={AgentFarmerIdVerificationCamera}
        />
        <FarmerRegistrationStack.Screen
          name="FarmerRegister"
          component={AgentRegisterFarmerScreen}
        />
        <FarmerRegistrationStack.Screen
          name="FarmerOTP"
          component={AgentFarmerOTPScreen}
        />
        <FarmerRegistrationStack.Screen
          name="FarmDetails"
          component={AgentFarmDetailsScreen}
        />
        <FarmerRegistrationStack.Screen
          name="FarmReview"
          component={AgentFarmerReviewScreen}
        />
        <FarmerRegistrationStack.Screen
          name="FarmSuccess"
          component={AgentFarmerRegisterSuccesss}
        />
      </FarmerRegistrationStack.Navigator>
    </AgentFarmerRegisterProvider>
  );
}

export function AgentMainStack() {
  return (
    <AgentStack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <AgentStack.Screen name="Main" component={AgentMainScreen} />
      <AgentStack.Screen name="AllFarmers" component={AllFarmersScreen} />
      <AgentStack.Screen name="FarmerDetail" component={FarmerDetailScreen} />
      <AgentStack.Screen name="Notifications" component={NotificationsScreen} />
      <AgentStack.Screen
        name="AgentFarmerRegistrationFlow"
        component={AgentFarmerRegistrationFlowNavigator}
      />
    </AgentStack.Navigator>
  );
}
