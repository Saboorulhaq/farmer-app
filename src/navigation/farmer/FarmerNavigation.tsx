import HomeIcon from '@/components/icons/HomeIcon';
import ProfileIcon from '@/components/icons/ProfileIcon';
import TransactionsIcon from '@/components/icons/TransactionsIcon';
import { FarmerProvider } from '@/constants/context/farmer/context';
import { FarmerMainStack } from '@/stack/FarmerMainStack';
import { TransactionsStack } from '@/stack/TransactionsStack';
import { ProfileStack } from '@/stack/ProfileStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Pressable } from 'react-native';
import { useAppConfigStore } from '@/store/useAppConfigStore';

type FarmerBottomNavigationParamList = {
  FarmerMain: undefined;
  Transactions: undefined;
};

const FarmerBottomNavigation = createBottomTabNavigator();

type RootStackParamList = {
  FarmerBottomNavigation: { is_approved: string };
};

export type FarmerNavigationProp =
  NativeStackNavigationProp<FarmerBottomNavigationParamList>;
type AgentRouteProp = RouteProp<RootStackParamList>;

console.log('Farmer Authed Running');
export function FarmerNavigation() {
  const isTransactionsDisabled = useAppConfigStore(state =>
    state.isBottomNavItemDisabled('transactions'),
  );

  return (
    <FarmerProvider>
      <FarmerBottomNavigation.Navigator
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
          tabBarButton: props => (
            <Pressable
              {...props}
              onPress={event => {
                ReactNativeHapticFeedback.trigger('impactLight', {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });
                props.onPress?.(event);
              }}
            />
          ),
        }}
      >
        <FarmerBottomNavigation.Screen
          name="Home"
          component={FarmerMainStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <HomeIcon width={24} height={24} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent the default behavior
              e.preventDefault();
              
              // Navigate to Home tab and reset to initial screen
              navigation.navigate('Home', {
                screen: 'Main',
              });
            },
          })}
        />
        <FarmerBottomNavigation.Screen
          name="Transactions"
          component={TransactionsStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TransactionsIcon width={24} height={24} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent the default behavior
              e.preventDefault();

              if (isTransactionsDisabled) {
                navigation.navigate('Transactions', { screen: 'ComingSoon' });
                return;
              }

              navigation.navigate('Transactions', { screen: 'TransactionsMain' });
            },
          })}
        />
        <FarmerBottomNavigation.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <ProfileIcon width={24} height={24} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent the default behavior
              e.preventDefault();
              
              // Navigate to Profile tab and reset to initial screen
              navigation.navigate('Profile', {
                screen: 'ProfileMain',
              });
            },
          })}
        />
      </FarmerBottomNavigation.Navigator>
    </FarmerProvider>
  );
}
