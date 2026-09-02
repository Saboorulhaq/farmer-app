import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { Toast } from 'toastify-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { styles } from './OfferDetailScreen.styled';
import UITypography from '@/components/ui/typography';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import { UIIconButton } from '@/components/ui/button';
import DownloadIcon from './DownloadIcon';
import PdfFileIcon from './PdfFileIcon';
import {
  submissionsService,
  LenderOfferDetail,
  LenderOffer,
} from '@/services/submissions.service';

type OfferDetailScreenRouteProp = RouteProp<
  {
    OfferDetail: {
      submissionId: string;
      offerId: string;
      lenderName: string;
      offerStatus?: string;
      hasAnyAcceptedOffer?: boolean;
    };
  },
  'OfferDetail'
>;

export default function OfferDetailScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<OfferDetailScreenRouteProp>();
  const { submissionId, offerId, lenderName, offerStatus, hasAnyAcceptedOffer } = route.params;
  const isAlreadyAccepted = offerStatus?.toLowerCase() === 'accepted' || hasAnyAcceptedOffer === true;

  const [offerDetail, setOfferDetail] = useState<LenderOfferDetail | null>(null);
  const [offerSummary, setOfferSummary] = useState<LenderOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferDetail();
  }, [submissionId, offerId]);

  const fetchOfferDetail = async () => {
    try {
      setLoading(true);
      // Fetch both detail and summary data in parallel
      const [detailResponse, summaryResponse] = await Promise.all([
        submissionsService.getLenderOfferDetails(submissionId),
        submissionsService.getLenderOffers(submissionId),
      ]);

      // Find the specific offer by ID
      const detail = detailResponse.data?.find((o) => o.id === offerId) ?? null;
      const summary = summaryResponse.data?.find((o) => o.id === offerId) ?? null;

      setOfferDetail(detail);
      setOfferSummary(summary);
    } catch (error) {
      console.log('Error fetching offer detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = () => {
    Alert.alert(
      'Accept Offer',
      `Are you sure you want to accept the offer from ${lenderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Navigate to SaleAgreementPreview — accept offer API is called later after signature
            navigation.navigate('SaleAgreementPreview', {
              submissionId,
              offerId,
              lenderName,
              isLenderOfferFlow: true,
            });
          },
        },
      ]
    );
  };

  const handleDownloadSanctionLetter = async () => {
    const url = offerSummary?.sanction_letter_url;
    if (!url) return;

    try {
      const dirs = RNBlobUtil.fs.dirs;
      const targetPath =
        Platform.OS === 'android'
          ? `${dirs.DownloadDir}/${sanctionLetterName}`
          : `${dirs.DocumentDir}/${sanctionLetterName}`;

      const config =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: targetPath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: sanctionLetterName,
                description: 'Sanction letter',
                mime: 'application/pdf',
                mediaScannable: true,
                path: targetPath,
              },
            }
          : {
              fileCache: true,
              path: targetPath,
            };

      const res = await RNBlobUtil.config(config).fetch('GET', url);
      const savedPath = res.path();

      Toast.success('Sanction letter downloaded successfully');

      if (Platform.OS === 'ios') {
        try {
          RNBlobUtil.ios.previewDocument(savedPath);
        } catch {}
      } else {
        try {
          RNBlobUtil.android.actionViewIntent(savedPath, 'application/pdf');
        } catch {}
      }
    } catch (error) {
      console.error('Sanction letter download error:', error);
      Toast.error('Unable to download the document. Please try again.');
    }
  };

  const getProcessingFee = () => {
    if (offerSummary?.processing_fee) {
      const raw = offerSummary.processing_fee.replace(/%/g, '');
      return raw.replace(/\.?0+$/, '').replace(/\.$/, '') + '%';
    }
    const fee = offerDetail?.fees?.find((f) => f.fee_code === 'PROCESSING_FEE');
    if (fee?.fee_percent) {
      return parseFloat(fee.fee_percent).toString() + '%';
    }
    return '-';
  };

  const getPenaltyCharges = () => {
    if (offerSummary?.penalty_charges_rate) {
      return offerSummary.penalty_charges_rate;
    }
    const fee = offerDetail?.fees?.find((f) => f.fee_code === 'LATE_PAYMENT_FEE');
    if (fee?.fee_percent) {
      return parseFloat(fee.fee_percent).toString() + '% p.a.';
    }
    return '-';
  };

  const getOfferStatus = () => {
    if (offerSummary?.offer_status) {
      return offerSummary.offer_status;
    }
    if (offerDetail?.status) {
      return offerDetail.status.charAt(0).toUpperCase() + offerDetail.status.slice(1);
    }
    return '-';
  };

  const getOfferExpiryDate = () => {
    if (offerSummary?.offer_expiry_date) {
      return offerSummary.offer_expiry_date;
    }
    if (offerDetail?.valid_until) {
      const date = new Date(offerDetail.valid_until);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return '-';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  if (!offerDetail && !offerSummary) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <UITypography variant="medium">Failed to load offer details</UITypography>
      </View>
    );
  }

  const approvedLimit = offerSummary?.approved_limit ?? offerDetail?.approved_limit ?? '0';
  const currency = offerSummary?.currency ?? offerDetail?.currency ?? 'PKR';
  const interestRate = offerSummary?.interest_rate ?? `${offerDetail?.offer_terms?.interest_rate ?? '-'}%`;
  const interestRateType = offerSummary?.interest_rate_type ?? offerDetail?.offer_terms?.interest_rate_type ?? '-';
  const tenure = offerSummary?.tenure ?? '-';
  const repaymentFrequency = offerSummary?.repayment_frequency ?? offerDetail?.offer_terms?.repayment_frequency ?? '-';
  const hasSanctionLetter = offerDetail?.documents?.some((d) => d.document_code === 'SANCTION_LETTER') || !!offerSummary?.sanction_letter_url;
  const sanctionLetterName = `Sanction_Letter_${lenderName.replace(/[^a-zA-Z]/g, '')}.pdf`;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <UIIconButton onPress={() => navigation.goBack()}>
          <ArrowLeftIcon />
        </UIIconButton>
        <Text style={styles.headerTitle}>{lenderName}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Approved Limit Card */}
        <View style={styles.approvedLimitCard}>
          <Text style={styles.approvedLimitAmount}>
            Rs {Number(approvedLimit).toLocaleString()}
          </Text>
          <Text style={styles.approvedLimitLabel}>Approved Limit</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>{interestRate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Interest Rate Type</Text>
              <Text style={styles.detailValue}>{interestRateType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Loan Tenure</Text>
              <Text style={styles.detailValue}>{tenure}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Repayment Frequency</Text>
              <Text style={styles.detailValue}>{repaymentFrequency}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Processing Fee</Text>
              <Text style={styles.detailValue}>{getProcessingFee()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Penalty Charges</Text>
              <Text style={styles.detailValue}>{getPenaltyCharges()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Offer Expiry Date</Text>
              <Text style={styles.detailValue}>{getOfferExpiryDate()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Offer Status</Text>
              <Text style={styles.detailValue}>{getOfferStatus()}</Text>
            </View>
          </View>
        </View>

        {/* Sanction Letter */}
        {hasSanctionLetter && (
          <View style={styles.sanctionCard}>
            <Text style={styles.sanctionLabel}>Sanction Letter</Text>
            <View style={styles.sanctionFileRow}>
              <PdfFileIcon width={16} height={20} />
              <Text style={[styles.sanctionFileName, { marginLeft: 8 }]}>{sanctionLetterName}</Text>
              <Pressable style={styles.downloadButton} onPress={handleDownloadSanctionLetter}>
                <DownloadIcon width={20} height={20} color="#099453" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Accept Offer Button - hidden if offer is already accepted */}
        {!isAlreadyAccepted && (
          <View style={[styles.ctaContainer, { paddingBottom: bottom + 20 }]}>
            <Pressable
              style={styles.acceptButton}
              onPress={handleAcceptOffer}
            >
              <Text style={styles.acceptButtonText}>
                Accept Offer
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
