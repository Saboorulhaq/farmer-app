import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import FSADocIcon from '@/components/icons/FSADocIcon';
import ExecuteFSAIcon from '@/components/icons/ExecuteFSAIcon';

type RouteParams = {
  ActiveLoanDetail: {
    loan?: {
      name?: string;
      orderId?: string;
      dueDate?: string;
      amount?: string;
      status?: string;
    };
  };
};

interface DetailRowProps {
  label: string;
  value: string;
  showBorder?: boolean;
  valueNode?: React.ReactNode;
}

function DetailRow({ label, value, showBorder = true, valueNode }: DetailRowProps) {
  return (
    <View style={[styles.detailRow, showBorder && styles.detailRowBorder]}>
      <UITypography variant="semiBold" style={styles.detailLabel}>
        {label}:
      </UITypography>
      {valueNode ?? (
        <UITypography variant="regular" style={styles.detailValue}>
          {value}
        </UITypography>
      )}
    </View>
  );
}

export default function ActiveLoanDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ActiveLoanDetail'>>();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Loan Summary
        </UITypography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <UITypography variant="medium" style={styles.amountLabel}>
            Amount to be paid
          </UITypography>
          <UITypography variant="bold" style={styles.amountValue}>
            Rs 1,05,000
          </UITypography>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Due Date Banner */}
          <View style={styles.dueBanner}>
            <UITypography variant="medium" style={styles.dueBannerText}>
              {'Due on '}
              <UITypography variant="bold" style={styles.dueBannerBold}>
                29 January 2023
              </UITypography>
            </UITypography>
          </View>

          {/* First Section: Provider info */}
          <View style={styles.detailSection}>
            <DetailRow label="Provider Name" value="B Traders" />
            <DetailRow label="Disbursal Date" value="21 April 2023" />
            <DetailRow label="Order ID" value="8973628333" />
            <DetailRow label="Tenure" value="7 days" showBorder={false} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Second Section: Financial details */}
          <View style={styles.detailSection}>
            <DetailRow label="Disbursed Amount" value="Rs 105000" />
            <DetailRow label="Days Past Due" value="2 days" />
            <DetailRow label="Interest Rate" value="10% p.a" />
            <DetailRow label="Interest Amount" value="Rs 2,500" />
            <DetailRow label="Penalty" value="0.1% per day" />
            <DetailRow label="Penalty Amount" value="Rs 20" />
            <DetailRow label="Repayment Amount" value="Rs 300000" showBorder={false} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Credit Product Row */}
          <View style={styles.creditProductRow}>
            <UITypography variant="semiBold" style={styles.creditProductLabel}>
              Credit Product:
            </UITypography>
            <View style={styles.creditProductValue}>
              <View style={styles.bankLogoPlaceholder}>
                <UITypography variant="bold" style={styles.bankLogoText}>
                  HBL
                </UITypography>
              </View>
              <UITypography variant="regular" style={styles.bankNameText}>
                HBL
              </UITypography>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* View FSA Button */}
          <Pressable style={styles.viewFsaButton}>
            <FSADocIcon size={22} color="#101010" />
            <UITypography variant="bold" style={styles.viewFsaText}>
View Smart FSA Contract
            </UITypography>
          </Pressable>

          {/* Execute FSA Button */}
          <Pressable style={styles.executeFsaButton}>
            <ExecuteFSAIcon width={16} height={22} color="#FFFFFF" />
            <UITypography variant="bold" style={styles.executeFsaText}>
Execute Smart FSA Contract
            </UITypography>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: '#101010',
    textAlign: 'center',
    lineHeight: 28,
  },

  /* Amount Section */
  amountSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#5C5C5C',
    lineHeight: 24,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  amountValue: {
    fontSize: 40,
    color: '#1D3A70',
    lineHeight: 48,
    letterSpacing: 0.3,
  },

  /* Details Card */
  detailsCard: {
    marginHorizontal: 17,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 24,
  },

  /* Due Date Banner */
  dueBanner: {
    backgroundColor: '#FDF2CD',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E2B1',
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dueBannerText: {
    fontSize: 14,
    color: '#1D3A70',
    lineHeight: 21,
    textAlign: 'center',
  },
  dueBannerBold: {
    fontSize: 14,
    color: '#1D3A70',
    lineHeight: 21,
  },

  /* Detail Sections */
  detailSection: {
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 21,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 21,
    textAlign: 'right',
    flex: 1,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 0,
  },

  /* Credit Product Row */
  creditProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  creditProductLabel: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 21,
    flex: 1,
  },
  creditProductValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankLogoPlaceholder: {
    width: 32,
    height: 22,
    backgroundColor: '#1D3A70',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogoText: {
    fontSize: 7,
    color: '#FFFFFF',
    lineHeight: 10,
  },
  bankNameText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 21,
  },

  /* Buttons */
  buttonsContainer: {
    paddingHorizontal: 40,
    gap: 16,
  },
  viewFsaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  viewFsaText: {
    fontSize: 16,
    color: '#101010',
    lineHeight: 24,
  },
  executeFsaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#099453',
    gap: 10,
  },
  executeFsaText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});
