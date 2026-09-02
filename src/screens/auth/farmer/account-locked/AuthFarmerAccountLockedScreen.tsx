import { UIContainedButton, UITypography } from '@/components/ui';
import { useAuth } from '@/constants/context/auth/context';
import { FarmerAuthNavigationProp } from '@/navigation/auth/farmer/AuthFarmerNavigation';
import { useRegisterStore } from '@/store/useRegisterStore';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthFarmerAccountLockedScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<FarmerAuthNavigationProp>();
  const { role, userDetails, updateUserDetailsField } = useRegisterStore();
  const { getTrustedCard } = useAuth();
  const card = getTrustedCard(role);
  const handleReset = () => {
    navigation.navigate('OTPVerification', {
      redirect: 'ResetPIN',
      resend: true,
      login: true,
    } as never);
    updateUserDetailsField(
      'ghana_card_number',
      card?.card_number || userDetails.ghana_card_number || '',
    );
  };
  console.log(userDetails.ghana_card_number);

  return (
    <ScrollView
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
          paddingBottom: bottom + 20,
        },
      ]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/access-denied.png')}
          style={styles.lockIcon}
        />
        <UITypography variant="medium" style={styles.title}>
          Account Locked
        </UITypography>
        <UITypography variant="regular" style={styles.description}>
          Your account has been locked due to many incorrect PIN attempts.
          {'\n'}Please reset your account to continue.
        </UITypography>
        <View style={styles.buttonContainer}>
          <UIContainedButton onPress={handleReset}>Reset PIN</UIContainedButton>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#404040',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
});
