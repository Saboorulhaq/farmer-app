import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Image,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { styles } from './LoanStatusScreen.styled';
import UITypography from '@/components/ui/typography';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import { UIIconButton } from '@/components/ui/button';
import BankCreditImage from '@/assets/images/bank-credit.png';
import ProgressStepIcon from './ProgressStepIcon';
import ViewOffersIcon from './ViewOffersIcon';
import ViewSummaryIcon from './ViewSummaryIcon';
import {
  submissionsService,
  SubmissionStatusAttributes,
  ProgressStep,
  NextStep,
} from '@/services/submissions.service';

type LoanStatusScreenRouteProp = RouteProp<
  { LoanStatus: { submissionId: string } },
  'LoanStatus'
>;

export default function LoanStatusScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<LoanStatusScreenRouteProp>();
  const { submissionId } = route.params;

  const [statusData, setStatusData] = useState<SubmissionStatusAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [offersCount, setOffersCount] = useState(0);

  useEffect(() => {
    fetchStatusData();
    fetchOffersCount();
  }, [submissionId]);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      const response = await submissionsService.getSubmissionStatus(submissionId);
      setStatusData(response.data.attributes);
    } catch (error) {
      console.log('Error fetching submission status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersCount = async () => {
    try {
      const response = await submissionsService.getLenderOffers(submissionId);
      setOffersCount(response.data?.length ?? 0);
    } catch (error) {
      // Offers may not be available yet
      setOffersCount(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  if (!statusData) {
    return (
      <View style={styles.errorContainer}>
        <UITypography variant="medium">Failed to load status data</UITypography>
      </View>
    );
  }

  const facilitySummary = statusData.facility_summary;
  const harvestSummary = statusData.harvest_summary;

  // next_steps as plain string array (e.g. sell-harvest)
  const nextStepsStrings: string[] = Array.isArray(statusData.next_steps)
    ? (statusData.next_steps as string[])
    : [];

  // Normalize steps from either progress_tracker (old) or next_steps (new)
  type NormalizedStep = {
    title: string;
    status: 'In Progress' | 'Pending' | 'Completed';
    description?: string;
    started_tag?: string | null;
    order: number;
  };

  const normalizeStatus = (status: string): 'In Progress' | 'Pending' | 'Completed' => {
    switch (status) {
      case 'in_progress':
      case 'In Progress':
        return 'In Progress';
      case 'completed':
      case 'Completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  const progressSteps: NormalizedStep[] = (() => {
    if (statusData.progress_tracker?.steps?.length) {
      return statusData.progress_tracker.steps.map((s: ProgressStep) => ({
        ...s,
        status: normalizeStatus(s.status),
      }));
    }
    if (
      statusData.next_steps &&
      !Array.isArray(statusData.next_steps) &&
      statusData.next_steps.steps?.length
    ) {
      return (statusData.next_steps as { steps: NextStep[] }).steps.map(
        (s: NextStep) => ({
          title: s.title,
          status: normalizeStatus(s.status),
          order: s.order,
        })
      );
    }
    return [];
  })();

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
        return styles.progressStepBadgeInProgress;
      case 'Completed':
        return styles.progressStepBadgeCompleted;
      default:
        return styles.progressStepBadgePending;
    }
  };

  const getStatusBadgeTextStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
        return styles.progressStepBadgeTextInProgress;
      case 'Completed':
        return styles.progressStepBadgeTextCompleted;
      default:
        return styles.progressStepBadgeTextPending;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
        return styles.progressStepStatusInProgress;
      case 'Completed':
        return styles.progressStepStatusCompleted;
      default:
        return styles.progressStepStatusPending;
    }
  };

  const getIconTypeForStep = (title: string): 'search' | 'clipboard' | 'shield' | undefined => {
    const lower = title.toLowerCase();
    if (lower.includes('review')) return 'search';
    if (lower.includes('confirmation') || lower.includes('fsa')) return 'clipboard';
    if (lower.includes('approval') || lower.includes('final')) return 'shield';
    return undefined;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: top + 16, paddingBottom: 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <UIIconButton onPress={() => navigation.goBack()} style={{ marginBottom: 16, alignSelf: 'flex-start' }}>
          <ArrowLeftIcon />
        </UIIconButton>

        {/* Rejection Banner */}
        {statusData.rejection_note && (
          <View style={styles.rejectionBanner}>
            <UITypography variant="semiBold" style={styles.rejectionTitle}>
              ❌ Application Rejected
            </UITypography>
            <UITypography variant="medium" style={styles.rejectionNote}>
              {statusData.rejection_note}
            </UITypography>
          </View>
        )}

        {/* Facility Type Card — loan products */}
        {facilitySummary && (
          <View style={styles.facilityCard}>
            <View style={styles.facilityImageContainer}>
              <Image source={BankCreditImage} style={styles.facilityImage} resizeMode="cover" />
            </View>
            <View style={styles.facilityTextContainer}>
              <UITypography variant="medium" style={styles.facilityTypeLabel}>
                Facility Type
              </UITypography>
              <UITypography variant="semiBold" style={styles.facilityTypeValue}>
                {facilitySummary.loan_type ?? '-'}
              </UITypography>
            </View>
          </View>
        )}

        {/* Summary Cards Row — loan products */}
        {facilitySummary && (
          <View style={styles.summaryCardsRow}>
            <View style={styles.summaryCard}>
              <UITypography variant="medium" style={styles.summaryCardLabel}>
                Loan Amount
              </UITypography>
              <UITypography variant="semiBold" style={styles.summaryCardValue}>
                Rs {facilitySummary.loan_amount?.toLocaleString() ?? '-'}
              </UITypography>
            </View>
            <View style={styles.summaryCard}>
              <UITypography variant="medium" style={styles.summaryCardLabel}>
                {facilitySummary.selected_input_type ? 'Input Type' : 'Loan Duration'}
              </UITypography>
              <UITypography variant="semiBold" style={styles.summaryCardValue}>
                {facilitySummary.selected_input_type ?? facilitySummary.loan_duration ?? '-'}
              </UITypography>
            </View>
          </View>
        )}

        {/* Facility Type Card — harvest/sell products */}
        {harvestSummary && (
          <View style={styles.facilityCard}>
            <View style={styles.facilityImageContainer}>
              <Image source={BankCreditImage} style={styles.facilityImage} resizeMode="cover" />
            </View>
            <View style={styles.facilityTextContainer}>
              <UITypography variant="medium" style={styles.facilityTypeLabel}>
                Sale Type
              </UITypography>
              <UITypography variant="semiBold" style={styles.facilityTypeValue}>
                {harvestSummary.sell_type ?? '-'}
              </UITypography>
            </View>
          </View>
        )}

        {/* Summary Cards Row — harvest/sell products */}
        {harvestSummary && (
          <View style={styles.summaryCardsRow}>
            <View style={styles.summaryCard}>
              <UITypography variant="medium" style={styles.summaryCardLabel}>
                Crop
              </UITypography>
              <UITypography variant="semiBold" style={styles.summaryCardValue}>
                {harvestSummary.crop ?? '-'}
              </UITypography>
            </View>
            <View style={styles.summaryCard}>
              <UITypography variant="medium" style={styles.summaryCardLabel}>
                Volume
              </UITypography>
              <UITypography variant="semiBold" style={styles.summaryCardValue}>
                {harvestSummary.volume != null
                  ? `${harvestSummary.volume} ${harvestSummary.unit ?? ''}`
                  : '-'}
              </UITypography>
            </View>
          </View>
        )}

        {/* Next Steps — plain string list (sell-harvest) */}
        {nextStepsStrings.length > 0 && (
          <View style={styles.progressCard}>
            <UITypography variant="semiBold" style={[styles.progressStepTitle, { marginBottom: 8 }]}>
              Next Steps
            </UITypography>
            {nextStepsStrings.map((step, index) => (
              <View key={index} style={styles.progressStep}>
                <View style={styles.progressStepIconColumn}>
                  <ProgressStepIcon status="In Progress" />
                </View>
                <View style={[styles.progressStepContent, styles.progressStepContentLast]}>
                  <UITypography variant="medium" style={styles.progressStepDescription}>
                    {step}
                  </UITypography>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Progress Tracker */}
        {progressSteps.length > 0 && (
          <View style={styles.progressCard}>
            {progressSteps.map((step, index) => {
              const isLast = index === progressSteps.length - 1;
              const isActive = step.status === 'In Progress' || step.status === 'Completed';

              return (
                <View key={index} style={styles.progressStep}>
                  {/* Icon Column with Line */}
                  <View style={styles.progressStepIconColumn}>
                    <ProgressStepIcon status={step.status} iconType={getIconTypeForStep(step.title)} />
                    {!isLast && (
                      <View
                        style={[
                          styles.progressStepLine,
                          isActive
                            ? styles.progressStepLineActive
                            : styles.progressStepLinePending,
                        ]}
                      />
                    )}
                  </View>

                  {/* Content */}
                  <View
                    style={[
                      styles.progressStepContent,
                      isLast && styles.progressStepContentLast,
                    ]}
                  >
                    <View style={styles.progressStepHeader}>
                      <UITypography variant="semiBold" style={styles.progressStepTitle}>
                        {step.title}
                      </UITypography>
                      <View style={[styles.progressStepBadge, getStatusBadgeStyle(step.status)]}>
                        <Text style={[styles.progressStepBadgeText, getStatusBadgeTextStyle(step.status)]}>
                          {step.status}
                        </Text>
                      </View>
                    </View>
                    {step.status !== 'Pending' && step.started_tag && (
                      <Text style={[styles.progressStepStatus, getStatusTextStyle(step.status)]}>
                        {step.started_tag}
                      </Text>
                    )}
                    {step.status === 'Pending' && (
                      <Text style={[styles.progressStepStatus, styles.progressStepStatusPending]}>
                        Pending
                      </Text>
                    )}
                    {step.description ? (
                      <UITypography variant="medium" style={styles.progressStepDescription}>
                        {step.description}
                      </UITypography>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Bottom CTAs */}
        <View style={[styles.ctaContainer, { paddingBottom: bottom + 20 }]}>
          {/* View Offers Button */}
          <Pressable
            style={styles.viewOffersButton}
            onPress={() => navigation.navigate('ViewOffers', { submissionId })}
          >
            <ViewOffersIcon width={20} height={20} color="#FFFFFF" />
            <Text style={styles.viewOffersButtonText} numberOfLines={1}>View Offers</Text>
            {offersCount > 0 && (
              <View style={styles.offersBadge}>
                <Text style={styles.offersBadgeText}>{offersCount}</Text>
              </View>
            )}
          </Pressable>

          {/* View Summary Button */}
          <Pressable
            style={styles.viewSummaryButton}
            onPress={() => navigation.navigate('LoanSummary', { submissionId })}
          >
            <ViewSummaryIcon width={20} height={20} color="#101010" />
            <Text style={styles.viewSummaryButtonText} numberOfLines={1}>View Summary</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

