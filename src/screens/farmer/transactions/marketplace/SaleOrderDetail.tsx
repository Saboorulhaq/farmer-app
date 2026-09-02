import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import PersonIcon from '@/components/icons/PersonIcon';
import LocationIcon from '@/components/icons/LocationIcon';
import EmailIcon from '@/components/icons/EmailIcon';
import FSADocIcon from '@/components/icons/FSADocIcon';
import ExecuteFSAIcon from '@/components/icons/ExecuteFSAIcon';
import { transactionsService, SaleOrderDetail as SaleOrderDetailData } from '@/services/transactions.service';
import { Toast } from 'toastify-react-native';
import { axiosPublic } from '@/config/axios';
import { useFarmer } from '@/constants/context/farmer/context';

export default function SaleOrderDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top } = useSafeAreaInsets();
  const { orderId } = route.params || {};

  const { farmer } = useFarmer();
  const [order, setOrder] = useState<SaleOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFsa, setLoadingFsa] = useState(false);
  const [executingFsa, setExecutingFsa] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await transactionsService.getOrderDetail(orderId, 'sale_order');
      setOrder(response.data as SaleOrderDetailData);
    } catch (error) {
      console.log('Error fetching sale order detail:', error);
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

  const handleExecuteFSA = async () => {
    if (!orderId) return;
    setExecutingFsa(true);
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
            flow: 'SALE_ORDER_OTP',
          },
        },
      });
      navigation.navigate('LoanRequestOTPVerification', {
        isMarketplaceFlow: true,
        marketplaceTransactionType: 'sale_order',
        marketplaceTransactionId: orderId,
        marketplaceSuccessMessage: "Once you've delivered the harvest to the collection centre, the buyer will confirm and process your payment.",
        otpFlow: 'SALE_ORDER_OTP',
      });
    } catch (err: any) {
      const error = err?.response?.data?.error || 'Failed to request OTP';
      Toast.show({ type: 'error', text1: 'Error', text2: error });
    } finally {
      setExecutingFsa(false);
    }
  };

  const handleViewFSA = async () => {
    if (!orderId) return;
    setLoadingFsa(true);
    try {
      const response = await transactionsService.getOrderKeyTerms(orderId, 'sale_order');
      const keyTermsData = response.data;
      navigation.navigate('SaleAgreementPreview', {
        isMarketplaceFlow: true,
        marketplaceKeyTerms: keyTermsData,
        marketplaceOrderId: orderId,
        marketplaceBuyerName: order?.buyer?.name,
        marketplacePickupLocation: order?.pickup_location,
      });
    } catch (error: any) {
      console.log('Error fetching key terms:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load agreement details.' });
    } finally {
      setLoadingFsa(false);
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
            Sale Details
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
            Sale Details
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
  const isPending = order.status.toLowerCase() === 'submitted' || order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'created';
  const totalAmount = order.total != null
    ? order.total
    : order.amount != null
      ? order.amount
      : (order.volume && order.unit_price ? order.volume * order.unit_price : null);

  const formatSellType = (sellType: string | null) => {
    if (!sellType) return '—';
    const lower = sellType.toLowerCase();
    if (lower.includes('forward') || lower.includes('fsa')) return 'Smart FSA Contract';
    return sellType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const isFSAOrder = !!order?.sell_type && (
    order.sell_type.toLowerCase().includes('forward') ||
    order.sell_type.toLowerCase().includes('fsa')
  );

  const fsaConfirmed = !!(
    order?.agreement_confirmed &&
    order?.authentication_confirmed &&
    order?.otp_confirmed
  );

  const formatDelivery = (delivery: string | null) => {
    if (!delivery) return '—';
    return delivery.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const hasLineItems = order.line_items && order.line_items.length > 0;
  const hasOrderDetails = hasLineItems || !!order.crop;

  return (
    <View style={s.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={[s.header, { paddingTop: top + 16 }]}>
        <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={s.headerTitle}>
          Sale ID#{order.transaction_number?.slice(0, 8)}
        </UITypography>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          isFSAOrder && !isPending && { paddingBottom: 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Sale Summary Card ─── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Sale Summary
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
              {totalAmount != null ? `Rs ${totalAmount.toLocaleString()}` : '—'}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Buyer Name
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {order.buyer?.name}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Issue Date
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatDate(order.transaction_date)}
            </UITypography>
          </View>
          <View style={s.divider} />

          {order.expected_delivery_date && (
            <>
              <View style={s.summaryRow}>
                <UITypography variant="medium" style={s.detailLabel}>
                  Expected Delivery Date
                </UITypography>
                <UITypography variant="semiBold" style={s.detailValue}>
                  {formatDate(order.expected_delivery_date)}
                </UITypography>
              </View>
              <View style={s.divider} />
            </>
          )}

          {order.delivery && (
            <>
              <View style={s.summaryRow}>
                <UITypography variant="medium" style={s.detailLabel}>
                  Delivery
                </UITypography>
                <UITypography variant="semiBold" style={s.detailValue}>
                  {formatDelivery(order.delivery)}
                </UITypography>
              </View>
              <View style={s.divider} />
            </>
          )}

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Sale via
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatSellType(order.sell_type)}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Status
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {statusLabel}
            </UITypography>
          </View>

          {/* View FSA / Execute FSA buttons — hidden for delivered orders or when FSA is fully confirmed */}
          {isPending && isFSAOrder && !fsaConfirmed && (
            <View style={s.fsaButtonsRow}>
              <Pressable style={s.viewFsaButton} onPress={handleViewFSA} disabled={loadingFsa}>
                {loadingFsa ? (
                  <ActivityIndicator size="small" color="#979797" />
                ) : (
                  <>
                    <FSADocIcon size={17} color="#979797" />
                    <UITypography variant="semiBold" style={s.viewFsaText}>
View Smart FSA Contract
                    </UITypography>
                  </>
                )}
              </Pressable>
              <Pressable style={s.executeFsaButton} onPress={handleExecuteFSA} disabled={executingFsa}>
                {executingFsa ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <ExecuteFSAIcon width={10} height={16} color="#FFFFFF" />
                    <UITypography variant="semiBold" style={s.executeFsaText}>
Execute Smart FSA Contract
                    </UITypography>
                  </>
                )}
              </Pressable>
            </View>
          )}

        </View>

        {/* ─── Order Details Card ─── */}
        {hasOrderDetails && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Order Details
            </UITypography>

            <View style={s.tableHeader}>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 20 }]}>
                #
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { width: 60 }]}>
                Items
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { flex: 1, textAlign: 'center' }]}>
                Price
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { flex: 1, textAlign: 'center' }]}>
                Qty.
              </UITypography>
              <UITypography variant="semiBold" style={[s.tableHeaderText, { flex: 1, textAlign: 'right' }]}>
                Sub Total
              </UITypography>
            </View>

            {hasLineItems
              ? order.line_items.map((item, index) => {
                  const itemSubTotal = item.total_amount != null
                    ? item.total_amount
                    : (item.unit_price != null && item.quantity != null ? item.unit_price * item.quantity : null);
                  return (
                    <View key={item.id || index} style={s.tableRow}>
                      <UITypography variant="medium" style={[s.tableCell, { width: 20 }]}>
                        {item.item_number ?? index + 1}
                      </UITypography>
                      <UITypography variant="medium" style={[s.tableCell, { width: 60 }]}>
                        {item.item_name || '—'}
                      </UITypography>
                      <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'center' }]}>
                        {item.unit_price != null ? `Rs ${item.unit_price}` : '—'}
                      </UITypography>
                      <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'center' }]}>
                        {item.quantity != null ? `${item.quantity} ${item.quantity_unit || ''}` : '—'}
                      </UITypography>
                      <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'right' }]}>
                        {itemSubTotal != null ? `Rs ${itemSubTotal.toLocaleString()}` : '—'}
                      </UITypography>
                    </View>
                  );
                })
              : (
                <View style={s.tableRow}>
                  <UITypography variant="medium" style={[s.tableCell, { width: 20 }]}>
                    1
                  </UITypography>
                  <UITypography variant="medium" style={[s.tableCell, { width: 60 }]}>
                    {order.crop}
                  </UITypography>
                  <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'center' }]}>
                    {order.unit_price != null ? `Rs ${order.unit_price}` : '—'}
                  </UITypography>
                  <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'center' }]}>
                    {order.volume != null ? `${order.volume} ${order.unit || ''}` : '—'}
                  </UITypography>
                  <UITypography variant="medium" style={[s.tableCell, { flex: 1, textAlign: 'right' }]}>
                    {totalAmount != null ? `Rs ${totalAmount.toLocaleString()}` : '—'}
                  </UITypography>
                </View>
              )
            }

            <View style={s.tableDivider} />

            <View style={s.totalRow}>
              <UITypography variant="semiBold" style={s.totalLabel}>
                Total
              </UITypography>
              <UITypography variant="semiBold" style={s.totalValue}>
                {totalAmount != null ? `Rs ${totalAmount.toLocaleString()}` : '—'}
              </UITypography>
            </View>
          </View>
        )}

        {/* ─── Payment Summary Card ─── */}
        <View style={s.card}>
          <UITypography variant="semiBold" style={s.cardTitle}>
            Payment Summary
          </UITypography>

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Payable via
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {order.payable_via
                ? order.payable_via.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                : '—'}
            </UITypography>
          </View>
          <View style={s.divider} />

          <View style={s.summaryRow}>
            <UITypography variant="medium" style={s.detailLabel}>
              Expected Payment Date
            </UITypography>
            <UITypography variant="semiBold" style={s.detailValue}>
              {formatDate(order.expected_payment_date)}
            </UITypography>
          </View>
        </View>

        {/* ─── Buyer Details Card ─── */}
        {order.buyer && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Buyer Details
            </UITypography>

            <View style={s.contactRow}>
              <View style={s.contactIcon}>
                <PersonIcon size={16} color="#606060" />
              </View>
              <UITypography variant="medium" style={s.contactText}>
                {order.buyer.name}
              </UITypography>
            </View>
            {order.buyer.email && (
              <>
                <View style={s.divider} />
                <View style={s.contactRow}>
                  <View style={s.contactIcon}>
                    <EmailIcon size={16} color="#606060" />
                  </View>
                  <UITypography variant="medium" style={s.contactText}>
                    {order.buyer.email}
                  </UITypography>
                </View>
              </>
            )}
          </View>
        )}

        {/* ─── Shipping Address Card ─── */}
        {order.shipping_address && (
          <View style={s.card}>
            <UITypography variant="semiBold" style={s.cardTitle}>
              Shipping Address
            </UITypography>

            <View style={s.contactRow}>
              <View style={s.contactIcon}>
                <LocationIcon size={16} color="#606060" />
              </View>
              <UITypography variant="medium" style={s.contactText}>
                {order.shipping_address}
              </UITypography>
            </View>
            <View style={s.divider} />

            <UITypography variant="semiBold" style={s.billingNote}>
              Billing address same as shipping address
            </UITypography>
          </View>
        )}
      </ScrollView>

      {isFSAOrder && fsaConfirmed && (
        <View style={s.stickyFooter}>
          <Pressable
            style={s.shippingStatusButton}
            onPress={() => navigation.navigate('ShippingStatus', { orderId })}
          >
            <UITypography variant="semiBold" style={s.shippingStatusText}>
              Track Shipment
            </UITypography>
          </Pressable>
        </View>
      )}
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
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 6,
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 10,
    marginBottom: 12,
  },
  fsaButtonsRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
  },
  viewFsaButton: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  viewFsaText: { fontSize: 14, color: '#101010', lineHeight: 20, textAlign: 'center' },
  executeFsaButton: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 5,
    backgroundColor: '#099453',
    paddingHorizontal: 8,
  },
  executeFsaText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, textAlign: 'center' },
  stickyFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  shippingStatusButton: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#0B8A3D',
  },
  shippingStatusText: { fontSize: 15, color: '#FFFFFF', lineHeight: 20, textAlign: 'center' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#88CAD9',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tableHeaderText: { fontSize: 12, color: '#FFFFFF', lineHeight: 12 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableCell: { fontSize: 12, color: '#404040', lineHeight: 15 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 16, color: '#101010', lineHeight: 22 },
  totalValue: { fontSize: 16, color: '#101010', lineHeight: 22, textAlign: 'right' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  contactIcon: { marginTop: 1 },
  contactText: { fontSize: 13, color: '#979797', lineHeight: 16, flex: 1 },
  billingNote: {
    fontSize: 13,
    color: '#979797',
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
