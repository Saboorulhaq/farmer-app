import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import DeliveryCheckIcon from '@/components/icons/DeliveryCheckIcon';
import PersonIcon from '@/components/icons/PersonIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import EmailIcon from '@/components/icons/EmailIcon';
import LocationIcon from '@/components/icons/LocationIcon';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';
import CloseXIcon from '@/components/icons/CloseXIcon';
import { transactionsService, BuyOrderDetail as BuyOrderDetailData } from '@/services/transactions.service';
import { axiosPublic } from '@/config/axios';
import { useFarmer } from '@/constants/context/farmer/context';
import { Toast } from 'toastify-react-native';

export default function BuyOrderDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();
  const { farmer } = useFarmer();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState<BuyOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await transactionsService.getOrderDetail(orderId, 'purchase_order');
      setOrder(response.data as BuyOrderDetailData);
    } catch (error) {
      console.log('Error fetching buy order detail:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleProceedConfirmDelivery = async () => {
    setShowConfirmSheet(false);
    setRequesting(true);
    try {
      const phoneNumber = farmer?.attributes?.phone_number;
      if (!phoneNumber) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Phone number not found.' });
        return;
      }
      await axiosPublic.post('/users/request_otp', {
        data: {
          attributes: {
            phone_number: phoneNumber,
            email: farmer?.attributes?.email,
            skip_count_check: true,
            flow: 'BUY_ORDER_OTP',
          },
        },
      });
      navigation.navigate('LoanRequestOTPVerification', {
        isMarketplaceFlow: true,
        marketplaceTransactionType: 'purchase_order',
        marketplaceTransactionId: orderId,
        marketplaceSuccessMessage: 'Your payment has been successfully processed. The bank will confirm the transaction soon.',
        otpFlow: 'BUY_ORDER_OTP',
      });
    } catch (err: any) {
      const error = err?.response?.data?.error || 'Failed to request OTP';
      Toast.show({ type: 'error', text1: 'Error', text2: error });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <View style={s.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={[s.header, { paddingTop: top + 16 }]}>
          <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#101010" />
          </Pressable>
          <UITypography variant="semiBold" style={s.headerTitle}>
            Order Details
          </UITypography>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#099453" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={[s.header, { paddingTop: top + 16 }]}>
          <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#101010" />
          </Pressable>
          <UITypography variant="semiBold" style={s.headerTitle}>
            Order Details
          </UITypography>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <UITypography variant="medium" style={{ color: '#979797' }}>
            Order not found
          </UITypography>
        </View>
      </View>
    );
  }

  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
  const isPending = order.status.toLowerCase() === 'pending';
  const isFulfilled = order.status.toLowerCase() === 'fulfilled';

  return (
    <View style={s.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={[s.header, { paddingTop: top + 16 }]}>
        <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={s.headerTitle}>
          Order ID#{order.transaction_number}
        </UITypography>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Order Summary
            </UITypography>
            <View style={[s.pendingBadge, !isPending && { backgroundColor: '#E7F8F0' }]}>
              <UITypography variant="semiBold" style={[s.pendingBadgeText, !isPending && { color: '#099453' }]}>
                {statusLabel}
              </UITypography>
            </View>
          </View>

          <View style={s.summaryRow}>
            <UITypography variant="semiBold" style={s.summaryLabel}>
              Total
            </UITypography>
            <UITypography variant="semiBold" style={s.summaryValue}>
              Rs {order.total_incl_tax?.toLocaleString()}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Provider Name
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {order.provider?.name}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Issue Date
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatDate(order.invoice_date)}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Expected Delivery Date
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatDate(order.due_date)}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Delivery
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {order.delivery_method}
            </UITypography>
          </View>

          {isFulfilled && (
            <Pressable
              style={s.confirmButton}
              onPress={() => setShowConfirmSheet(true)}
              disabled={requesting}
            >
              <DeliveryCheckIcon width={18} height={16} color="#FFFFFF" />
              <UITypography variant="semiBold" style={s.confirmButtonText}>
                Confirm Delivery
              </UITypography>
            </Pressable>
          )}
        </View>

        {/* Order Details Card */}
        {order.line_items && order.line_items.length > 0 && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Order Details
            </UITypography>

            <View style={s.tableHeader}>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 24 }]}>
                #
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { flex: 1 }]}>
                Items
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 50, textAlign: 'center' }]}>
                Price
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 40, textAlign: 'center' }]}>
                Qty.
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 70, textAlign: 'right' }]}>
                Sub Total
              </UITypography>
            </View>

            {order.line_items.map((item, idx) => (
              <View key={item.id} style={s.tableRow}>
                <UITypography variant="medium" style={[s.tableCell, { width: 24 }]}>
                  {idx + 1}
                </UITypography>
                <UITypography variant="medium" style={[s.tableCell, { flex: 1 }]}>
                  {item.item_name}
                </UITypography>
                <UITypography variant="medium" style={[s.tableCell, { width: 50, textAlign: 'center' }]}>
                  Rs {item.unit_price}
                </UITypography>
                <UITypography variant="medium" style={[s.tableCell, { width: 40, textAlign: 'center' }]}>
                  {item.quantity}
                </UITypography>
                <UITypography variant="medium" style={[s.tableCell, { width: 70, textAlign: 'right' }]}>
                  Rs {item.total_amount}
                </UITypography>
              </View>
            ))}

            <View style={s.tableDivider} />

            <View style={s.totalRow}>
              <UITypography variant="semiBold" style={s.totalLabel}>
                Total
              </UITypography>
              <UITypography variant="semiBold" style={s.totalValue}>
                Rs {order.total_amount?.toLocaleString()}
              </UITypography>
            </View>
          </View>
        )}

        {/* Payment Summary Card */}
        <View style={s.card}>
          <UITypography variant="semiBold" style={s.cardTitle}>
            Payment Summary
          </UITypography>

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Payable via
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {order.payment_method === 'provider_credit' ? 'Provider credit' : (order.payment_method || '—')}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Expected Payment Date
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatDate(order.due_date)}
            </UITypography>
          </View>
        </View>

        {/* Provider Details Card */}
        {order.provider && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Provider Details
            </UITypography>

            <View style={s.contactRow}>
              <PersonIcon size={16} color="#606060" />
              <UITypography variant="medium" style={s.contactText}>
                {order.provider.name}
              </UITypography>
            </View>
            <View style={s.divider} />

            <View style={s.contactRow}>
              <PhoneIcon size={14} color="#606060" />
              <UITypography variant="medium" style={s.contactText}>
                {order.provider.phone_number}
              </UITypography>
            </View>
            <View style={s.divider} />

            <View style={s.contactRow}>
              <EmailIcon size={12} color="#606060" />
              <UITypography variant="medium" style={s.contactText}>
                {order.provider.email}
              </UITypography>
            </View>
          </View>
        )}

        {/* Shipping Address Card */}
        {order.shipping_address && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Shipping Address
            </UITypography>

            <View style={s.contactRow}>
              <LocationIcon size={16} color="#606060" />
              <UITypography variant="medium" style={s.contactText}>
                {order.shipping_address}
              </UITypography>
            </View>
            <View style={s.divider} />

            <UITypography variant="medium" style={s.billingNote}>
              Billing address same as shipping address
            </UITypography>
          </View>
        )}
      </ScrollView>

      {/* Confirm Delivery Bottom Sheet */}
      <Modal
        visible={showConfirmSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmSheet(false)}
      >
        <Pressable
          style={s.overlay}
          onPress={() => setShowConfirmSheet(false)}
        />

        <View style={[s.sheet, { paddingBottom: bottom + 20 }]}>
          <Pressable
            style={s.closeButton}
            onPress={() => setShowConfirmSheet(false)}
            hitSlop={12}
          >
            <View style={s.closeCircle}>
              <CloseXIcon size={9} color="#101010" />
            </View>
          </Pressable>

          <UITypography variant="semiBold" style={s.sheetTitle}>
            Confirm Delivery
          </UITypography>

          <UITypography variant="medium" style={s.sheetDesc}>
            By proceeding, you confirm delivery of your order and authorize the disbursement of funds to the Provider
          </UITypography>

          <Pressable
            style={s.proceedButton}
            onPress={handleProceedConfirmDelivery}
          >
            <UITypography variant="semiBold" style={s.proceedButtonText}>
              Proceed
            </UITypography>
            <ArrowRightIcon width={15} height={11} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: { position: 'absolute', left: 16, padding: 4 },
  headerTitle: { fontSize: 18, color: '#101010', textAlign: 'center', lineHeight: 28 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 20,
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 14, color: '#101010', lineHeight: 16, marginBottom: 16 },
  pendingBadge: {
    backgroundColor: '#FFE19C',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 16,
  },
  pendingBadgeText: { fontSize: 11, color: '#FB6B18', lineHeight: 16 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 12,
  },
  summaryLabel: { fontSize: 13, color: '#101010', lineHeight: 16 },
  summaryValue: { fontSize: 13, color: '#101010', lineHeight: 16, textAlign: 'right', flex: 1 },
  detailLabel: { fontSize: 13, color: '#979797', lineHeight: 16 },
  detailValue: { fontSize: 13, color: '#101010', lineHeight: 16, textAlign: 'right', flex: 1 },
  divider: { height: 1, backgroundColor: '#DDD', marginVertical: 6 },
  tableDivider: { height: 1, backgroundColor: '#DDD', marginTop: 10, marginBottom: 12 },
  confirmButton: {
    backgroundColor: '#099453',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  confirmButtonText: { fontSize: 14, color: '#FFFFFF', lineHeight: 16 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#88CAD9',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tableHeaderText: { fontSize: 12, color: '#FFFFFF', lineHeight: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  tableCell: { fontSize: 12, color: '#404040', lineHeight: 15 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 16, color: '#101010', lineHeight: 22 },
  totalValue: { fontSize: 16, color: '#101010', lineHeight: 22, textAlign: 'right' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  contactText: { fontSize: 13, color: '#979797', lineHeight: 16 },
  billingNote: { fontSize: 13, color: '#979797', lineHeight: 16, fontStyle: 'italic', marginTop: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeCircle: {
    width: 27.5,
    height: 27.5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 14,
    color: '#404040',
    lineHeight: 16,
    letterSpacing: 0.1,
    marginBottom: 10,
    marginRight: 40,
  },
  sheetDesc: {
    fontSize: 12,
    color: '#404040',
    lineHeight: 16,
    letterSpacing: 0.1,
    marginBottom: 24,
    width: 295,
  },
  proceedButton: {
    backgroundColor: '#099453',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  proceedButtonText: { fontSize: 14, color: '#FFFFFF', lineHeight: 16 },
});
