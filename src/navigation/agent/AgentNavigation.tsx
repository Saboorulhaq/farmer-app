import HomeIcon from '@/components/icons/HomeIcon';
import ProfileIcon from '@/components/icons/ProfileIcon';
import { AgentProvider } from '@/constants/context/agent/context';
import AgentProfileScreen from '@/screens/agent/profile/AgentProfileScreen';
import { AgentMainStack } from '@/stack/AgentMainStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback, {
  trigger,
} from 'react-native-haptic-feedback';
import { Pressable } from 'react-native';

type AgentBottomNavigationParamList = {
  FarmerMain: undefined;
  LoginPin: undefined;
  UserDetails: undefined;
  OTPVerification: undefined;
  CreatePIN: undefined;
  Details: undefined;
  FarmerSuccess: undefined;
};

const AgentBottomNavigation = createBottomTabNavigator();

export type AgentNavigationProp =
  NativeStackNavigationProp<AgentBottomNavigationParamList>;

const CustomTabBarButton = (props: any) => (
  <Pressable
    {...props}
    onPress={() => {
      trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: true,
      });
      props.onPress && props.onPress({} as any);
    }}
  />
);

export function AgentNavigation() {
  return (
    <AgentProvider>
      <AgentBottomNavigation.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#099453',
          tabBarInactiveTintColor: '#8B8B8B',
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 16,
            paddingHorizontal: 16,
            paddingTop: 16,
            borderTopColor: '#E8E8E8',
            backgroundColor: '#fff',
            height: 88,
          },
          tabBarItemStyle: {
            gap: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold',
          },
          tabBarButton: CustomTabBarButton,
        }}
      >
        <AgentBottomNavigation.Screen
          name="Home"
          component={AgentMainStack}
          options={{
            tabBarIcon: ({ color }) => (
              <HomeIcon width={24} height={24} color={color} />
            ),
          }}
        />
        <AgentBottomNavigation.Screen
          name="Profile"
          component={AgentProfileScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <ProfileIcon width={24} height={24} color={color} />
            ),
          }}
        />
      </AgentBottomNavigation.Navigator>
    </AgentProvider>
  );
}
