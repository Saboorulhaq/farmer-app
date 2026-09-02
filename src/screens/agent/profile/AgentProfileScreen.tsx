import { UIContainedButton, UITypography } from '@/components/ui';
import { useAgent } from '@/constants/context/agent/context';
import { useAuth } from '@/constants/context/auth/context';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';

export default function AgentProfileScreen() {
  const { top } = useSafeAreaInsets();
  const { agent, loading, refresh } = useAgent();
  const {
    handleLogout,
    // Biometric login feature commented out
    // biometricsAvailable,
    // isBiometricLoginEnabled,
    // enableBiometricLoginWithCurrentToken,
    // disableBiometricLogin,
  } = useAuth();
  // Biometric login feature commented out
  // const [biometricToggleBusy, setBiometricToggleBusy] = useState(false);
  // const biometricEnabled = isBiometricLoginEnabled('agent');

  /*
  const onBiometricToggle = useCallback(
    async (value: boolean) => {
      if (biometricToggleBusy) return;
      setBiometricToggleBusy(true);
      try {
        if (value) {
          const ok = await enableBiometricLoginWithCurrentToken('agent');
          if (!ok) {
            Toast.show({
              type: 'error',
              text1: 'Could not enable',
              text2: 'Please try again or log in with PIN first.',
            });
          }
        } else {
          await disableBiometricLogin('agent');
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

  if (loading && !agent) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6A2A7F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top + 20 }]}
      contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
    >
      <View>
        <UITypography
          variant="semiBold"
          style={{ fontSize: 24, textAlign: 'center', marginBottom: 16 }}
        >
          My Profile
        </UITypography>
        <View style={styles.card}>
          <View>
            <UITypography style={styles.label}>Name</UITypography>
            <UITypography style={styles.value}>
              {agent?.attributes.name}
            </UITypography>
          </View>
          {agent?.attributes.email && (
            <View>
              <UITypography style={styles.label}>Email</UITypography>
              <UITypography style={styles.value}>
                {agent?.attributes.email}
              </UITypography>
            </View>
          )}
          <View>
            <UITypography style={styles.label}>Phone Number</UITypography>
            <UITypography style={styles.value}>
              {agent?.attributes.phone_number}
            </UITypography>
          </View>
          <View>
            <UITypography style={styles.label}>Account Status</UITypography>
            <UITypography style={styles.value}>
              {agent?.attributes.is_approved ? 'Approved' : 'Pending'}
            </UITypography>
          </View>
          <View>
            <UITypography style={styles.label}>Registered Farmers</UITypography>
            <UITypography style={styles.value}>
              {agent?.attributes.farmers_count}
            </UITypography>
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
      </View>
      <UIContainedButton onPress={handleLogout} style={styles.logoutButton}>
        Logout
      </UIContainedButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,

    marginBottom: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontSize: 14, color: '#8B8B8B', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    backgroundColor: '#D32F2F', // A red color for logout/destructive actions
  },
});
