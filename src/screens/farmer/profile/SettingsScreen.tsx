import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import ClipboardCheckIcon from '@/components/icons/ClipboardCheckIcon';
import LockFilledIcon from '@/components/icons/LockFilledIcon';
import TrashFilledIcon from '@/components/icons/TrashFilledIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';

type SettingsMenuItemProps = {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function SettingsMenuItem({
  icon,
  iconBgColor,
  title,
  subtitle,
  onPress,
}: SettingsMenuItemProps) {
  return (
    <TouchableOpacity
      style={s.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.iconCircle, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={s.menuTextContainer}>
        <UITypography variant="semiBold" style={s.menuTitle}>
          {title}
        </UITypography>
        <UITypography style={s.menuSubtitle}>{subtitle}</UITypography>
      </View>
      <ChevronRightIcon size={24} color="#404040" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleCloseAccount = () => {
    navigation.navigate('CloseAccount');
  };

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="Settings"
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <UITypography style={s.sectionTitle}>Account Management</UITypography>

      <SettingsMenuItem
        icon={<ClipboardCheckIcon size={20} color="#099453" />}
        iconBgColor="#E7F8F0"
        title="Primary User Info"
        subtitle="Name, Mobile Number, work Email"
        onPress={() => navigation.navigate('PrimaryUserInfo')}
      />

      <SettingsMenuItem
        icon={<LockFilledIcon size={14} color="#F32735" />}
        iconBgColor="#FAE7E2"
        title="Change PIN"
        subtitle="Update your account security PIN"
        onPress={() => navigation.navigate('ChangePin')}
      />

      <SettingsMenuItem
        icon={<TrashFilledIcon size={14} color="#F32735" />}
        iconBgColor="#FAE7E2"
        title="Close Account"
        subtitle="Permanently Deactivate this account"
        onPress={handleCloseAccount}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
    letterSpacing: 0.1,
    paddingHorizontal: 20,
    marginBottom: 20,
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
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
