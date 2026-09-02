import { UIContainedButton, UITypography } from '@/components/ui';
import UIBottomModal from '@/components/ui/modal';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import React from 'react';
import { View } from 'react-native';

export default function AuthFarmerMainRegsterModal({
  modalText,
  registerModal,
  handleRegisterModalClose,
  handleRegisterModalCreateAccount,
}: {
  modalText: 'farmer_as_agent' | 'register' | '';
  registerModal: boolean;
  handleRegisterModalClose: () => void;
  handleRegisterModalCreateAccount: () => void;
}) {
  const appName = useAppConfigStore(state => state.appName);

  return (
    <UIBottomModal
      visible={registerModal}
      onRequestClose={handleRegisterModalClose}
      backdropClose
    >
      <View style={{ width: '100%', gap: 24, alignItems: 'center' }}>
        <UITypography
          variant="medium"
          style={{
            fontSize: 26,
            textAlign: 'center',
          }}
        >
          {modalText === 'farmer_as_agent'
            ? 'Hello Farmer,\n Want to register as a agent?\nRegister now'
            : `New to ${appName}?\nRegister now`}
        </UITypography>
        <UIContainedButton
          onPress={handleRegisterModalCreateAccount}
          style={{ width: '100%' }}
        >
          Create account
        </UIContainedButton>
      </View>
    </UIBottomModal>
  );
}
