import { UITypography } from '@/components/ui';
import { useAppConfigStore } from '@/store/useAppConfigStore';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AuthFarmerPrivacyModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const appName = useAppConfigStore(state => state.appName);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <UITypography variant="semiBold" style={styles.title}>
            Privacy Policy
          </UITypography>

          <ScrollView style={styles.scrollView}>
            <UITypography variant="regular" style={styles.bodyText}>
              {`1. INTRODUCTION

${appName} (including its subsidiaries) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and protect your data when you hold an account with us, use our products or services, or visit our Mobile App.

We may update this policy periodically to reflect legal or operational changes. Please review it regularly.

2. DEFINITIONS AND INTERPRETATION

“Applicable Law” means the Data Protection Act 2012 (Act 843) and other relevant regulations.
“Personal Data” means any information that identifies you directly or indirectly.
“Processing” refers to any operation performed on your personal data, such as collection, storage, or sharing.

3. THE DATA WE COLLECT

We may collect:
• Identity data — name, ID card number, date of birth, gender, etc.
• Contact data — address, phone number, email.
• Financial data — bank or payment details.
• Transaction data — details of your payments and activities.
• Technical data — IP address, device info, browser type.
• Profile and usage data — app usage, preferences, and feedback.

4. HOW YOUR DATA IS COLLECTED

We collect your data when you:
• Apply for our products or services
• Interact with our app or customer support
• Participate in surveys or promotions
• Provide data via third parties (e.g., National ID Authority)

5. HOW WE USE YOUR DATA

We use your personal data to:
• Verify your identity and provide our services
• Comply with legal obligations
• Manage your account and relationship with us
• Prevent fraud and enhance security
• Conduct research, analytics, and service improvements

6. MARKETING

We may send promotional information if you have not opted out. You can opt out anytime by contacting us.

7. COOKIES

We use cookies to enhance your experience and analyze app usage. You can disable cookies in your device settings, but some app functions may be affected.

8. WHO WE SHARE YOUR DATA WITH

We may share your data with:
• Regulatory and law enforcement authorities
• Financial institutions for processing transactions
• Authorized service providers under confidentiality agreements

9. DATA TRANSFER

Your data may be transferred or stored in other jurisdictions with proper safeguards to ensure adequate protection.

10. DATA SECURITY

We apply technical and organizational measures to protect your data from unauthorized access, alteration, or loss.

11. DATA RETENTION

We retain your personal data only as long as necessary to fulfill our legal and operational obligations.

12. YOUR RIGHTS

You have the right to:
• Access your data
• Correct or delete inaccuracies
• Withdraw consent to data processing
• Request data portability

13. CHANGES TO THIS POLICY

We may update this policy from time to time. Continued use of our app signifies acceptance of the updated terms.`}
            </UITypography>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <UITypography variant="bold" style={styles.closeText}>
              CLOSE
            </UITypography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: width,
    justifyContent: 'flex-end',
    backgroundColor: '#00000080',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopEndRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
  },
  bodyText: {
    color: '#8B8B8B',
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#099453',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    marginTop: 10,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
