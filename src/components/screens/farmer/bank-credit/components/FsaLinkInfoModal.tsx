import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import UICenterModal from '@/components/ui/modal/center';
import UITypography from '@/components/ui/typography';
import { UIContainedButton, UIIconButton } from '@/components/ui/button';
import CrossIcon from '@/components/icons/CrossIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSkip?: () => void;
  onProceed?: () => void;
  title?: string;
  body?: string;
}

export default function FsaLinkInfoModal({
  visible,
  onClose,
  onSkip,
  onProceed,
  title = 'You had opted to link to a Sale Agreement.',
  body = 'Linking to Smart FSA Contract gives you access to government - verified buyers and guaranteed pricing.',
}: Props) {
  const handleSkip = () => {
    onSkip ? onSkip() : onClose();
  };

  const handleProceed = () => {
    onProceed ? onProceed() : onClose();
  };

  return (
    <UICenterModal visible={visible} onRequestClose={onClose} backdropClose>
      <View style={styles.card}>
        <UIIconButton style={styles.closeBtn} onPress={onClose}>
          <View style={styles.closeCircle}>
            <CrossIcon size={10} />
          </View>
        </UIIconButton>

        <UITypography variant="semiBold" style={styles.title}>
          {title}
        </UITypography>
        <UITypography variant="regularItalic" style={styles.body}>
          {body}
        </UITypography>

        <View style={styles.actions}>
          <Pressable onPress={handleSkip} style={styles.skipTouchable}>
            <UITypography variant="medium" style={styles.skipText}>
              Skip
            </UITypography>
          </Pressable>
          <UIContainedButton size="medium" onPress={handleProceed} style={styles.proceedBtn}>
            Proceed
          </UIContainedButton>
        </View>
      </View>
    </UICenterModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 24,
    shadowColor: 'rgba(109, 109, 109, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  closeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(109, 109, 109, 0.1)',
    shadowColor: 'rgba(32, 31, 31, 0.6)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    color: '#101010',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    lineHeight: 20,
    width: '70%',
  },
  body: {
    marginTop: 12,
    color: '#333333',
    fontFamily: 'Poppins-Italic',
    fontSize: 12,
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 6,
  },
  skipTouchable: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  skipText: {
    color: '#333333',
    fontSize: 16,
  },
  proceedBtn: {
    height: 40,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 5,
  },
});
