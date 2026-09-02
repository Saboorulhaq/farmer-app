import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterIcon from '@/components/icons/FilterIcon';
import { styles } from './ActiveRequestsSeeAll.styled';
import {
  transactionsService,
  FinancingRequest,
  getCurrencySymbol,
  formatProductType,
  formatSubmittedDate,
  getStatusCategory,
  getStatusLabel,
  getAvatarColor,
} from '@/services/transactions.service';

type FilterTab = 'all' | 'offered' | 'rejected';
type SortOrder = 'newest' | 'oldest';

/* ─── Component ─── */
export default function ActiveRequestsSeeAll() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Filter/sort state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionsService.getFinancingRequests();
      setRequests(response.data ?? []);
    } catch (error) {
      console.log('Error fetching financing requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await transactionsService.getFinancingRequests();
      setRequests(response.data ?? []);
    } catch (error) {
      console.log('Error refreshing financing requests:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter based on active tab + search query + sort
  const filteredRequests = requests
    .filter((req) => {
      if (activeTab === 'all') return true;
      const cat = getStatusCategory(req.request_status);
      if (activeTab === 'offered') return cat === 'approved';
      if (activeTab === 'rejected') return cat === 'rejected';
      return true;
    })
    .filter((req) => {
      if (!searchQuery.trim()) return true;
      const name = formatProductType(req.product_type).toLowerCase();
      return name.includes(searchQuery.trim().toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Line Requests
        </UITypography>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchFilterRow}>
        <Pressable
          style={styles.searchButton}
          onPress={() => {
            setSearchVisible(v => {
              if (v) setSearchQuery('');
              return !v;
            });
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
        >
          <SearchIcon size={16} color={searchVisible ? '#099453' : '#101010'} />
        </Pressable>
        <Pressable style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <FilterIcon size={16} color={sortOrder !== 'newest' ? '#099453' : '#101010'} />
        </Pressable>
      </View>

      {/* Search Input */}
      {searchVisible && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by product type..."
            placeholderTextColor="#aaa"
            style={{
              height: 40,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              paddingHorizontal: 12,
              fontSize: 14,
              color: '#101010',
              backgroundColor: '#fff',
            }}
          />
        </View>
      )}

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <UITypography
            variant="semiBold"
            style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}
          >
            All
          </UITypography>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'offered' && styles.tabActive]}
          onPress={() => setActiveTab('offered')}
        >
          <UITypography
            variant="semiBold"
            style={[styles.tabText, activeTab === 'offered' && styles.tabTextActive]}
          >
            Offered
          </UITypography>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => setActiveTab('rejected')}
        >
          <UITypography
            variant="semiBold"
            style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}
          >
            Rejected
          </UITypography>
        </Pressable>
      </View>

      {/* Section Header */}
      <UITypography variant="semiBold" style={styles.sectionHeader}>
        {activeTab === 'all' ? 'All Line Request' : activeTab === 'offered' ? 'Offered Requests' : 'Rejected Requests'}
        {sortOrder === 'oldest' ? '  •  Oldest First' : ''}
      </UITypography>

      {/* Transactions List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#099453" colors={['#099453']} />
        }
      >
        <View style={styles.requestsCard}>
          <View style={styles.requestsCardHeader}>
            <UITypography variant="medium" style={styles.requestsColumnLabel}>
              Recent Requests
            </UITypography>
            <UITypography variant="medium" style={styles.requestsColumnLabel}>
              Amount
            </UITypography>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#099453" />
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <UITypography variant="medium" style={{ fontSize: 13, color: '#979797' }}>
                No requests found
              </UITypography>
            </View>
          ) : (
            filteredRequests.map((req, index) => {
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
                        {displayName.substring(0, 2).toUpperCase()}
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
                  <View style={styles.amountBadgeContainer}>
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
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 }}>
            <UITypography variant="semiBold" style={{ fontSize: 16, color: '#101010', marginBottom: 16 }}>
              Sort By
            </UITypography>
            {(['newest', 'oldest'] as SortOrder[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => { setSortOrder(option); setFilterModalVisible(false); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0',
                }}
              >
                <UITypography variant="medium" style={{ fontSize: 14, color: '#101010' }}>
                  {option === 'newest' ? 'Newest First' : 'Oldest First'}
                </UITypography>
                {sortOrder === option && (
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#099453' }} />
                )}
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
