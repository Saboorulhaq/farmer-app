import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { axiosPrivate } from '@/config/axios';
import { UIContainedButton, UITypography } from '@/components/ui';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { styles } from './AllFarmersScreen.styled';

type FarmerAttributes = {
  farmer_id: number;
  name: string;
  phone_number: string;
  ghana_card_number: string;
  registration_complete: boolean;
  registration_step: number;
  created_at: string;
};

type Farmer = {
  id: number;
  type: string;
  attributes: FarmerAttributes;
};

type Meta = {
  total_count: number;
  current_page: number;
  total_pages: number;
  farmers_count: number;
};

const PER_PAGE = 15;

const AllFarmersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmers = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const res = await axiosPrivate.get(
          `/agents/farmers?page=${pageNum}&per_page=${PER_PAGE}`,
        );

        const data: Farmer[] = res.data?.data ?? [];
        const metaData: Meta = res.data?.meta;

        setFarmers(prev => (append ? [...prev, ...data] : data));
        setMeta(metaData);
        setError(null);
      } catch (err: any) {
        setError('Failed to load farmers. Please try again.');
        console.warn('Error fetching farmers:', err?.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchFarmers(1);
  }, [fetchFarmers]);

  const handleLoadMore = () => {
    if (loadingMore || !meta || page >= meta.total_pages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFarmers(nextPage, true);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');

  const renderFarmerCard = ({ item }: { item: Farmer }) => {
    const { name, phone_number, ghana_card_number, registration_complete } =
      item.attributes;
    return (
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        onPress={() => (navigation as any).navigate('FarmerDetail', { farmerId: item.id })}
      >
        <View style={styles.farmerCard}>
        <View style={styles.cardTop}>
          <View style={styles.avatarCircle}>
            <UITypography variant="semiBold" style={styles.avatarInitials}>
              {getInitials(name)}
            </UITypography>
          </View>
          <View style={styles.cardInfo}>
            <UITypography variant="semiBold" style={styles.farmerName}>
              {name}
            </UITypography>
            <View
              style={[
                styles.statusBadge,
                registration_complete
                  ? styles.statusComplete
                  : styles.statusIncomplete,
              ]}
            >
              <UITypography
                variant="medium"
                style={[
                  styles.statusText,
                  registration_complete
                    ? styles.statusCompleteText
                    : styles.statusIncompleteText,
                ]}
              >
                {registration_complete ? '✓ Registered' : '⏳ Incomplete'}
              </UITypography>
            </View>
          </View>
          <ChevronRightIcon size={18} color="#C0C0C0" />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardDetailRow}>
          <View style={styles.cardDetailItem}>
            <PhoneIcon size={14} color="#099453" />
            <UITypography variant="regular" style={styles.farmerDetail}>
              {phone_number}
            </UITypography>
          </View>
          <View style={styles.cardDetailItem}>
            <UITypography variant="semiBold" style={styles.idIcon}>ID</UITypography>
            <UITypography variant="regular" style={styles.farmerDetail}>
              {ghana_card_number}
            </UITypography>
          </View>
        </View>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {loadingMore && (
          <ActivityIndicator style={styles.footerLoader} color="#099453" />
        )}
        {meta && (
          <UITypography variant="regular" style={styles.pageInfo}>
            Page {meta.current_page} of {meta.total_pages}  ·  {meta.total_count} farmers
          </UITypography>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  if (error && farmers.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <UITypography variant="regular" style={styles.errorText}>
          {error}
        </UITypography>
        <UIContainedButton onPress={() => fetchFarmers(1)}>
          Retry
        </UIContainedButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={[styles.header, { paddingTop: top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <ChevronLeftIcon size={24} color="#fff" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          All Farmers
        </UITypography>
        <View style={styles.countBadge}>
          <UITypography variant="semiBold" style={styles.countBadgeText}>
            {meta?.total_count ?? farmers.length}
          </UITypography>
        </View>
      </View>
      <FlatList
        data={farmers}
        keyExtractor={item => String(item.id)}
        renderItem={renderFarmerCard}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.centered}>
            <UITypography variant="regular" style={styles.emptyText}>
              No farmers found
            </UITypography>
          </View>
        }
      />
    </View>
  );
};

export default AllFarmersScreen;
