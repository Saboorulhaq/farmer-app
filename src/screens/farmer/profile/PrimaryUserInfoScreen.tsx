import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography } from '@/components/ui';
import { useFarmer } from '@/constants/context/farmer/context';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import PakistanFlagIcon from '@/components/icons/PakistanFlagIcon';

export default function PrimaryUserInfoScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { farmer } = useFarmer();

  const [fullName] = useState(farmer?.attributes.name || '');
  const [phone] = useState(
    farmer?.attributes.phone_number
      ? String(farmer.attributes.phone_number)
      : '',
  );
  const [email] = useState(farmer?.attributes.email || '');
  const hasEmail = email.trim().length > 0;

  const formatPhoneDisplay = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  };

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="Primary User Info"
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <View style={s.fieldGroup}>
            <UITypography variant="medium" style={s.fieldLabel}>
              Full Name:
            </UITypography>
            <TextInput
              style={[s.fieldInput, s.disabledInput]}
              value={fullName}
              placeholder="Enter your full name"
              placeholderTextColor="#979797"
              editable={false}
            />
            <View style={s.divider} />
          </View>

          <View style={s.fieldGroup}>
            <UITypography variant="medium" style={s.fieldLabel}>
              Mobile Number:
            </UITypography>
            <View style={s.phoneRow}>
              <PakistanFlagIcon size={20} />
              <TextInput
                style={[s.fieldInput, s.phoneInput]}
                value={formatPhoneDisplay(phone)}
                placeholder="+92 000 000 0000"
                placeholderTextColor="#979797"
                keyboardType="phone-pad"
                editable={false}
              />
            </View>
            <View style={s.divider} />
          </View>

          {hasEmail && (
            <View style={s.fieldGroup}>
              <UITypography variant="medium" style={s.fieldLabel}>
                Email
              </UITypography>
              <TextInput
                style={[s.fieldInput, s.disabledInput]}
                value={email}
                placeholder="Enter your work email"
                placeholderTextColor="#979797"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
              <View style={s.divider} />
            </View>
          )}
        </View>


      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  fieldInput: {
    fontSize: 14,
    color: '#101010',
    lineHeight: 22,
    letterSpacing: 0.3,
    paddingVertical: 0,
    fontFamily: 'Poppins-Medium',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneInput: {
    flex: 1,
    color: '#979797',
  },
  disabledInput: {
    color: '#979797',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 16,
  },

});
