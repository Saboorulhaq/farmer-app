import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { styles } from './ActiveFinanceDetail.styled';
import { transactionsService, MarketplaceOrder } from '@/services/transactions.service';

type RouteParams = {
  ActiveFinanceDetail: {
    bankName?: string;
    availableLimit?: string;
    utilizedLimit?: string;
    programId?: string;
  };
};

const AVATAR_COLORS = ['#6C63FF', '#E91E63', '#2196F3', '#FFA726'];

/* ─── Component ─── */
export default function ActiveFinanceDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ActiveFinanceDetail'>>();
  const { top } = useSafeAreaInsets();

  const bankName = route.params?.bankName || 'HBL';
  const availableLimit = route.params?.availableLimit || 'Rs 2,500';
  const utilizedLimit = route.params?.utilizedLimit || 'Rs 500';
  const programId = route.params?.programId;

  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionsService.getMarketplaceOrders('purchase_order');
      const allOrders = response.data ?? [];
      const filtered = allOrders.filter(
        (o) =>
          (o.payment_method?.toLowerCase().includes('bank credit') ||
            o.payable_via?.toLowerCase().includes('bank credit')) &&
          (!programId || o.bank_credit_program_id === programId),
      );
      setOrders(filtered);
    } catch (error) {
      console.log('Error fetching buy orders for active finance:', error);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]}, ${date.getFullYear()}`;
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
          Active Finance
        </UITypography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Green Bank Card */}
        <View style={styles.bankCard}>
          {/* Gradient background - absolute fill */}
          <LinearGradient
            colors={['#099453', '#056136']}
            start={{ x: 0, y: 0.36 }}
            end={{ x: 1, y: 0.36 }}
            style={styles.bankCardGradient}
          >
            <View />
          </LinearGradient>

          {/* Decorative SVG blob shapes */}
          <View style={styles.decorSvgContainer}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 327 200"
              preserveAspectRatio="xMaxYMax slice"
            >
              <Path
                opacity={0.1}
                d="M326.962 177.26V157.55C325.872 153.6 324.361 149.71 322.391 145.93L279.039 71.1986C264.129 42.7086 228.999 31.7286 200.589 46.6886L139.439 78.8786C111.029 93.8386 100.079 129.059 114.999 157.549L141.421 199.94H304.342C316.832 199.94 326.962 189.78 326.962 177.26Z"
                fill="white"
              />
              <Path
                opacity={0.1}
                d="M327 177.387V68L245.21 78.6609C221.216 81.7824 204.309 103.752 207.432 127.717L223.368 200H304.418C316.921 200 327 189.873 327 177.387Z"
                fill="white"
              />
            </Svg>
          </View>

          {/* Card content on top */}
          <View style={styles.bankCardContent}>
              <View>
                <UITypography variant="semiBold" style={styles.bankCardName}>
                  {bankName}
                </UITypography>
                <UITypography variant="medium" style={styles.bankCardFacility}>
                  Bank Credit Facility
                </UITypography>
              </View>

              <View style={styles.bankCardLimits}>
                <View style={styles.limitColumn}>
                  <UITypography variant="medium" style={styles.limitLabel}>
                    Financing Limit
                  </UITypography>
                  <UITypography variant="semiBold" style={styles.limitValue}>
                    {availableLimit}
                  </UITypography>
                </View>
                <View style={styles.limitColumnRight}>
                  <UITypography variant="medium" style={styles.limitLabel}>
                    Utilized Limit
                  </UITypography>
                  <UITypography variant="semiBold" style={styles.limitValue}>
                    {utilizedLimit}
                  </UITypography>
                </View>
              </View>
            </View>
        </View>

        {/* Buy Orders via Bank Credit */}
        <View style={styles.requestsCard}>
          <View style={styles.requestsCardHeader}>
            <UITypography variant="medium" style={styles.requestsColumnLabel}>
              Buy Orders
            </UITypography>
            <UITypography variant="medium" style={styles.requestsColumnLabel}>
              Amount
            </UITypography>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator size="small" color="#099453" />
            </View>
          ) : orders.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                No buy orders for this credit facility
              </UITypography>
            </View>
          ) : (
            orders.map((order, index) => {
              const initials = (order.counterparty_name ?? 'N/A').substring(0, 2).toUpperCase();
              const isPending = order.status.toLowerCase() === 'pending';
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
                    <UITypography variant="medium" style={styles.transactionSubText}>
                      {order.transaction_number}
                    </UITypography>
                    <UITypography variant="medium" style={styles.transactionSubText}>
                      Date: {formatDate(order.transaction_date)}
                    </UITypography>
                  </View>
                  <View style={styles.amountBadgeContainer}>
                    <UITypography variant="semiBold" style={styles.transactionAmount}>
                      Rs {(order.amount ?? 0).toLocaleString()}
                    </UITypography>
                    <View
                      style={[
                        styles.statusBadge,
                        isPending ? styles.statusBadgeOverDue : styles.statusBadgeDue,
                      ]}
                    >
                      <UITypography
                        variant="medium"
                        style={[
                          styles.statusBadgeText,
                          isPending ? styles.statusBadgeTextOverDue : styles.statusBadgeTextDue,
                        ]}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </UITypography>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
