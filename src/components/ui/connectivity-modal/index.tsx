import WifiSuccessIcon from '@/components/icons/WifiSuccessIcon';
import React from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UITypography from '../typography';
import WifiErrorIcon from '@/components/icons/WifiErrorIcon';
import { UIContainedButton } from '../button';
import { useConnectionModalStore } from '@/store/useConnectionStore';

export default function UIConnectivityModal() {
  const {
    modalState: { visible, type, title, message, buttonText, loading },
    close,
    checkConnection,
  } = useConnectionModalStore();

  const handleButtonPress = () => {
    if (type === 'error') {
      checkConnection();
    } else {
      close();
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ marginBottom: 28 }}>
            {type === 'success' ? <WifiSuccessIcon /> : <WifiErrorIcon />}
          </View>
          <UITypography
            variant="medium"
            style={{
              marginBottom: 22,
              fontSize: 36,
              color: '#404040',
              textAlign: 'center',
            }}
          >
            {title}
          </UITypography>
          <UITypography
            variant="medium"
            style={{ fontSize: 16, color: '#404040', textAlign: 'center' }}
          >
            {message}
          </UITypography>
        </View>
        {buttonText && (
          <UIContainedButton
            onPress={handleButtonPress}
            loading={loading}
            disabled={loading}
            style={{
              width: '100%',
            }}
          >
            {buttonText}
          </UIContainedButton>
        )}
      </SafeAreaView>
    </Modal>
  );
}
