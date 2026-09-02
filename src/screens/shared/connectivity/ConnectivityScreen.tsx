import WifiErrorIcon from '@/components/icons/WifiErrorIcon';
import WifiSuccessIcon from '@/components/icons/WifiSuccessIcon';
import { UIContainedButton, UITypography } from '@/components/ui';
import { useConnectionStore } from '@/store/useConnectionStore';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const ConnectivityScreen = () => {
  const navigation = useNavigation();
  const [showDraftModal, setShowDraftModal] = useState(false);
  const {
    connectionState: { loading, type, buttonText },
    checkConnection,
  } = useConnectionStore();

  const handleNext = () => {
    setShowDraftModal(true);
  };

  const handleRetry = () => {
    checkConnection();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginBottom: 28 }}>
          {type === 'success' ? <WifiSuccessIcon /> : <WifiErrorIcon />}
        </View>
        <UITypography variant="medium" style={styles.title}>
          {type === 'success'
            ? 'Online Connection Restored'
            : 'You are currently offline'}
        </UITypography>
        <UITypography variant="medium" style={styles.message}>
          {type === 'success'
            ? '"Your internet connection was restored."'
            : '"You\'re currently offline. Check your connection and try again later."'}
        </UITypography>
      </View>
      {buttonText && (
        <UIContainedButton
          loading={loading}
          onPress={type === 'error' ? handleRetry : handleNext}
          style={{
            width: '100%',
          }}
        >
          {buttonText}
        </UIContainedButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 22,
    fontSize: 36,
    color: '#404040',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#404040',
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});

export default ConnectivityScreen;
