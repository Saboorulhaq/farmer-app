import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './index.styled';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import { UIContainedButton, UISteps, UIUploadPicker, FileInfo } from '@/components/ui';
import UITypography from '@/components/ui/typography';
import DocumentsIcon from '@/components/icons/DocumentsIcon';
import FsaLinkInfoModal from '@/components/screens/farmer/bank-credit/components/FsaLinkInfoModal';

function DocumentsHeader({ marginTop, onBack }: { marginTop: number; onBack: () => void }) {
  return (
    <LoanScreenHeader
      title="Documents"
      onBack={onBack}
      containerStyle={[styles.header, { marginTop }]}
    />
  );
}

function DocumentsCardHeader() {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.headerLeft}>
        <DocumentsIcon size={30} bgFill="#1D3A70" borderColor="#1D3A70" strokeColor="#FFFFFF" />
        <UITypography variant="semiBold" style={styles.cardTitle}>Supporting Documents (Optional)</UITypography>
      </View>
    </View>
  );
}

function DocumentsInfoRow() {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoBadge}>
        <Text style={styles.infoText}>i</Text>
      </View>
      <Text style={styles.infoHint}>
        Please upload PDF, PNG, JPG, SVG file format and we support max size 10 MB
      </Text>
    </View>
  );
}

export default function Documents() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();

  const [farmDoc, setFarmDoc] = useState<FileInfo | null>(null);
  const [agreementDoc, setAgreementDoc] = useState<FileInfo | null>(null);
  const [loanDoc, setLoanDoc] = useState<FileInfo | null>(null);
  const [fsaModalVisible, setFsaModalVisible] = useState(false);

  const handleNext = () => {
    console.log({ farmDoc, agreementDoc, loanDoc });
    setFsaModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <DocumentsHeader marginTop={top} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <UISteps steps={5} current={5} style={styles.stepsWrap} />

        <View style={styles.card}>
          <DocumentsCardHeader />
          <DocumentsInfoRow />

          <View style={styles.uploadList}>
            <UIUploadPicker 
              label="Farm Ownership / Lease Document" 
              file={farmDoc}
              onUpload={setFarmDoc}
              onDelete={() => setFarmDoc(null)}
            />
            <UIUploadPicker 
              label="Existing Buyer Agreement or Commitment Letter" 
              file={agreementDoc}
              onUpload={setAgreementDoc}
              onDelete={() => setAgreementDoc(null)}
            />
            <UIUploadPicker 
              label="Any Previous Loan Statement" 
              file={loanDoc}
              onUpload={setLoanDoc}
              onDelete={() => setLoanDoc(null)}
            />
          </View>
        </View>

        <Text style={styles.noteText}>Please note that banks might visit for physical inspection.</Text>

        <UIContainedButton style={styles.nextButton} onPress={handleNext}>
          Next
        </UIContainedButton>
      </ScrollView>
      <FsaLinkInfoModal
        visible={fsaModalVisible}
        onClose={() => setFsaModalVisible(false)}
        onSkip={() => {
          setFsaModalVisible(false);
          navigation.navigate('LoanRequestOTPVerification');
        }}
        onProceed={() => {
          setFsaModalVisible(false);
          navigation.navigate('GovernmentVerifiedBuyers');
        }}
      />
    </View>
  );
}
