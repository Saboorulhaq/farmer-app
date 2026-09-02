import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography, UIContainedButton } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import AuthFarmerPrivacyModal from '@/components/screens/auth/farmer/farmer-details/AuthFarmerPrivacyModal';
import { axiosPrivate } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import { useFarmer } from '@/constants/context/farmer/context';
import { useSubmissionsStore } from '@/store/useSubmissionsStore';
import WarningTriangleIcon from '@/components/icons/WarningTriangleIcon';
import CheckIcon from '@/components/icons/CheckIcon';

export default function CloseAccountScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { farmer } = useFarmer();
  const { hasActiveLoan } = useSubmissionsStore();
  const activeLoan = hasActiveLoan();

  const [agreed, setAgreed] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const handleCloseAccount = async () => {
    if (!agreed || activeLoan) return;
    try {
      setRequesting(true);
      await axiosPrivate.post('/users/request_otp', {
        data: {
          attributes: {
            phone_number: farmer?.attributes?.phone_number,
            email: farmer?.attributes?.email,
            skip_count_check: true,
          },
        },
      });
      navigation.navigate('LoanRequestOTPVerification', {
        mode: 'closeAccount',
      });
    } catch (error: any) {
      if (!error?.__handledGlobally) {
        Toast.error(
          error?.response?.data?.message ||
            'Failed to send verification code. Please try again.',
        );
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="Close Account"
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
          {/* Title row */}
          <View style={s.titleRow}>
            <WarningTriangleIcon size={28} color="#F32735" />
            <UITypography variant="semiBold" style={s.cardTitle}>
              Close Your Account?
            </UITypography>
          </View>

          {/* Description */}
          <UITypography variant="medium" style={s.description}>
            Closing your account is permanent and cannot be undone.
          </UITypography>

          {/* Bullet points */}
          <View style={s.bulletList}>
            <View style={s.bulletItem}>
              <UITypography style={s.bulletDot}>{'\u2022'}</UITypography>
              <UITypography variant="medium" style={s.bulletText}>
                You will lose access to any active credit or financial data linked to your account may be affected.
              </UITypography>
            </View>
            <View style={s.bulletItem}>
              <UITypography style={s.bulletDot}>{'\u2022'}</UITypography>
              <UITypography variant="medium" style={s.bulletText}>
                You will not be able to recover this account or its data later.
              </UITypography>
            </View>
          </View>

          {/* Warning banner */}
          <View style={s.warningBanner}>
            <WarningTriangleIcon size={20} color="#E8A830" />
            <UITypography variant="medium" style={s.warningText}>
              You cannot close your account with any active loan or credit requests still open.
            </UITypography>
          </View>
        </View>

        {/* Checkbox agreement */}
        <View style={[s.checkboxRow, !!activeLoan && s.checkboxRowDisabled]}>
          <TouchableOpacity
            onPress={() => !activeLoan && setAgreed(!agreed)}
            activeOpacity={activeLoan ? 1 : 0.7}
            style={s.checkboxTouchable}
            disabled={!!activeLoan}
          >
            <View style={[s.checkbox, agreed && !activeLoan && s.checkboxChecked, !!activeLoan && s.checkboxDisabled]}>
              {agreed && !activeLoan && <CheckIcon size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          <View style={s.checkboxLabelContainer}>
            <TouchableOpacity onPress={() => !activeLoan && setAgreed(!agreed)} activeOpacity={activeLoan ? 1 : 0.7} disabled={!!activeLoan}>
              <UITypography style={[s.checkboxLabel, !!activeLoan && s.checkboxLabelDisabled]}>I agree to the </UITypography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => !activeLoan && setPrivacyModalVisible(true)} activeOpacity={activeLoan ? 1 : 0.7} disabled={!!activeLoan}>
              <UITypography style={[s.checkboxLabel, !!activeLoan ? s.checkboxLabelDisabled : s.linkText]}>Terms and Conditions</UITypography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => !activeLoan && setAgreed(!agreed)} activeOpacity={activeLoan ? 1 : 0.7} disabled={!!activeLoan}>
              <UITypography style={[s.checkboxLabel, !!activeLoan && s.checkboxLabelDisabled]}> and </UITypography>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => !activeLoan && setPrivacyModalVisible(true)} activeOpacity={activeLoan ? 1 : 0.7} disabled={!!activeLoan}>
              <UITypography style={[s.checkboxLabel, !!activeLoan ? s.checkboxLabelDisabled : s.linkText]}>Privacy Policy</UITypography>
            </TouchableOpacity>
          </View>
        </View>

        <AuthFarmerPrivacyModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
        />

        {/* Buttons */}
        <View style={s.buttonContainer}>
          <UIContainedButton
            onPress={handleCloseAccount}
            loading={requesting}
            disabled={!agreed || !!activeLoan}
            size="large"
            key={!agreed || activeLoan ? 'disabled' : 'enabled'}
          >
            Close Account
          </UIContainedButton>

          <TouchableOpacity
            style={s.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <UITypography variant="bold" style={s.cancelButtonText}>
              Cancel
            </UITypography>
          </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    color: '#101010',
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    color: '#404040',
    lineHeight: 22,
    marginBottom: 20,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
    marginRight: 8,
    marginLeft: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
  },
  warningBanner: {
    backgroundColor: '#FAE7E2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#AF2032',
    lineHeight: 19,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
    paddingHorizontal: 4,
  },
  checkboxTouchable: {
    padding: 4,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#099453',
    borderColor: '#099453',
  },
  checkboxDisabled: {
    backgroundColor: '#EDEDED',
    borderColor: '#CCCCCC',
  },
  checkboxRowDisabled: {
    opacity: 0.5,
  },
  checkboxLabelDisabled: {
    color: '#AAAAAA',
  },
  checkboxLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#101010',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  linkText: {
    fontSize: 12,
    color: '#099453',
    lineHeight: 18,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#101010',
  },
});
