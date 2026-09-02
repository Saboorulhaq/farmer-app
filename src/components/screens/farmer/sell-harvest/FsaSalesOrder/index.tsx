import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { styles } from './index.styled';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { axiosFinancingPrivate } from '@/config/axios';
import { transactionsService } from '@/services/transactions.service';

type OrderDetailItem = {
  item: string;
  price: number | null;
  quantity: number | null;
  quantity_unit: string | null;
  subtotal: number | null;
};

type ExecuteFsaAttributes = {
  fsa_id: string;
  sale_order_id: string | null;
  harvest_id: string;
  executed: boolean;
  sale_summary: {
    total: number | null;
    currency: string | null;
    buyer_name: string | null;
    issue_date: string | null;
    expected_delivery_date: string | null;
    delivery: string | null;
    sale_via: string | null;
  } | null;
  order_details: OrderDetailItem[] | null;
  payment_summary: {
    payable_via: string | null;
    expected_payment_date: string | null;
  } | null;
  buyer_details: {
    name: string | null;
    location: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  fsa_details: Record<string, any> | null;
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const formatCurrency = (amount?: number | null, currency?: string | null): string => {
  if (amount == null) return '—';
  const symbol = currency && currency.trim() ? currency : 'Rs';
  return `${symbol} ${Number(amount).toLocaleString()}`;
};

const titleCase = (value?: string | null): string => {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function FsaSalesOrder() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top } = useSafeAreaInsets();

  const fsaId: string | undefined = route.params?.fsaId;
  const harvestId: string | undefined = route.params?.harvestId;
  const selectedFsa = route.params?.selectedFsa;

  const [data, setData] = useState<ExecuteFsaAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFsa, setLoadingFsa] = useState(false);
  const [executing, setExecuting] = useState(false);

  const fetchExecuteData = useCallback(async () => {
    if (!fsaId || !harvestId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axiosFinancingPrivate.get(
        `/sell-harvest/fsa-flow/${fsaId}/execute`,
        { params: { harvest_id: harvestId } },
      );
      const attrs = response.data?.data?.attributes || response.data?.attributes || null;
      setData(attrs);
    } catch (error: any) {
      console.log('❌ Failed to load FSA execute data:', error?.response?.data || error?.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.error || 'Failed to load sale details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [fsaId, harvestId]);

  useEffect(() => {
    fetchExecuteData();
  }, [fetchExecuteData]);

  const saleSummary = data?.sale_summary;
  const currency = saleSummary?.currency;
  const saleOrderId = data?.sale_order_id || selectedFsa?.sale_order_id || null;
  const buyerName = saleSummary?.buyer_name || data?.buyer_details?.name || selectedFsa?.buyer_name || '—';
  const statusLabel = (selectedFsa?.status || 'pending').toUpperCase();
  const orderItems = data?.order_details ?? [];

  const shortSaleId = saleOrderId
    ? saleOrderId.replace(/-/g, '').slice(0, 6).toUpperCase()
    : null;

  const handleViewFSA = async () => {
    if (!saleOrderId) {
      Toast.show({ type: 'error', text1: 'Unavailable', text2: 'Agreement is not available yet.' });
      return;
    }
    setLoadingFsa(true);
    try {
      const response = await transactionsService.getOrderKeyTerms(saleOrderId, 'sale_order');
      navigation.navigate('SaleAgreementPreview', {
        isMarketplaceFlow: true,
        marketplaceKeyTerms: response.data,
        marketplaceOrderId: saleOrderId,
        marketplaceBuyerName: buyerName,
        marketplacePickupLocation: saleSummary?.delivery,
      });
    } catch (error: any) {
      console.log('❌ Failed to load FSA agreement:', error?.response?.data || error?.message);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load agreement details.' });
    } finally {
      setLoadingFsa(false);
    }
  };

  const handleExecuteSale = async () => {
    if (!fsaId || !harvestId) return;
    setExecuting(true);
    try {
      const response = await axiosFinancingPrivate.post(
        `/sell-harvest/fsa-flow/${fsaId}/execute`,
        { harvest_id: harvestId },
      );
      const attrs = response.data?.data?.attributes || response.data?.attributes || {};
      const executed = attrs?.executed;
      const executedSaleOrderId = attrs?.sale_order_id || saleOrderId;

      if (executed) {
        Toast.show({
          type: 'success',
          text1: 'Sale Executed',
          text2: 'Your forward sale agreement has been executed.',
        });

        const navState = navigation.getState();
        const isInTransactionsStack = navState?.routes?.[0]?.name === 'TransactionsMain';

        if (isInTransactionsStack) {
          navigation.navigate('TransactionsMain', { initialTab: 'marketplace' });
        } else {
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
          );
          setTimeout(() => {
            navigation.getParent()?.navigate('Transactions', {
              screen: 'TransactionsMain',
              params: { initialTab: 'marketplace' },
            });
          }, 100);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Not Executed',
          text2: 'The sale could not be executed. Please try again.',
        });
      }
    } catch (error: any) {
      console.log('❌ Failed to execute FSA sale:', error?.response?.data || error?.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.error || 'Failed to execute sale. Please try again.',
      });
    } finally {
      setExecuting(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: top + 12 }]}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeftIcon size={24} color="#14201A" />
      </Pressable>
      <UITypography variant="semiBold" style={styles.headerTitle}>
        {shortSaleId ? `Sale ID #${shortSaleId}` : 'Sale Order'}
      </UITypography>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        {renderHeader()}
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#0B8A3D" />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        {renderHeader()}
        <View style={styles.centerFill}>
          <UITypography variant="medium" style={styles.emptyText}>
            Sale details are not available right now.
          </UITypography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Sale Summary ─── */}
        <View style={styles.card}>
          <View style={styles.summaryHeaderRow}>
            <UITypography variant="semiBold" style={styles.cardTitle}>
              Sale Summary
            </UITypography>
            <View style={styles.statusBadge}>
              <UITypography variant="semiBold" style={styles.statusBadgeText}>
                {statusLabel}
              </UITypography>
            </View>
          </View>

          <View style={styles.row}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Total
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValueStrong}>
              {formatCurrency(saleSummary?.total, currency)}
            </UITypography>
          </View>
          <View style={styles.row}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Buyer Name
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValue}>
              {buyerName}
            </UITypography>
          </View>
          <View style={styles.row}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Issue Date
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValue}>
              {formatDate(saleSummary?.issue_date)}
            </UITypography>
          </View>
          <View style={styles.row}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Expected Delivery
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValue}>
              {formatDate(saleSummary?.expected_delivery_date)}
            </UITypography>
          </View>
          <View style={styles.row}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Delivery
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValue}>
              {titleCase(saleSummary?.delivery)}
            </UITypography>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <UITypography variant="regular" style={styles.rowLabel}>
              Sale via
            </UITypography>
            <UITypography variant="semiBold" style={styles.rowValue}>
              {saleSummary?.sale_via || 'FSA'}
            </UITypography>
          </View>

          <View style={styles.ctaRow}>
            <Pressable
              style={styles.viewFsaButton}
              onPress={handleViewFSA}
              disabled={loadingFsa || executing}
            >
              {loadingFsa ? (
                <ActivityIndicator size="small" color="#14201A" />
              ) : (
                <UITypography variant="semiBold" style={styles.viewFsaText}>
                  View FSA
                </UITypography>
              )}
            </Pressable>
            <Pressable
              style={[styles.executeButton, executing && styles.executeButtonDisabled]}
              onPress={handleExecuteSale}
              disabled={executing || loadingFsa}
            >
              {executing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <UITypography variant="semiBold" style={styles.executeText}>
                  Execute Sale
                </UITypography>
              )}
            </Pressable>
          </View>
        </View>

        {/* ─── Order Details ─── */}
        {orderItems.length > 0 && (
          <View style={styles.card}>
            <UITypography variant="semiBold" style={styles.orderTitle}>
              Order Details
            </UITypography>

            <View style={styles.tableHeader}>
              <UITypography variant="semiBold" style={[styles.tableHeaderText, styles.colItem]}>
                Item
              </UITypography>
              <UITypography variant="semiBold" style={[styles.tableHeaderText, styles.colPrice]}>
                Price
              </UITypography>
              <UITypography variant="semiBold" style={[styles.tableHeaderText, styles.colQty]}>
                Qty
              </UITypography>
              <UITypography variant="semiBold" style={[styles.tableHeaderText, styles.colSubtotal]}>
                Sub Total
              </UITypography>
            </View>

            {orderItems.map((item, index) => (
              <View key={`${item.item}-${index}`} style={styles.tableRow}>
                <UITypography variant="medium" style={[styles.tableCell, styles.colItem]}>
                  {item.item || '—'}
                </UITypography>
                <UITypography variant="medium" style={[styles.tableCell, styles.colPrice]}>
                  {formatCurrency(item.price, currency)}
                </UITypography>
                <UITypography variant="medium" style={[styles.tableCell, styles.colQty]}>
                  {item.quantity != null ? `${item.quantity} ${item.quantity_unit || ''}`.trim() : '—'}
                </UITypography>
                <UITypography variant="medium" style={[styles.tableCell, styles.colSubtotal]}>
                  {formatCurrency(item.subtotal, currency)}
                </UITypography>
              </View>
            ))}

            <View style={styles.orderTotalRow}>
              <UITypography variant="semiBold" style={styles.orderTotalLabel}>
                Total
              </UITypography>
              <UITypography variant="semiBold" style={styles.orderTotalValue}>
                {formatCurrency(saleSummary?.total, currency)}
              </UITypography>
            </View>
          </View>
        )}

        {/* ─── Payment Summary ─── */}
        {data.payment_summary && (
          <View style={styles.card}>
            <UITypography variant="semiBold" style={styles.orderTitle}>
              Payment Summary
            </UITypography>

            <View style={styles.row}>
              <UITypography variant="regular" style={styles.rowLabel}>
                Payable via
              </UITypography>
              <UITypography variant="semiBold" style={styles.rowValue}>
                {titleCase(data.payment_summary.payable_via)}
              </UITypography>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <UITypography variant="regular" style={styles.rowLabel}>
                Expected Payment Date
              </UITypography>
              <UITypography variant="semiBold" style={styles.rowValue}>
                {formatDate(data.payment_summary.expected_payment_date)}
              </UITypography>
            </View>
          </View>
        )}

        {/* ─── Buyer Details ─── */}
        {data.buyer_details && (
          <View style={styles.card}>
            <UITypography variant="semiBold" style={styles.orderTitle}>
              Buyer Details
            </UITypography>

            {data.buyer_details.name && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Name</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {data.buyer_details.name}
                </UITypography>
              </View>
            )}
            {data.buyer_details.location && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Location</UITypography>
                <UITypography variant="semiBold" style={styles.rowValueWrap}>
                  {data.buyer_details.location}
                </UITypography>
              </View>
            )}
            {data.buyer_details.email && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Email</UITypography>
                <UITypography variant="semiBold" style={styles.rowValueWrap}>
                  {data.buyer_details.email}
                </UITypography>
              </View>
            )}
            {data.buyer_details.phone && (
              <View style={[styles.row, styles.rowLast]}>
                <UITypography variant="regular" style={styles.rowLabel}>Phone</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {data.buyer_details.phone}
                </UITypography>
              </View>
            )}
          </View>
        )}

        {/* ─── FSA Details ─── */}
        {data.fsa_details && (
          <View style={styles.card}>
            <UITypography variant="semiBold" style={styles.orderTitle}>
              FSA Details
            </UITypography>

            {data.fsa_details.selected_produce && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Produce</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {data.fsa_details.selected_produce}
                </UITypography>
              </View>
            )}
            {data.fsa_details.committed_volume != null && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Committed Volume</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {`${data.fsa_details.committed_volume} ${data.fsa_details.committed_volume_unit || ''}`.trim()}
                </UITypography>
              </View>
            )}
            {data.fsa_details.expected_volume != null && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Expected Volume</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {`${data.fsa_details.expected_volume} ${data.fsa_details.expected_volume_unit || ''}`.trim()}
                </UITypography>
              </View>
            )}
            {data.fsa_details.expected_selling_price_per_unit != null && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Price / Unit</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {formatCurrency(data.fsa_details.expected_selling_price_per_unit, currency)}
                </UITypography>
              </View>
            )}
            {data.fsa_details.expected_grade && (
              <View style={styles.row}>
                <UITypography variant="regular" style={styles.rowLabel}>Expected Grade</UITypography>
                <UITypography variant="semiBold" style={styles.rowValue}>
                  {data.fsa_details.expected_grade}
                </UITypography>
              </View>
            )}
            {data.fsa_details.key_terms && (
              <View style={[styles.row, styles.rowLast]}>
                <UITypography variant="regular" style={styles.rowLabel}>Key Terms</UITypography>
                <UITypography variant="semiBold" style={styles.rowValueWrap}>
                  {data.fsa_details.key_terms}
                </UITypography>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
