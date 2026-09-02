import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterSlidersIcon from '@/components/icons/FilterSlidersIcon';
import CloseXIcon from '@/components/icons/CloseXIcon';
import { transactionsService, MarketplaceOrder } from '@/services/transactions.service';

const AVATAR_COLORS = ['#1ABC6D', '#4D9DE0', '#E8A838', '#E86B4F'];
const FILTER_TABS = ['All', 'Fulfilled', 'Pending'];

export default function BuyOrdersSeeAll() {
  const navigation = useNavigation<any>();
  const { top, bottom } = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionsService.getMarketplaceOrders('purchase_order');
      setOrders(response.data ?? []);
    } catch (error) {
      console.log('Error fetching buy orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleSearchToggle = () => {
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery('');
    } else {
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const filteredOrders = orders
    .filter(o => activeFilter === 'All' || o.status.toLowerCase() === activeFilter.toLowerCase())
    .filter(o =>
      searchQuery.trim() === '' ||
      (o.counterparty_name ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  return (
    <View style={s.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={[s.header, { paddingTop: top + 16 }]}>
        <Pressable style={s.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={s.headerTitle}>
          Buy Orders
        </UITypography>
      </View>

      {/* Search row */}
      <View style={s.searchRow}>
        {showSearch ? (
          <>
            <TextInput
              ref={searchInputRef}
              style={s.searchInput}
              placeholder="Search by name..."
              placeholderTextColor="#979797"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            <Pressable style={s.iconBox} onPress={handleSearchToggle}>
              <CloseXIcon size={10} color="#979797" />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={s.iconBox} onPress={handleSearchToggle}>
              <SearchIcon size={14} color="#979797" />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={s.iconBox} onPress={() => setShowFilterSheet(true)}>
              <FilterSlidersIcon size={16} color={activeFilter !== 'All' ? '#099453' : '#979797'} />
            </Pressable>
          </>
        )}
      </View>

      <View style={s.filterTabContainer}>
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[s.filterTab, activeFilter === tab && s.filterTabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <UITypography
              variant="semiBold"
              style={[s.filterTabText, activeFilter === tab && s.filterTabTextActive]}
            >
              {tab}
            </UITypography>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#099453" colors={['#099453']} />
        }
      >
        <UITypography variant="semiBold" style={s.sectionHeader}>
          Buy Orders
        </UITypography>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <UITypography variant="medium" style={s.columnLabel}>
              Transactions
            </UITypography>
            <UITypography variant="medium" style={s.columnLabel}>
              Amount
            </UITypography>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator size="small" color="#099453" />
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <UITypography variant="medium" style={{ fontSize: 12, color: '#979797' }}>
                No orders found
              </UITypography>
            </View>
          ) : (
            filteredOrders.map((order, index) => {
              const initials = (order.counterparty_name ?? 'N/A').substring(0, 2).toUpperCase();
              const statusLower = (order.status ?? '').toLowerCase();
              const isFulfilled = statusLower === 'fulfilled';
              return (
                <Pressable
                  key={order.id}
                  style={s.row}
                  onPress={() => navigation.navigate('BuyOrderDetail', { orderId: order.id })}
                >
                  <View style={[s.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                    <UITypography variant="semiBold" style={s.avatarText}>
                      {initials}
                    </UITypography>
                  </View>
                  <View style={s.info}>
                    <UITypography variant="semiBold" style={s.name}>
                      {order.counterparty_name ?? 'Unknown'}
                    </UITypography>
                    <UITypography variant="medium" style={s.date}>
                      Order Date: {formatDate(order.transaction_date)}
                    </UITypography>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <UITypography variant="semiBold" style={s.amount}>
                      Rs {order.amount?.toLocaleString() ?? '0'}
                    </UITypography>
                    <View style={[s.badge, isFulfilled ? s.badgeFulfilled : s.badgePending]}>
                      <UITypography
                        variant="medium"
                        style={[s.badgeText, isFulfilled ? s.badgeTextFulfilled : s.badgeTextPending]}
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

      {/* Filter Bottom Sheet */}
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowFilterSheet(false)} />
        <View style={[s.sheet, { paddingBottom: bottom + 20 }]}>
          <UITypography variant="semiBold" style={s.sheetTitle}>
            Filter by Status
          </UITypography>
          {FILTER_TABS.map(tab => (
            <Pressable
              key={tab}
              style={[s.sheetOption, activeFilter === tab && s.sheetOptionActive]}
              onPress={() => {
                setActiveFilter(tab);
                setShowFilterSheet(false);
              }}
            >
              <UITypography
                variant="semiBold"
                style={[s.sheetOptionText, activeFilter === tab && s.sheetOptionTextActive]}
              >
                {tab}
              </UITypography>
              {activeFilter === tab && (
                <View style={s.sheetOptionDot} />
              )}
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: { position: 'absolute', left: 16, padding: 4 },
  headerTitle: { fontSize: 18, color: '#101010', textAlign: 'center', lineHeight: 28 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#101010',
    fontFamily: 'Poppins-Regular',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    height: 36,
    marginBottom: 24,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    borderRadius: 30,
    marginHorizontal: 4,
  },
  filterTabActive: { backgroundColor: '#099453' },
  filterTabText: { fontSize: 13, color: '#444', textAlign: 'center' },
  filterTabTextActive: { color: '#FFF' },
  scrollContent: { paddingBottom: 32 },
  sectionHeader: { fontSize: 13, color: '#101010', marginHorizontal: 20, marginBottom: 12, lineHeight: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    marginBottom: 16,
  },
  columnLabel: { fontSize: 12, color: '#979797', lineHeight: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 15, color: '#FFF', textAlign: 'center', lineHeight: 22 },
  info: { flex: 1 },
  name: { fontSize: 13, color: '#101010', lineHeight: 20, marginBottom: 2 },
  date: { fontSize: 12, color: '#979797', lineHeight: 20 },
  amount: { fontSize: 13, color: '#101010', lineHeight: 20, marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  badgeFulfilled: { backgroundColor: '#E7F8F0' },
  badgePending: { backgroundColor: '#FFE19C' },
  badgeText: { fontSize: 10, lineHeight: 16, textAlign: 'center' },
  badgeTextFulfilled: { color: '#099453' },
  badgeTextPending: { color: '#FB6B18' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sheetTitle: { fontSize: 15, color: '#101010', marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8F8FB',
  },
  sheetOptionActive: { backgroundColor: '#E7F8F0' },
  sheetOptionText: { fontSize: 14, color: '#444' },
  sheetOptionTextActive: { color: '#099453' },
  sheetOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#099453',
  },
});
