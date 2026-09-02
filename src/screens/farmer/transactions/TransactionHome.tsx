import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import CreditCardIcon from '@/components/icons/CreditCardIcon';
import BuyInputsIcon from '@/components/icons/BuyInputsIcon';
import SellHarvestMarketIcon from '@/components/icons/SellHarvestMarketIcon';
import { styles } from './TransactionHome.styled';
import {
  transactionsService,
  FinancingRequest,
  MarketplaceOrder,
  ActiveFinanceProgram,
  getCurrencySymbol,
  formatProductType,
  formatSubmittedDate,
  getStatusCategory,
  getStatusLabel,
  getAvatarColor,
} from '@/services/transactions.service';
import { submissionsService } from '@/services/submissions.service';
import { harvestLogsService } from '@/services/harvestLogs.service';
import { useProductsStore } from '@/store/useProductsStore';

const AVATAR_COLORS = ['#1ABC6D', '#4D9DE0', '#E8A838', '#E86B4F'];

const getInitials = (value?: string | null) => {
  const safeValue = value?.trim();
  if (!safeValue) {
    return '--';
  }
  return safeValue.substring(0, 2).toUpperCase();
};

/* ─── Component ─── */
export default function TransactionHome() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top } = useSafeAreaInsets();
  const initialTab = route.params?.initialTab as 'finance' | 'marketplace' | undefined;
  const [activeTab, setActiveTab] = useState<'finance' | 'marketplace'>(initialTab ?? 'finance');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFinancePrograms, setActiveFinancePrograms] = useState<ActiveFinanceProgram[]>([]);
  const [loadingActiveFinance, setLoadingActiveFinance] = useState(true);
  const [financingRequests, setFinancingRequests] = useState<FinancingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [buyOrders, setBuyOrders] = useState<MarketplaceOrder[]>([]);
  const [saleOrders, setSaleOrders] = useState<MarketplaceOrder[]>([]);
  const [loadingBuyOrders, setLoadingBuyOrders] = useState(false);
  const [loadingSaleOrders, setLoadingSaleOrders] = useState(false);
  const [loadingBuyInputs, setLoadingBuyInputs] = useState(false);
  const [hasIncompleteApplications, setHasIncompleteApplications] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<any[]>([]);
  const [loadingHarvestLogs, setLoadingHarvestLogs] = useState(false);
  const { fetchProductConfig } = useProductsStore();

  const hasInProgressSubmission = (status?: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    return !['submitted', 'approved', 'rejected', 'completed'].includes(normalizedStatus);
  };

  const fetchActiveFinancePrograms = useCallback(async () => {
    try {
      setLoadingActiveFinance(true);
      const response = await transactionsService.getActiveFinancePrograms();
      setActiveFinancePrograms(response.data ?? []);
    } catch (error) {
      console.log('Error fetching active finance programs:', error);
    } finally {
      setLoadingActiveFinance(false);
    }
  }, []);

  const fetchFinancingRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await transactionsService.getFinancingRequests();
      setFinancingRequests(response.data ?? []);
    } catch (error) {
      console.log('Error fetching financing requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchMarketplaceOrders = useCallback(async () => {
    try {
      setLoadingBuyOrders(true);
      setLoadingSaleOrders(true);
      const [buyRes, saleRes] = await Promise.all([
        transactionsService.getMarketplaceOrders('purchase_order'),
        transactionsService.getMarketplaceOrders('sale_order'),
      ]);
      setBuyOrders(buyRes.data ?? []);
      setSaleOrders(saleRes.data ?? []);
    } catch (error) {
      console.log('Error fetching marketplace orders:', error);
    } finally {
      setLoadingBuyOrders(false);
      setLoadingSaleOrders(false);
    }
  }, []);

  const fetchIncompleteApplications = useCallback(async () => {
    try {
      const response = await submissionsService.getAllSubmissions();
      const hasIncomplete = (response.data ?? []).some((submission) =>
        hasInProgressSubmission(submission.status),
      );
      setHasIncompleteApplications(hasIncomplete);
    } catch (error) {
      console.log('Error fetching submissions:', error);
      // Prefer hiding CTA on fetch failure to avoid showing an invalid action.
      setHasIncompleteApplications(false);
    }
  }, []);

  const fetchHarvestLogs = useCallback(async () => {
    try {
      setLoadingHarvestLogs(true);
      const response = await harvestLogsService.getAllHarvestLogs();
      setHarvestLogs(response?.data || []);
    } catch (error) {
      console.log('Error fetching harvest logs:', error);
      setHarvestLogs([]);
    } finally {
      setLoadingHarvestLogs(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveFinancePrograms();
      fetchFinancingRequests();
      fetchMarketplaceOrders();
      fetchIncompleteApplications();
      fetchHarvestLogs();
    }, [
      fetchActiveFinancePrograms,
      fetchFinancingRequests,
      fetchMarketplaceOrders,
      fetchIncompleteApplications,
      fetchHarvestLogs,
    ]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchActiveFinancePrograms(),
      fetchFinancingRequests(),
      fetchMarketplaceOrders(),
      fetchIncompleteApplications(),
      fetchHarvestLogs(),
    ]);
    setRefreshing(false);
  }, [
    fetchActiveFinancePrograms,
    fetchFinancingRequests,
    fetchMarketplaceOrders,
    fetchIncompleteApplications,
    fetchHarvestLogs,
  ]);

  const handleBuyInputsNavigation = async () => {
    try {
      setLoadingBuyInputs(true);
      await fetchProductConfig('buy-inputs');
      const buyInputsConfig = useProductsStore.getState().config;
      if (buyInputsConfig?.attributes?.steps?.length) {
        const steps = [...buyInputsConfig.attributes.steps]
          .filter((s: any) => s.is_active)
          .sort((a: any, b: any) => a.display_order - b.display_order);
        const firstStep = steps[0];
        if (firstStep && firstStep.identifier === 'government_verified_provider') {
          navigation.navigate('GovernmentVerifiedBuyers', { fsaStep: firstStep, fsaSteps: steps, productSlug: 'buy-inputs', submissionId: null });
          return;
        }
      }
      navigation.navigate('GovernmentVerifiedBuyers', { productSlug: 'buy-inputs', submissionId: null });
    } catch (error) {
      console.log('Error fetching buy-inputs config:', error);
      navigation.navigate('GovernmentVerifiedBuyers', { productSlug: 'buy-inputs', submissionId: null });
    } finally {
      setLoadingBuyInputs(false);
    }
  };

  const visibleRequests = financingRequests.slice(0, 2);
  const visibleBuyOrders = buyOrders.slice(0, 4);
  const visibleSaleOrders = saleOrders.slice(0, 4);

  const formatOrderDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const getOrderStatusLabel = (status: string) => {
    if (!status) return '—';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getOrderStatusType = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'fulfilled' || s === 'paid') return 'fulfilled';
    if (s === 'submitted' || s === 'pending') return 'pending';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>  
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Transactions
        </UITypography>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#099453" colors={['#099453']} />
        }
      >
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'finance' && styles.tabActive]}
            onPress={() => setActiveTab('finance')}
          >
            <UITypography
              variant={activeTab === 'finance' ? 'bold' : 'medium'}
              style={[styles.tabText, activeTab === 'finance' && styles.tabTextActive]}
            >
              Finance{' '}
            </UITypography>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'marketplace' && styles.tabActive]}
            onPress={() => setActiveTab('marketplace')}
          >
            <UITypography
              variant={activeTab === 'marketplace' ? 'bold' : 'medium'}
              style={[styles.tabText, activeTab === 'marketplace' && styles.tabTextActive]}
            >
              Market place
            </UITypography>
          </Pressable>
        </View>

        {/* ─── Finance Tab ─── */}
        {activeTab === 'finance' && (
          <>
            {/* Active Finance */}
            <UITypography variant="semiBold" style={styles.sectionHeader}>
              Active Finance{' '}
            </UITypography>

            <View style={styles.financeCard}>
              {loadingActiveFinance ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#099453" />
                </View>
              ) : activeFinancePrograms.length === 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                    No active finance
                  </UITypography>
                </View>
              ) : (
                activeFinancePrograms.map((program) => {
                  const currSymbol = getCurrencySymbol(program.currency);
                  const request = financingRequests.find(
                    (r) => r.program_id === program.id,
                  );
                  const availableLimit = `${currSymbol}${(
                    request?.available_limit ?? program.available_limit ?? 0
                  ).toLocaleString()}`;
                  const utilizedLimit = `${currSymbol}${(
                    request?.utilized_limit ?? 0
                  ).toLocaleString()}`;
                  return (
                    <Pressable
                      key={program.id}
                      style={styles.bankRow}
                      onPress={() =>
                        navigation.navigate('ActiveFinanceDetail', {
                          bankName: program.lender_name,
                          availableLimit,
                          utilizedLimit,
                          programId: program.id,
                        })
                      }
                    >
                      <View style={styles.bankIcon}>
                        <CreditCardIcon width={34} height={23} />
                      </View>
                      <View style={styles.bankInfo}>
                        <UITypography variant="semiBold" style={styles.bankName}>
                          {program.lender_name}
                        </UITypography>
                        <UITypography variant="medium" style={styles.bankLimit}>
                          Financing Limit: {availableLimit}
                        </UITypography>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Active Requests */}
            <UITypography variant="semiBold" style={styles.sectionHeader}>
              Line Requests
            </UITypography>

            <View style={styles.requestsCard}>
              <View style={styles.requestsCardHeader}>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Recent Requests
                </UITypography>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Amount
                </UITypography>
              </View>

              {loadingRequests ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#099453" />
                </View>
              ) : visibleRequests.length === 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                    No requests yet
                  </UITypography>
                </View>
              ) : (
                visibleRequests.map((req, index) => {
                  const displayName = formatProductType(req.product_type);
                  const statusLabel = getStatusLabel(req.request_status);
                  const statusCat = getStatusCategory(req.request_status);
                  const currSymbol = getCurrencySymbol(req.currency);

                  return (
                    <Pressable
                      key={req.id}
                      style={styles.transactionRow}
                      onPress={() => navigation.navigate('LoanStatus', { submissionId: req.id })}
                    >
                      {req.product_image ? (
                        <Image
                          source={{ uri: req.product_image }}
                          style={[styles.avatar, { backgroundColor: '#EEE' }]}
                        />
                      ) : (
                        <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                          <UITypography variant="semiBold" style={styles.avatarText}>
                            {getInitials(displayName)}
                          </UITypography>
                        </View>
                      )}
                      <View style={styles.transactionInfo}>
                        <UITypography variant="semiBold" style={styles.transactionName}>
                          {displayName}
                        </UITypography>
                        <UITypography variant="medium" style={styles.transactionDueDate}>
                          Submitted on: {formatSubmittedDate(req.created_at)}
                        </UITypography>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <UITypography variant="semiBold" style={styles.transactionAmount}>
                          {currSymbol}{req.amount.toLocaleString()}
                        </UITypography>
                        <View
                          style={[
                            styles.statusBadge,
                            statusCat === 'approved' && styles.statusBadgeApproved,
                            statusCat === 'pending' && styles.statusBadgePending,
                            statusCat === 'rejected' && styles.statusBadgeRejected,
                          ]}
                        >
                          <UITypography
                            variant="medium"
                            style={[
                              styles.statusBadgeText,
                              statusCat === 'approved' && styles.statusBadgeTextApproved,
                              statusCat === 'pending' && styles.statusBadgeTextPending,
                              statusCat === 'rejected' && styles.statusBadgeTextRejected,
                            ]}
                          >
                            {statusLabel}
                          </UITypography>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}

              {financingRequests.length > 2 && (
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('ActiveRequestsSeeAll')}
                >
                  <UITypography variant="medium" style={styles.seeAllText}>
                    See all
                  </UITypography>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* ─── Marketplace Tab ─── */}
        {activeTab === 'marketplace' && (
          <>
            {/* Log Your Harvest Banner */}
            <View style={styles.harvestBanner}>
              <View style={[styles.bannerBubble, { width: 86, height: 86, left: -16, top: -20 }]} />
              <View style={[styles.bannerBubble, { width: 23, height: 23, left: 55, top: 5 }]} />
              <View style={[styles.bannerBubble, { width: 11, height: 11, left: 74, top: 28 }]} />
              <View style={[styles.bannerBubble, { width: 14, height: 14, left: 69, top: 38 }]} />
              <View style={[styles.bannerBubble, { width: 44, height: 44, left: 58, top: 44 }]} />
              <Image
                source={require('@/assets/images/marketplace/harvest-farmer.png')}
                style={styles.harvestBannerImage}
                resizeMode="contain"
              />
              <View style={styles.harvestBannerContent}>
                <UITypography variant="bold" style={styles.harvestBannerTitle}>
                  Log Your Harvest
                </UITypography>
                <UITypography variant="regular" style={styles.harvestBannerDesc}>
                  {harvestLogs.length > 0
                    ? 'Record actual harvest to access the marketplace.'
                    : 'Record your harvest to access the marketplace.'}
                </UITypography>
              </View>
              <Pressable
                style={styles.harvestBannerButton}
                onPress={() => {
                  navigation.navigate('LogHarvestDetails', { mode: 'log' });
                }}
              >
                <UITypography variant="bold" style={styles.harvestBannerButtonText}>
                  {harvestLogs.length > 0 ? 'View' : 'Log Now'}
                </UITypography>
              </Pressable>
            </View>

            {/* Marketplace Cards */}
            <UITypography variant="semiBold" style={styles.marketplaceHeading}>
              Marketplace
            </UITypography>
            <View style={styles.marketplaceCardsRow}>
              <Pressable
                style={styles.marketplaceCard}
                onPress={handleBuyInputsNavigation}
                disabled={loadingBuyInputs}
              >
                {loadingBuyInputs ? (
                  <ActivityIndicator size="small" color="#009E54" />
                ) : (
                  <BuyInputsIcon size={24} color="#009E54" />
                )}
                <View style={styles.marketplaceCardTextWrap}>
                  <UITypography variant="semiBold" style={styles.marketplaceCardTitle}>
                    Buy Farm Inputs
                  </UITypography>
                  <UITypography variant="regular" style={styles.marketplaceCardDesc}>
                    Get quality seeds, tools, and supplies
                  </UITypography>
                </View>
              </Pressable>
              <Pressable
                style={styles.marketplaceCard}
                onPress={() => {
                  navigation.navigate('LogHarvestDetails', { mode: 'sell' });
                }}
              >
                <SellHarvestMarketIcon size={24} color="#009E54" />
                <View style={styles.marketplaceCardTextWrap}>
                  <UITypography variant="semiBold" style={styles.marketplaceCardTitle}>
                    Sell Harvest
                  </UITypography>
                  <UITypography variant="regular" style={styles.marketplaceCardDesc}>
                    Reach buyers and earn from your crops
                  </UITypography>
                </View>
              </Pressable>
            </View>

            {/* Buy Orders Section */}
            <UITypography variant="semiBold" style={styles.sectionHeader}>
              Buy Orders
            </UITypography>
            <View style={styles.requestsCard}>
              <View style={styles.requestsCardHeader}>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Transactions
                </UITypography>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Amount
                </UITypography>
              </View>
              {loadingBuyOrders ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#099453" />
                </View>
              ) : visibleBuyOrders.length === 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                    No buy orders yet
                  </UITypography>
                </View>
              ) : (
                visibleBuyOrders.map((order, index) => {
                  const initials = getInitials(order.counterparty_name);
                  const statusType = getOrderStatusType(order.status);
                  return (
                    <Pressable
                      key={order.id}
                      style={styles.transactionRow}
                      onPress={() => navigation.navigate('BuyOrderDetail', { orderId: order.id })}
                    >
                      <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                        <UITypography variant="semiBold" style={styles.avatarText}>
                          {initials}
                        </UITypography>
                      </View>
                      <View style={styles.transactionInfo}>
                        <UITypography variant="semiBold" style={styles.transactionName}>
                          {order.counterparty_name}
                        </UITypography>
                        <UITypography variant="medium" style={styles.transactionDueDate}>
                          Order Date: {formatOrderDate(order.transaction_date)}
                        </UITypography>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <UITypography variant="semiBold" style={styles.transactionAmount}>
                          Rs {order.amount?.toLocaleString() ?? '0'}
                        </UITypography>
                        <View
                          style={[
                            styles.statusBadge,
                            statusType === 'fulfilled' && styles.statusBadgeApproved,
                            statusType === 'pending' && styles.statusBadgePending,
                          ]}
                        >
                          <UITypography
                            variant="medium"
                            style={[
                              styles.statusBadgeText,
                              statusType === 'fulfilled' && styles.statusBadgeTextApproved,
                              statusType === 'pending' && styles.statusBadgeTextOrange,
                            ]}
                          >
                            {getOrderStatusLabel(order.status)}
                          </UITypography>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
              {buyOrders.length > 4 && (
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('BuyOrdersSeeAll')}
                >
                  <UITypography variant="medium" style={styles.seeAllText}>
                    See all
                  </UITypography>
                </Pressable>
              )}
            </View>

            {/* Sale Orders Section */}
            <UITypography variant="semiBold" style={styles.sectionHeader}>
              Sale Orders
            </UITypography>
            <View style={styles.requestsCard}>
              <View style={styles.requestsCardHeader}>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Transactions
                </UITypography>
                <UITypography variant="medium" style={styles.requestsColumnLabel}>
                  Amount
                </UITypography>
              </View>
              {loadingSaleOrders ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#099453" />
                </View>
              ) : visibleSaleOrders.length === 0 ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                    No sale orders yet
                  </UITypography>
                </View>
              ) : (
                visibleSaleOrders.map((order, index) => {
                  const initials = getInitials(order.counterparty_name);
                  const statusType = getOrderStatusType(order.status);
                  return (
                    <Pressable
                      key={order.id}
                      style={styles.transactionRow}
                      onPress={() => navigation.navigate('SaleOrderDetail', { orderId: order.id })}
                    >
                      <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                        <UITypography variant="semiBold" style={styles.avatarText}>
                          {initials}
                        </UITypography>
                      </View>
                      <View style={styles.transactionInfo}>
                        <UITypography variant="semiBold" style={styles.transactionName}>
                          {order.counterparty_name}
                        </UITypography>
                        <UITypography variant="medium" style={styles.transactionDueDate}>
                          Order Date: {formatOrderDate(order.transaction_date)}
                        </UITypography>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <UITypography variant="semiBold" style={styles.transactionAmount}>
                          {order.amount != null ? `Rs ${order.amount.toLocaleString()}` : '—'}
                        </UITypography>
                        <View
                          style={[
                            styles.statusBadge,
                            statusType === 'fulfilled' && styles.statusBadgeApproved,
                            statusType === 'pending' && styles.statusBadgePending,
                          ]}
                        >
                          <UITypography
                            variant="medium"
                            style={[
                              styles.statusBadgeText,
                              statusType === 'fulfilled' && styles.statusBadgeTextApproved,
                              statusType === 'pending' && styles.statusBadgeTextOrange,
                            ]}
                          >
                            {getOrderStatusLabel(order.status)}
                          </UITypography>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
              {saleOrders.length > 4 && (
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('SaleOrdersSeeAll')}
                >
                  <UITypography variant="medium" style={styles.seeAllText}>
                    See all
                  </UITypography>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* Loan Applications CTA */}
        {hasIncompleteApplications && activeTab === 'finance' && (
          <Pressable
            style={styles.ctaCard}
            onPress={() => navigation.navigate('LoanApplications')}
          >
            <View style={styles.ctaIconWrap}>
              <CreditCardIcon width={24} height={16} />
            </View>
            <View style={styles.ctaTextWrap}>
              <UITypography variant="bold" style={styles.ctaTitle} numberOfLines={2}>
                Complete your credit line application
              </UITypography>
              <UITypography variant="medium" style={styles.ctaSubtitle}>
                Bank Credit
              </UITypography>
            </View>
            <View style={styles.ctaContinueBtn}>
              <UITypography variant="bold" style={styles.ctaContinueText}>
                Continue
              </UITypography>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
