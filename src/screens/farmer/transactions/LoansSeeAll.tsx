import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterSlidersIcon from '@/components/icons/FilterSlidersIcon';

type LoanStatus = 'due' | 'overdue' | 'none';
type FilterTab = 'all' | 'dueToday' | 'overdue';

const AVATAR_COLORS = ['#6C63FF', '#E91E63', '#2196F3', '#FFA726', '#4CAF50', '#00BCD4'];

const DEMO_LOANS = [
  {
    id: '1',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'due' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[0],
  },
  {
    id: '2',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'overdue' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[1],
  },
  {
    id: '3',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'none' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[2],
  },
  {
    id: '4',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'none' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[3],
  },
  {
    id: '5',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'none' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[4],
  },
  {
    id: '6',
    name: 'Kwame Agri Supplies',
    initials: 'KA',
    orderId: 'Order Id #789292',
    dueDate: 'Due: 29 Feb, 2026',
    status: 'none' as LoanStatus,
    amount: 'Rs 27.19',
    color: AVATAR_COLORS[5],
  },
];

export default function LoansSeeAll() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLoans = DEMO_LOANS.filter((loan) => {
    if (activeTab === 'dueToday') return loan.status === 'due';
    if (activeTab === 'overdue') return loan.status === 'overdue';
    return true;
  }).filter((loan) => {
    if (!searchQuery.trim()) return true;
    return loan.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  const sectionTitle =
    activeTab === 'all'
      ? 'All Loans'
      : activeTab === 'dueToday'
      ? 'Due Today Loans'
      : 'Over Due Loans';

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Loans
        </UITypography>
      </View>

      {/* Search + Filter Row */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon size={16} color="#979797" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search loans..."
            placeholderTextColor="#979797"
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <FilterSlidersIcon size={18} color="#979797" />
        </Pressable>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'dueToday', label: 'Due Today' },
            { key: 'overdue', label: 'Over Due' },
          ] as { key: FilterTab; label: string }[]
        ).map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <UITypography
              variant="semiBold"
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </UITypography>
          </Pressable>
        ))}
      </View>

      {/* Section Header */}
      <UITypography variant="semiBold" style={styles.sectionHeader}>
        {sectionTitle}
      </UITypography>

      {/* Loans List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.loansCard}>
          <View style={styles.loansCardHeader}>
            <UITypography variant="medium" style={styles.columnLabel}>
              Loans
            </UITypography>
            <UITypography variant="medium" style={styles.columnLabel}>
              Amount
            </UITypography>
          </View>

          {filteredLoans.length === 0 ? (
            <View style={styles.emptyState}>
              <UITypography variant="medium" style={styles.emptyStateText}>
                No loans found
              </UITypography>
            </View>
          ) : (
            filteredLoans.map((loan) => (
              <Pressable
                key={loan.id}
                style={styles.loanRow}
                onPress={() => navigation.navigate('ActiveLoanDetail', { loan })}
              >
                <View style={[styles.avatar, { backgroundColor: loan.color }]}>
                  <UITypography variant="semiBold" style={styles.avatarText}>
                    {loan.initials}
                  </UITypography>
                </View>
                <View style={styles.loanInfo}>
                  <UITypography variant="semiBold" style={styles.loanName}>
                    {loan.name}
                  </UITypography>
                  <UITypography variant="medium" style={styles.loanSubText}>
                    {loan.orderId}
                  </UITypography>
                  <UITypography variant="medium" style={styles.loanSubText}>
                    {loan.dueDate}
                  </UITypography>
                </View>
                <View style={styles.amountBadgeContainer}>
                  <UITypography variant="semiBold" style={styles.loanAmount}>
                    {loan.amount}
                  </UITypography>
                  {loan.status !== 'none' && (
                    <View
                      style={[
                        styles.statusBadge,
                        loan.status === 'due'
                          ? styles.statusBadgeDue
                          : styles.statusBadgeOverDue,
                      ]}
                    >
                      <UITypography
                        variant="medium"
                        style={[
                          styles.statusBadgeText,
                          loan.status === 'due'
                            ? styles.statusBadgeTextDue
                            : styles.statusBadgeTextOverDue,
                        ]}
                      >
                        {loan.status === 'due' ? 'Due' : 'Over Due'}
                      </UITypography>
                    </View>
                  )}
                </View>
              </Pressable>
            ))
          )}
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

  /* Search + Filter */
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#101010',
    padding: 0,
  },
  filterButton: {
    width: 34,
    height: 34,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    height: 36,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    borderRadius: 30,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#099453',
  },
  tabText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* Section header */
  sectionHeader: {
    fontSize: 13,
    color: '#101010',
    marginHorizontal: 20,
    marginBottom: 12,
    lineHeight: 20,
  },

  /* Loans Card */
  loansCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 24,
  },
  loansCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  columnLabel: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },

  /* Loan Row */
  loanRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  loanInfo: {
    flex: 1,
  },
  loanName: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
    marginBottom: 1,
  },
  loanSubText: {
    fontSize: 12,
    color: '#979797',
    lineHeight: 17,
  },
  amountBadgeContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  loanAmount: {
    fontSize: 13,
    color: '#101010',
    lineHeight: 20,
    marginBottom: 4,
  },

  /* Status Badges */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeDue: {
    backgroundColor: '#E7F8F0',
  },
  statusBadgeOverDue: {
    backgroundColor: '#FFE19C',
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  statusBadgeTextDue: {
    color: '#099453',
  },
  statusBadgeTextOverDue: {
    color: '#FB6B18',
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#979797',
  },
});
