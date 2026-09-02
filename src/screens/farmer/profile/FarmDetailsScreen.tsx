import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UITypography, UITextInput } from '@/components/ui';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import Svg, { Path } from 'react-native-svg';
import FarmIcon from '@/components/icons/FarmIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import WarningTriangleIcon from '@/components/icons/WarningTriangleIcon';
import { axiosPrivate } from '@/config/axios';
import { Toast } from 'toastify-react-native';

function EditIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.067 13.6l-3.6.733.733-3.6L11.333 2Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ size = 12, color = '#FFFFFF' }: { size?: number; color?: string }) {
  const stroke = 2;
  const half = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`M ${half} 0 V ${size} M 0 ${half} H ${size}`}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface FarmData {
  id: string;
  uuid: string;
  gpsNumber: string | null;
  ownership: string;
  ownsFarmRaw: string;
  farmSize: string;
  farmSizeUnit: string;
  primaryCrop: string;
  secondaryCrop: string;
  gpsAddress: string;
  address: string;
  hasActiveLoan: boolean;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <UITextInput
      label={label}
      labelStyle={s.inputLabel}
      value={value}
      editable={false}
      error={false}
      helperText=""
    />
  );
}

function FarmCard({
  farm,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
}: {
  farm: FarmData;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const displayName = farm.gpsNumber || farm.address || 'Farm';
  const hasLoan = farm.hasActiveLoan;

  return (
    <View style={s.farmCard}>
      <TouchableOpacity
        style={s.farmCardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[s.chevronContainer, isExpanded && s.chevronRotated]}>
          <ChevronDownIcon size={20} color="#444" />
        </View>
        <UITypography variant="semiBold" style={s.farmCardTitle}>
          {displayName}
        </UITypography>
        {isExpanded && !hasLoan ? (
          <View style={s.actionButtons}>
            <TouchableOpacity
              style={s.iconButton}
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EditIcon size={16} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.iconButton}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <DeleteIcon width={14} height={16} color="#888" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.actionButtonsPlaceholder} />
        )}
      </TouchableOpacity>

      <View style={s.headerDivider} />

      {isExpanded && (
        <View style={s.farmCardBody}>
          <InfoRow label="Farm Ownership" value={farm.ownership} />
          <InfoRow
            label="Farm Size"
            value={[farm.farmSize, farm.farmSizeUnit].filter(Boolean).join(' ') || '—'}
          />
          <InfoRow label="Primary Produce" value={farm.primaryCrop} />
          <InfoRow
            label="Secondary Produce (Optional)"
            value={farm.secondaryCrop}
          />
          <InfoRow label="Farm Address" value={farm.address} />
          <InfoRow
            label="Postal Code"
            value={farm.gpsAddress}
          />
          {hasLoan && (
            <View style={s.loanBanner}>
              <WarningTriangleIcon size={20} color="#F32735" />
              <View style={s.loanBannerTextWrap}>
                <UITypography variant="semiBold" style={s.loanBannerTitle}>
                  Active Loan linked to the farm
                </UITypography>
                <UITypography variant="regular" style={s.loanBannerSubtitle}>
                  You cannot update farm details linked to an active loan
                </UITypography>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function FarmDetailsScreen() {
  const navigation = useNavigation<any>();
  const { top, bottom } = useSafeAreaInsets();

  const [farms, setFarms] = useState<FarmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFarms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get('/users/farms');
      const raw: any[] = res.data?.data || [];

      const mapped: FarmData[] = raw.map((item: any) => {
        const a = item.attributes || {};
        const gpsNumber: string | null = a.ghana_post_gps_number ?? null;
        return {
          id: String(item.id || a.uuid || Math.random()),
          uuid: a.uuid || String(item.id),
          gpsNumber,
          ownsFarmRaw: a.owns_farm || '',
          ownership: a.owns_farm
            ? a.owns_farm.charAt(0).toUpperCase() + a.owns_farm.slice(1)
            : '—',
          farmSize: a.farm_size != null ? `${a.farm_size}` : '—',
          farmSizeUnit: a.farm_size_unit || 'acres',
          primaryCrop: a.primary_crop || '—',
          secondaryCrop: a.secondary_crop || '—',
          gpsAddress: gpsNumber ?? '—',
          address: a.address || '—',
          hasActiveLoan: a.has_active_loan === true,
        };
      });

      setFarms(mapped);
    } catch {
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [fetchFarms]),
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev !== id ? id : null));
  }, []);

  const handleDelete = useCallback((farm: FarmData) => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete this farm?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosPrivate.delete(`/users/farms/${farm.uuid}`);
              Toast.show({ type: 'success', text1: 'Farm deleted successfully' });
              setExpandedId(null);
              fetchFarms();
            } catch (err: any) {
              if (!err?.__handledGlobally) {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2:
                    err?.response?.data?.message ||
                    'Failed to delete farm. Please try again.',
                });
              }
            }
          },
        },
      ],
    );
  }, [fetchFarms]);

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: top }]}>
        <LoanScreenHeader
          title="My Farm Details"
          onBack={() => navigation.goBack()}
          containerStyle={s.header}
          titleStyle={s.headerTitle}
        />
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#099453" />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: top }]}>
      <LoanScreenHeader
        title="My Farm Details"
        onBack={() => navigation.goBack()}
        containerStyle={s.header}
        titleStyle={s.headerTitle}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: bottom + 100 }]}
      >
        <View style={s.card}>
          <View style={s.cardHeader}>
            <FarmIcon size={28} backgroundColor="#1D3A70" strokeColor="#FFFFFF" />
            <UITypography variant="semiBold" style={s.cardTitle}>
              Farm Details
            </UITypography>
          </View>

          {farms.length === 0 ? (
            <View style={s.emptyState}>
              <UITypography variant="regular" style={s.emptyText}>
                No farm details found.
              </UITypography>
            </View>
          ) : (
            farms.map(farm => (
              <FarmCard
                key={farm.id}
                farm={farm}
                isExpanded={expandedId === farm.id}
                onToggle={() => toggleExpand(farm.id)}
                onDelete={() => handleDelete(farm)}
                onEdit={() => navigation.navigate('AddFarm', { farm })}
              />
            ))
          )}
        </View>

        <TouchableOpacity style={s.addFarmRow} activeOpacity={0.7} onPress={() => navigation.navigate('AddFarm')}>
          <View style={s.addFarmCircle}>
            <PlusIcon size={12} color="#FFFFFF" />
          </View>
          <UITypography variant="medium" style={s.addFarmText}>
            Add Farm
          </UITypography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: { color: '#101010', fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20 },
  card: {
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6d6d6d',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, color: '#101010', fontWeight: '600' },
  farmCard: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
  },
  farmCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  farmCardTitle: { fontSize: 13, color: '#101010', flex: 1 },
  chevronContainer: {},
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonsPlaceholder: {
    width: 64,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 16,
  },
  farmCardBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    color: '#444',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  addFarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  addFarmCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#099453',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFarmText: {
    fontSize: 14,
    color: '#101010',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  loanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  loanBannerTextWrap: { flex: 1 },
  loanBannerTitle: { fontSize: 12, color: '#101010', fontWeight: '600' },
  loanBannerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
});
