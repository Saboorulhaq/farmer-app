import { UITypography } from '@/components/ui';
import { useFarmer } from '@/constants/context/farmer/context';
import { useAuth } from '@/constants/context/auth/context';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { axiosPrivate } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import SettingsIcon from '@/components/icons/SettingsIcon';

const ProfileAvatar = require('@/assets/images/profile/profile-avatar.png');
const FarmDetailsIcon = require('@/assets/images/profile/farm-details.png');
const HarvestDetailsIcon = require('@/assets/images/profile/harvest-details.png');
const BankAccountIcon = require('@/assets/images/profile/bank-account.png');
const LogoutIconImg = require('@/assets/images/profile/logout-icon.png');

function maskGhanaCard(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 5) return cardNumber || '—';
  const visible = cardNumber.slice(-5);
  return `****-****-*${visible}`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 3) return phone || '—';
  const last3 = phone.slice(-3);
  const countryCode = phone.startsWith('+') ? phone.slice(0, 3) : '+92';
  return `${countryCode} **** **** ${last3}`;
}

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>{icon}</View>
      <View style={styles.menuTextContainer}>
        <UITypography variant="semiBold" style={styles.menuTitle}>
          {title}
        </UITypography>
        <UITypography style={styles.menuSubtitle}>{subtitle}</UITypography>
      </View>
    </TouchableOpacity>
  );
}

export default function FarmerProfileScreen() {
  const { top } = useSafeAreaInsets();
  const { farmer, loading } = useFarmer();
  const navigation = useNavigation<any>();
  const [deleting, setDeleting] = useState(false);

  const {
    handleLogout,
    getCardNumber,
    removeTrustedCard,
    // Biometric login feature commented out
    // biometricsAvailable,
    // isBiometricLoginEnabled,
    // enableBiometricLoginWithCurrentToken,
    // disableBiometricLogin,
  } = useAuth();

  // Biometric login feature commented out
  // const [biometricToggleBusy, setBiometricToggleBusy] = useState(false);
  // const biometricEnabled = isBiometricLoginEnabled('farmer');

  const ghanaCard = getCardNumber('farmer', '');
  const farmerName = farmer?.attributes.name || '—';
  const phone = farmer?.attributes.phone_number
    ? String(farmer.attributes.phone_number)
    : '';

  // Biometric login feature commented out
  /*
  const onBiometricToggle = useCallback(
    async (value: boolean) => {
      if (biometricToggleBusy) return;
      setBiometricToggleBusy(true);
      try {
        if (value) {
          const ok = await enableBiometricLoginWithCurrentToken('farmer');
          if (!ok) {
            Toast.show({
              type: 'error',
              text1: 'Could not enable',
              text2: 'Please try again or log in with PIN first.',
            });
          }
        } else {
          await disableBiometricLogin('farmer');
        }
      } finally {
        setBiometricToggleBusy(false);
      }
    },
    [
      biometricToggleBusy,
      enableBiometricLoginWithCurrentToken,
      disableBiometricLogin,
    ],
  );
  */

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all associated data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const cardNumber = getCardNumber('farmer', '');
              if (!cardNumber) {
                Toast.error('NADRA ID not found');
                return;
              }
              await axiosPrivate.post('/users/delete_by_ghana_card', {
                data: {
                  attributes: {
                    ghana_card_number: cardNumber,
                  },
                },
              });
              Toast.success('Account deleted successfully');
              await removeTrustedCard('farmer');
              await handleLogout();
            } catch (error: any) {
              if (!error?.__handledGlobally) {
                Toast.error(
                  error?.response?.data?.message ||
                  'Failed to delete account. Please try again.',
                );
              }
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleLogoutPress = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  if (loading && !farmer) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Profile
        </UITypography>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userCardContent}>
            <Image source={ProfileAvatar} style={styles.avatar} />
            <View style={styles.userInfo}>
              <UITypography variant="semiBold" style={styles.userName}>
                {farmerName}
              </UITypography>
              <UITypography style={styles.userDetail}>
                {ghanaCard || '—'}
              </UITypography>
              <UITypography style={styles.userDetail}>
                {phone || '—'}
              </UITypography>
            </View>
          </View>
          {/* Biometric login switcher commented out
          {biometricsAvailable && (
            <View style={styles.biometricRow}>
              <UITypography style={styles.label}>
                Use Face ID / fingerprint to log in
              </UITypography>
              <Switch
                value={biometricEnabled}
                onValueChange={onBiometricToggle}
                disabled={biometricToggleBusy}
                trackColor={{ false: '#ccc', true: '#16A34A' }}
                thumbColor="#fff"
              />
            </View>
          )}
          */}
        </View>

        {/* Agri Management Section */}
        <UITypography style={styles.sectionTitle}>
          Agri Management
        </UITypography>

        <MenuItem
          icon={
            <Image
              source={FarmDetailsIcon}
              style={styles.menuIconImage}
              resizeMode="contain"
            />
          }
          title="My Farm Details"
          subtitle="View and add your farm info"
          onPress={() => navigation.navigate('FarmDetails')}
        />

        <MenuItem
          icon={
            <Image
              source={HarvestDetailsIcon}
              style={styles.menuIconImage}
              resizeMode="contain"
            />
          }
          title="My Harvest Details"
          subtitle="View and add your harvest info"
          onPress={() => navigation.navigate('HarvestList')}
        />

        <MenuItem
          icon={
            <Image
              source={BankAccountIcon}
              style={styles.menuIconImage}
              resizeMode="contain"
            />
          }
          title="My Bank Account"
          subtitle="View your bank account details"
          onPress={() => navigation.navigate('BankDetails')}
        />

        {/* Account Section */}
        <UITypography style={styles.sectionTitle}>Account</UITypography>

        <MenuItem
          icon={<SettingsIcon size={30} color="#099453" />}
          title="Settings"
          subtitle="Security & Preferences"
          onPress={() => navigation.navigate('Settings')}
        />

        <MenuItem
          icon={
            <Image
              source={LogoutIconImg}
              style={styles.menuIconImage}
              resizeMode="contain"
            />
          }
          title="Logout"
          subtitle="Logout of the app"
          onPress={handleLogoutPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#101010',
    marginTop: 12,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 14,
    color: '#1E1E20',
    lineHeight: 22,
  },
  userDetail: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  label: { fontSize: 14, color: '#8B8B8B' },
  sectionTitle: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
    letterSpacing: 0.1,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    height: 64,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconImage: {
    width: 34,
    height: 34,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 14,
    color: '#1E1E20',
    lineHeight: 22,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#5A5A5A',
    lineHeight: 15,
    letterSpacing: 0.1,
  },
});
