import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { UIContainedButton, UITypography } from '@/components/ui';
import { UIOutlinedButton } from '@/components/ui/button';

interface RoleChangeModalProps {
  visible: boolean;
  farmerName: string;
  targetRole: 'farmer' | 'agent';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function RoleChangeModal({
  visible,
  farmerName,
  targetRole,
  onConfirm,
  onCancel,
  loading = false,
}: RoleChangeModalProps) {
  const existingRole = targetRole === 'agent' ? 'farmer' : 'agent';
  const title = targetRole === 'agent' ? 'Existing Farmer Found' : 'Existing Agent Found';
  const messageWithName = `"${farmerName}" is already registered as ${existingRole === 'agent' ? 'an' : 'a'} ${existingRole}. Would you like to add the ${targetRole} role to this account?`;
  const messageWithoutName = `This user is already registered as ${existingRole === 'agent' ? 'an' : 'a'} ${existingRole}. Would you like to add the ${targetRole} role to this account?`;

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <UITypography variant="semiBold" style={styles.title}>
            {title}
          </UITypography>
          <UITypography variant="regular" style={styles.message}>
            {farmerName ? messageWithName : messageWithoutName}
          </UITypography>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <UIOutlinedButton onPress={onCancel} disabled={loading}>
                No
              </UIOutlinedButton>
            </View>
            <View style={styles.buttonWrapper}>
              <UIContainedButton onPress={onConfirm} loading={loading}>
                Yes
              </UIContainedButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#404040',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
