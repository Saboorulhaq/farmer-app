import FarmerProfileScreen from '@/screens/farmer/profile/FarmerProfileScreen';
import CreditProfileScreen from '@/screens/farmer/credit-profile/CreditProfileScreen';
import HarvestListScreen from '@/screens/farmer/profile/HarvestListScreen';
import HarvestDetailsScreen from '@/screens/farmer/profile/HarvestDetailsScreen';
import FarmDetailsScreen from '@/screens/farmer/profile/FarmDetailsScreen';
import AddFarmScreen from '@/screens/farmer/profile/AddFarmScreen';
import SettingsScreen from '@/screens/farmer/profile/SettingsScreen';
import PrimaryUserInfoScreen from '@/screens/farmer/profile/PrimaryUserInfoScreen';
import ChangePinScreen from '@/screens/farmer/profile/ChangePinScreen';
import CloseAccountScreen from '@/screens/farmer/profile/CloseAccountScreen';
import BankDetailsScreen from '@/screens/farmer/profile/BankDetailsScreen';
import AuthFarmerCaptureLocationScreen from '@/screens/auth/farmer/capture-location/AuthFarmerCaptureLocationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileStackNavigator = createNativeStackNavigator();

export function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <ProfileStackNavigator.Screen 
        name="ProfileMain" 
        component={FarmerProfileScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="CreditProfile" 
        component={CreditProfileScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="HarvestList" 
        component={HarvestListScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="HarvestDetails" 
        component={HarvestDetailsScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="FarmDetails" 
        component={FarmDetailsScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="AddFarm" 
        component={AddFarmScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <ProfileStackNavigator.Screen 
        name="Settings" 
        component={SettingsScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="PrimaryUserInfo" 
        component={PrimaryUserInfoScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="ChangePin" 
        component={ChangePinScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="CloseAccount" 
        component={CloseAccountScreen} 
      />
      <ProfileStackNavigator.Screen 
        name="BankDetails" 
        component={BankDetailsScreen} 
      />
      <ProfileStackNavigator.Screen
        name="CaptureLocation"
        component={AuthFarmerCaptureLocationScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
    </ProfileStackNavigator.Navigator>
  );
}
