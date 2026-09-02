import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Pressable,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { styles } from './LoanSummaryScreen.styled';
import UITypography from '@/components/ui/typography';
import { UIIconButton, UIContainedButton } from '@/components/ui/button';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import CheckMarkImage from '@/assets/images/check-mark.png';
import { useFarmer } from '@/constants/context/farmer/context';
import { axiosPublic } from '@/config/axios';
import { Toast } from 'toastify-react-native';
import FacilityIcon from './icons/FacilityIcon';
import PersonalIcon from './icons/PersonalIcon';
import FarmIcon from './icons/FarmIcon';
import HarvestIcon from './icons/HarvestIcon';
import FSAIcon from './icons/FSAIcon';
import AddFarmIcon from './icons/AddFarmIcon';
import {
  submissionsService,
  SubmissionSummaryAttributes,
  Farm,
} from '@/services/submissions.service';

type LoanSummaryScreenRouteProp = RouteProp<
  { LoanSummary: { submissionId: string; fromStepper?: boolean } },
  'LoanSummary'
>;

interface SummaryRowProps {
  label: string;
  value: string;
  showBorder?: boolean;
}

function SummaryRow({ label, value, showBorder = true }: SummaryRowProps) {
  return (
    <View style={[styles.summaryRow, showBorder && styles.summaryRowBorder]}>
      <UITypography variant="medium" style={styles.summaryRowLabel}>
        {label}
      </UITypography>
      <View style={styles.summaryRowValueContainer}>
        <UITypography variant="medium" style={styles.summaryRowValue}>
          {value}
        </UITypography>
      </View>
    </View>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>{icon}</View>
        <UITypography variant="semiBold" style={styles.sectionTitle}>
          {title}
        </UITypography>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function LoanSummaryScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<LoanSummaryScreenRouteProp>();
  const { submissionId, fromStepper } = route.params;
  const { farmer } = useFarmer();

  const [summaryData, setSummaryData] = useState<SubmissionSummaryAttributes | null>(
    null
  );
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, farmsResponse] = await Promise.all([
        submissionsService.getSubmissionSummary(submissionId),
        submissionsService.getAllFarms(),
      ]);
      setSummaryData(summaryResponse.data.attributes);
      setFarms(farmsResponse.data);
    } catch (error) {
      console.log('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  if (!summaryData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <UITypography variant="medium">Failed to load summary data</UITypography>
      </View>
    );
  }

  // Check product type
  const isBuyInputs = summaryData.product_slug === 'buy-inputs';
  const isSellHarvest = summaryData.product_slug === 'sell-harvest';

  // Validate required fields based on product type
  if (!isBuyInputs && !isSellHarvest && !summaryData.facility_details) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <UITypography variant="medium">Failed to load summary data</UITypography>
      </View>
    );
  }

  // Get farm details from farm_id
  const getFarmDetails = (farmId: string) => {
    return farms.find((farm) => farm.uuid === farmId);
  };

  // Helper function to format intended purpose
  const formatIntendedPurpose = (purposes: string[]) => {
    if (!purposes || purposes.length === 0) return '-';
    return purposes
      .map((p) => p.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()))
      .join(', ');
  };

  // Helper function to convert snake_case to Title Case
  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\bFsa\b/g, 'Smart FSA Contract');
  };

  // Helper function to format values based on type
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      return value.length > 0 
        ? value.map(v => typeof v === 'string' ? formatLabel(v) : String(v)).join(', ')
        : '-';
    }
    if (typeof value === 'object') return '-'; // Skip nested objects for now
    return String(value);
  };

  // Helper function to dynamically render summary rows from an object
  const renderDynamicRows = (data: Record<string, any>, fieldsToSkip: string[] = []) => {
    const entries = Object.entries(data).filter(([key]) => !fieldsToSkip.includes(key));
    
    return entries.map(([key, value], index) => {
      const isLast = index === entries.length - 1;
      return (
        <SummaryRow
          key={key}
          label={formatLabel(key)}
          value={formatValue(value)}
          showBorder={!isLast}
        />
      );
    });
  };

  // Handle proceeding to OTP verification
  const handleRequestLoan = async () => {
    if (!farmer?.attributes?.phone_number) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Phone number not found. Please contact support.',
      });
      return;
    }

    try {
      setIsRequestingOtp(true);
      console.log('📤 Requesting OTP for:', farmer.attributes.phone_number);
      
      const payload = {
        data: {
          attributes: {
            phone_number: farmer.attributes.phone_number,
            email: farmer?.attributes?.email,
            skip_count_check: true,
            flow: 'LOAN_REQUEST_OTP',
          },
        },
      };

      await axiosPublic.post('/users/request_otp', payload);

      // For the bank-credit-facility product, show the bank selection screen
      // before OTP verification. Pressing Continue there proceeds to the OTP screen.
      if (summaryData?.product_slug === 'bank-credit-facility') {
        navigation.navigate('BankSelection', {
          productSubmissionId: submissionId,
          otpFlow: 'LOAN_REQUEST_OTP',
        });
      } else {
        navigation.navigate('LoanRequestOTPVerification', {
          productSubmissionId: submissionId,
          otpFlow: 'LOAN_REQUEST_OTP',
        });
      }
    } catch (error: any) {
      console.log('request_otp error', error);
      const errorMsg = error?.response?.data?.error || 'Failed to request OTP';
      
      if (error.code === 'NETWORK_ERROR' || !error?.response) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your internet connection and try again',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMsg,
        });
      }
    } finally {
      setIsRequestingOtp(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: top + 20, paddingBottom: bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <UIIconButton onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeftIcon />
          </UIIconButton>
          <UITypography variant="semiBold" style={styles.title}>
            Summary
          </UITypography>
          <View style={styles.headerSpacer} />
        </View>

        {/* Subtitle */}
        <UITypography variant="medium" style={styles.subtitle}>
          Review your {isBuyInputs ? 'order' : 'loan'} details before submitting your request.
        </UITypography>

        {/* Approval Banner */}
        {summaryData.status === 'approved' && (
          <View style={styles.approvalBanner}>
            <View style={styles.approvalHeader}>
              <Image source={CheckMarkImage} style={styles.checkMarkIcon} />
              <UITypography variant="semiBold" style={styles.approvalTitle}>
                Application Approved
              </UITypography>
            </View>
            <UITypography variant="medium" style={styles.approvalNote}>
              Congratulations! Your loan application has been approved.
            </UITypography>
          </View>
        )}

        {/* Rejection Banner */}
        {summaryData.rejection_note && (
          <View style={styles.rejectionBanner}>
            <UITypography variant="semiBold" style={styles.rejectionTitle}>
              ❌ Application Rejected
            </UITypography>
            <UITypography variant="medium" style={styles.rejectionNote}>
              {summaryData.rejection_note}
            </UITypography>
          </View>
        )}

        {/* Sell Harvest Product - Show harvest sections */}
        {isSellHarvest && summaryData.harvest_details && (
          <>
            {/* Harvest Details for Sell Harvest */}
            <SectionCard icon={<HarvestIcon />} title="Harvest Details">
              <SummaryRow
                label="Crop"
                value={(summaryData.harvest_details as any).crop || '-'}
              />
              <SummaryRow
                label="Expected Yield"
                value={
                  (summaryData.harvest_details as any).expected_yield
                    ? `${(summaryData.harvest_details as any).expected_yield} ${(summaryData.harvest_details as any).expected_yield_unit || ''}`
                    : '-'
                }
              />
              <SummaryRow
                label="Pickup Location"
                value={(summaryData.harvest_details as any).pickup_location || '-'}
              />
              <SummaryRow
                label="Sell Type"
                value={(summaryData.harvest_details as any).sell_type || '-'}
                showBorder={false}
              />
            </SectionCard>

            {/* Sale Details */}
            <SectionCard icon={<FacilityIcon />} title="Sale Details">
              <SummaryRow
                label="Buyer ID"
                value={(summaryData.harvest_details as any).buyer || '-'}
              />
              <SummaryRow
                label="Volume"
                value={
                  (summaryData.harvest_details as any).volume
                    ? `${(summaryData.harvest_details as any).volume} ${(summaryData.harvest_details as any).unit || ''}`
                    : '-'
                }
              />
              <SummaryRow
                label="Unit Price"
                value={
                  (summaryData.harvest_details as any).unit_price
                    ? `Rs ${(summaryData.harvest_details as any).unit_price}`
                    : '-'
                }
              />
              <SummaryRow
                label="Total Amount"
                value={
                  (summaryData.harvest_details as any).volume && (summaryData.harvest_details as any).unit_price
                    ? `Rs ${((summaryData.harvest_details as any).volume * (summaryData.harvest_details as any).unit_price).toLocaleString()}`
                    : '-'
                }
                showBorder={false}
              />
            </SectionCard>
          </>
        )}

        {/* Buy Inputs Product - Show different sections */}
        {isBuyInputs && summaryData.provider_details && (
          <>
            {/* Provider Details */}
            <SectionCard icon={<PersonalIcon />} title="Provider Details">
              <SummaryRow
                label="Provider ID"
                value={summaryData.provider_details.provider_id}
              />
              <SummaryRow
                label="Provider Name"
                value={summaryData.provider_details.provider_name || '-'}
                showBorder={false}
              />
            </SectionCard>

            {/* Purchase Details */}
            {summaryData.purchase_details && (
              <SectionCard icon={<FacilityIcon />} title="Purchase Details">
                <SummaryRow
                  label="Inputs Required"
                  value={summaryData.purchase_details.inputs_required}
                />
                <SummaryRow
                  label="Selected Variety"
                  value={summaryData.purchase_details.selected_variety}
                />
                <SummaryRow
                  label="Quantity"
                  value={`${summaryData.purchase_details.quantity} ${summaryData.purchase_details.quantity_unit}`}
                />
                <SummaryRow
                  label="Unit Price"
                  value={`Rs ${summaryData.purchase_details.unit_price}`}
                  showBorder={false}
                />
              </SectionCard>
            )}

            {/* Cart Summary */}
            {summaryData.cart_summary && (
              <SectionCard icon={<HarvestIcon />} title="Cart Summary">
                {summaryData.cart_summary.cart_items.map((item, index) => (
                  <View key={item.selected_item_id}>
                    <SummaryRow
                      label={`Item ${index + 1}: ${item.item_name}`}
                      value={`${item.quantity} ${item.quantity_unit} × ${item.currency_symbol}${item.unit_price} = ${item.currency_symbol}${item.total_price}`}
                      showBorder={index < summaryData.cart_summary!.cart_items.length - 1}
                    />
                  </View>
                ))}
                <SummaryRow
                  label="Total Items"
                  value={`${summaryData.cart_summary.cart_details.item_count}`}
                />
                <SummaryRow
                  label="Invoice Discount"
                  value={`${summaryData.cart_summary.cart_details.currency_symbol}${summaryData.cart_summary.cart_details.invoice_discount}`}
                />
                <SummaryRow
                  label="Total"
                  value={`${summaryData.cart_summary.cart_details.currency_symbol}${summaryData.cart_summary.cart_details.total}`}
                />
                <SummaryRow
                  label="Total Incl. Tax"
                  value={`${summaryData.cart_summary.cart_details.currency_symbol}${summaryData.cart_summary.cart_details.total_incl_tax}`}
                  showBorder={false}
                />
              </SectionCard>
            )}

            {/* Checkout Details */}
            {summaryData.checkout_details && (
              <SectionCard icon={<FacilityIcon />} title="Checkout Details">
                <SummaryRow
                  label="Bill To"
                  value={summaryData.checkout_details.checkout_detail_summary.bill_to}
                />
                <SummaryRow
                  label="Invoice Number"
                  value={summaryData.checkout_details.checkout_detail_summary.invoice_number}
                />
                <SummaryRow
                  label="Invoice Date"
                  value={summaryData.checkout_details.checkout_detail_summary.invoice_date}
                />
                <SummaryRow
                  label="Due Date"
                  value={summaryData.checkout_details.checkout_detail_summary.due_date}
                />
                <SummaryRow
                  label="Price"
                  value={`${summaryData.checkout_details.checkout_detail_summary.currency_symbol}${summaryData.checkout_details.checkout_detail_summary.price}`}
                />
                <SummaryRow
                  label="Sub Total"
                  value={`${summaryData.checkout_details.checkout_total_summary.currency_symbol}${summaryData.checkout_details.checkout_total_summary.sub_total}`}
                />
                <SummaryRow
                  label="Total"
                  value={`${summaryData.checkout_details.checkout_total_summary.currency_symbol}${summaryData.checkout_details.checkout_total_summary.total}`}
                />
                <SummaryRow
                  label="Balance Due"
                  value={`${summaryData.checkout_details.checkout_total_summary.currency_symbol}${summaryData.checkout_details.checkout_total_summary.balance_due}`}
                  showBorder={!!(summaryData.checkout_details.delivery_option || summaryData.checkout_details.delivery_address)}
                />
                {summaryData.checkout_details.delivery_option && (
                  <SummaryRow
                    label="Delivery Option"
                    value={formatLabel(summaryData.checkout_details.delivery_option)}
                    showBorder={!!summaryData.checkout_details.delivery_address}
                  />
                )}
                {summaryData.checkout_details.delivery_address && (
                  <SummaryRow
                    label="Delivery Address"
                    value={summaryData.checkout_details.delivery_address}
                    showBorder={false}
                  />
                )}
              </SectionCard>
            )}

            {/* Harvest Details for Buy Inputs */}
            {summaryData.harvest_details && (
              <SectionCard icon={<HarvestIcon />} title="Harvest Details">
                {Object.entries(summaryData.harvest_details).map(([key, value], index, array) => {
                  const isLast = index === array.length - 1;
                  let displayValue = formatValue(value);
                  
                  // Special formatting for price fields
                  if ((key === 'expected_selling_price_per_unit' || key === 'expected_price') && typeof value === 'number') {
                    displayValue = `Rs ${value}`;
                  }
                  
                  return (
                    <SummaryRow
                      key={key}
                      label={formatLabel(key)}
                      value={displayValue}
                      showBorder={!isLast}
                    />
                  );
                })}
              </SectionCard>
            )}
          </>
        )}

        {/* Loan Product - Show loan-specific sections */}
        {!isBuyInputs && summaryData.facility_details && (
          <>
        {/* Facility Details */}
        <SectionCard icon={<FacilityIcon />} title="Facility Details">
          {Object.entries(summaryData.facility_details).map(([key, value], index, array) => {
            const isLast = index === array.length - 1;
            let displayValue = formatValue(value);
            
            // Special formatting for specific fields
            if (key === 'loan_amount' && typeof value === 'number') {
              displayValue = `Rs ${value.toLocaleString()}`;
            } else if (key === 'intended_purpose' && Array.isArray(value)) {
              displayValue = formatIntendedPurpose(value);
            } else if (key === 'intended_purpose_description' && !value) {
              return null; // Skip empty description
            }
            
            return (
              <SummaryRow
                key={key}
                label={formatLabel(key)}
                value={displayValue}
                showBorder={!isLast}
              />
            );
          })}
        </SectionCard>

        {/* Personal Details */}
        {summaryData.personal_details && (
        <SectionCard icon={<PersonalIcon />} title="Personal Details">
          {renderDynamicRows(summaryData.personal_details)}
        </SectionCard>
        )}

        {/* Farm Details - Loop through all farms */}
        {summaryData.farm_details && summaryData.farm_details.farms.map((farmRef, index) => {
          const farmDetails = getFarmDetails(farmRef.farm_id);
          const totalFarms = summaryData.farm_details?.farms.length || 0;
          return (
            <SectionCard key={farmRef.farm_id} icon={<FarmIcon />} title={`Farm Details ${totalFarms > 1 ? `(${index + 1})` : ''}`}>
              <SummaryRow
                label="Farm ID"
                value={farmDetails?.ghana_post_gps_number || farmRef.farm_id}
              />
              <SummaryRow
                label="Farm Size"
                value={
                  farmDetails
                    ? `${farmDetails.farm_size} ${farmDetails.farm_size_unit}`
                    : '-'
                }
              />
              <SummaryRow
                label="Primary Produce"
                value={farmDetails?.primary_crop || '-'}
                showBorder={false}
              />
            </SectionCard>
          );
        })}

        {/* Add Farm Button - Only show if can_add_farm is true */}
        {summaryData.farm_details && summaryData.farm_details.can_add_farm && (
          <Pressable style={styles.addFarmButton}>
            <AddFarmIcon />
            <UITypography variant="medium" style={styles.addFarmText}>
              Add Farm
            </UITypography>
          </Pressable>
        )}

        {/* Harvest Details - For Loan Products */}
        {summaryData.harvest_details && summaryData.harvest_details.crop_financed && (
        <SectionCard icon={<HarvestIcon />} title="Harvest Details">
          {Object.entries(summaryData.harvest_details).map(([key, value], index, array) => {
            const isLast = index === array.length - 1;
            let displayValue = formatValue(value);
            
            // Special formatting for specific fields
            if (key === 'expected_price' && typeof value === 'number') {
              displayValue = `Rs ${value}`;
            } else if (key === 'expected_selling_price_per_unit' && typeof value === 'number') {
              displayValue = `Rs ${value}`;
            }
            
            return (
              <SummaryRow
                key={key}
                label={formatLabel(key)}
                value={displayValue}
                showBorder={!isLast}
              />
            );
          })}
        </SectionCard>
        )}

        {/* FSA Details - Only show if linked to FSA */}
        {summaryData.facility_details && summaryData.facility_details.linked_to_fsa && summaryData.fsa_details && (
          <SectionCard icon={<FSAIcon />} title="Smart FSA Contract Details">
            {renderDynamicRows(summaryData.fsa_details)}
          </SectionCard>
        )}
          </>
        )}

        {/* Request Loan Button - Only show when coming from stepper (pre-submission) */}
        {fromStepper && (
          <UIContainedButton
            style={styles.requestLoanButton}
            onPress={handleRequestLoan}
            disabled={isRequestingOtp}
          >
            {isRequestingOtp ? 'Requesting...' : isBuyInputs ? 'Submit Order' : 'Request Loan'}
          </UIContainedButton>
        )}
      </ScrollView>
    </View>
  );
}

