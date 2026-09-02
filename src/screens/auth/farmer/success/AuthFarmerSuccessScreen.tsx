import { UIContainedButton, UITypography } from '@/components/ui';
import { useRegisterStore } from '@/store/useRegisterStore';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './AuthFarmerSuccessScreen.styled';

export default function AuthFarmerSuccessScreen() {
  const { top } = useSafeAreaInsets();
  const { role, userDetails } = useRegisterStore();
  const navigation = useNavigation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      // Defer navigation to avoid updating during render
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'FarmerMain' }],
          }),
        );
      }, 0);
    }
  }, [countdown, navigation]);

  const handleGoToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'FarmerMain' }],
      }),
    );
  };

  return (
    <View
      style={[
        styles.scrollView,
        {
          paddingTop: top + 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Image
        source={require('@/assets/gifs/success.gif')}
        style={{ width: 200, height: 200 }}
      />

      <UITypography
        variant="medium"
        style={{ fontSize: 36, textAlign: 'center', marginBottom: 16 }}
      >
        Congratulations!
      </UITypography>

      <UITypography
        variant="medium"
        style={{ fontSize: 16, textAlign: 'center', color: '#404040' }}
      >
        {role === 'farmer'
          ? 'Your profile has been successfully created.'
          : 'Thank you! Your account request has\nbeen submitted and is now\nunder verification.'}
      </UITypography>
      {/* 
      {role === 'farmer' && (
        <View style={{ width: '100%', maxWidth: 300, marginTop: 24, gap: 6 }}>
          {[
            { label: 'Name', value: userDetails.name },
            { label: 'NADRA ID', value: userDetails.ghana_card_number },
            { label: 'Date', value: new Date().toLocaleDateString() },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <UITypography
                variant="semiBold"
                style={{ fontSize: 16, color: '#000' }}
              >
                {item.label}
              </UITypography>
              <UITypography
                variant="medium"
                style={{ fontSize: 16, color: '#000' }}
              >
                {item.value}
              </UITypography>
            </View>
          ))}
        </View>
      )} */}

      <UITypography
        variant="regular"
        style={{ marginTop: 20, color: '#666', fontSize: 14 }}
      >
        Redirecting to login screen in {countdown} second
        {countdown !== 1 ? 's' : ''}...
      </UITypography>

      <UIContainedButton
        onPress={handleGoToLogin}
        style={{ marginTop: 24, width: '100%', maxWidth: 300 }}
      >
        Go to Login Page
      </UIContainedButton>
    </View>
  );
}
