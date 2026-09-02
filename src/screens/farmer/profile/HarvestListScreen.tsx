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
import { UITypography, UITextInput, UIToggleSwitch } from '@/components/ui';
import { Text } from 'react-native';
import LoanScreenHeader from '@/components/screens/farmer/bank-credit/components/LoanScreenHeader';
import Svg, { Path } from 'react-native-svg';
import FinancialProfileIcon from '@/components/icons/FinancialProfileIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import WarningTriangleIcon from '@/components/icons/WarningTriangleIcon';
import { axiosPrivate } from '@/config/axios';
import { formatFarmLabel } from '@/util/formatFarmLabel';
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

interface HarvestData {
  id: string;
  selectedProduce: string;
  expectedVolume: string;
  expectedVolumeUnit: string;
  expectedSellingPricePerUnit: string;
  farmUuids: string[];
  farmLabels: string[];
  hasActiveLoan: boolean;
}

function HarvestCard({
  harvest,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
}: {
  harvest: HarvestData;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const displayName = harvest.selectedProduce
    ? harvest.selectedProduce.charAt(0).toUpperCase() + harvest.selectedProduce.slice(1)
    : 'Harvest';
  const hasLoan = harvest.hasActiveLoan;

  return (
    <View style={s.harvestCard}>
      <TouchableOpacity
        style={s.harvestCardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[s.chevronContainer, isExpanded && s.chevronRotated]}>
          <ChevronDownIcon size={20} color="#444" />
        </View>
        <UITypography variant="semiBold" style={s.harvestCardTitle}>
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
        <View style={s.harvestCardBody}>
          {/* Select Produce - green tile */}
          <View style={s.fieldContainer}>
            <UITypography variant="medium" style={s.fieldLabel}>
              Select Produce
            </UITypography>
            <View style={s.grid}>
              <View style={[s.produceTile, s.produceTileSelected]}>
                <UITypography variant="medium" style={s.produceLabel}>
                  {displayName}
                </UITypography>
              </View>
            </View>
          </View>

          {/* Expected Volume + Units inline */}
          <View style={s.fieldContainer}>
            <View style={s.inlineRow}>
              <View style={s.inlineLeft}>
                <UITextInput
                  label="Expected Volume"
                  labelStyle={s.inputLabel}
                  value={harvest.expectedVolume || '—'}
                  editable={false}
                  keyboardType="numeric"
                  error={false}
                  helperText=""
                />
              </View>
              <View style={s.inlineRight}>
                <UITextInput
                  label="Units"
                  labelStyle={s.inputLabel}
                  value={harvest.expectedVolumeUnit || '—'}
                  editable={false}
                  error={false}
                  helperText=""
                />
              </View>
            </View>
          </View>

          {/* Expected Selling Price per Unit */}
          <View style={s.fieldContainer}>
            <UITextInput
              label="Expected Selling Price per Unit"
              labelStyle={s.inputLabel}
              value={harvest.expectedSellingPricePerUnit || '—'}
              addonBefore={
                <Text style={{ fontSize: 16, color: '#404040', fontWeight: '500' }}>Rs</Text>
              }
              addonBeforeProps={{
                showDivider: false,
                containerStyle: { marginRight: 8, width: 'auto', paddingRight: 0 },
              }}
              editable={false}
              keyboardType="numeric"
              error={false}
              helperText=""
            />
          </View>

          {/* Expected Total Amount (calculated: Expected Volume × Expected Selling Price per Unit) */}
          <View style={s.fieldContainer}>
            <UITypography variant="medium" style={s.fieldLabel}>
              Expected Total Amount
            </UITypography>
            <View style={s.readonlyValueContainer}>
              <Text style={s.readonlyValueText}>
                {(() => {
                  const vol = parseFloat(harvest.expectedVolume);
                  const price = parseFloat(harvest.expectedSellingPricePerUnit);
                  if (isNaN(vol) || isNaN(price)) return '—';
                  return `Rs ${(
                    vol * price
                  ).toLocaleString('en-PK', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`;
                })()}
              </Text>
            </View>
          </View>

          {/* Link to farm - toggle switches (read-only) */}
          {harvest.farmLabels.length > 0 && (
            <View style={s.fieldContainer}>
              <UITypography variant="medium" style={s.fieldLabel}>
                Link to farm
              </UITypography>
              {harvest.farmLabels.map((farmLabel, idx) => (
                <View key={idx} style={s.farmRow}>
                  <UITypography variant="medium" style={s.farmLabel}>
                    {farmLabel}
                  </UITypography>
                  <UIToggleSwitch
                    value={true}
                    onToggle={() => {}}
                    labelLeft="Yes"
                    labelRight="No"
                  />
                </View>
              ))}
            </View>
          )}

          {hasLoan && (
            <View style={s.loanBanner}>
              <WarningTriangleIcon size={20} color="#F32735" />
              <View style={s.loanBannerTextWrap}>
                <UITypography variant="semiBold" style={s.loanBannerTitle}>
                  Active Loan linked to the harvest
                </UITypography>
                <UITypography variant="regular" style={s.loanBannerSubtitle}>
                  You cannot update harvest details linked to an active loan
                </UITypography>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function HarvestListScreen() {
  const navigation = useNavigation<any>();
  const { top, bottom } = useSafeAreaInsets();

  const [harvests, setHarvests] = useState<HarvestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHarvests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get('/harvest_details');
      const raw = res.data?.data;
      const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

      // Fetch farms for display labels and has_active_loan flag
      let farmMap: Record<string, string> = {};
      let farmLoanMap: Record<string, boolean> = {};
      try {
        const farmsRes = await axiosPrivate.get('/users/farms');
        const farmsRaw: any[] = farmsRes.data?.data || [];
        farmsRaw.forEach((f: any) => {
          const attrs = f.attributes || f;
          const uuid = attrs.uuid || String(f.id);
          farmMap[uuid] = formatFarmLabel(
            attrs.ghana_post_gps_number,
            attrs.address,
            uuid,
          );
          farmLoanMap[uuid] = attrs.has_active_loan === true;
        });
      } catch {
        // ignore farm fetch error
      }

      const mapped: HarvestData[] = list.map((item: any) => {
        const attrs = item.attributes || item;
        const id = String(item.id ?? attrs.id ?? Math.random());
        const farmUuids: string[] = attrs.farm_uuids ?? [];
        return {
          id,
          selectedProduce: attrs.selected_produce ?? '',
          expectedVolume: attrs.expected_volume != null ? String(attrs.expected_volume) : '',
          expectedVolumeUnit: attrs.expected_volume_unit ?? '',
          expectedSellingPricePerUnit:
            attrs.expected_selling_price_per_unit != null
              ? String(attrs.expected_selling_price_per_unit)
              : '',
          farmUuids,
          farmLabels: farmUuids.map(uuid => farmMap[uuid] || formatFarmLabel(null, null, uuid)),
          hasActiveLoan: farmUuids.some(uuid => farmLoanMap[uuid] === true),
        };
      });

      setHarvests(mapped);

      // No harvests yet — skip the list and go straight to the add screen
      if (mapped.length === 0) {
        navigation.replace('HarvestDetails', { linkedFarmUuids: [] });
        return;
      }
    } catch {
      setHarvests([]);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchHarvests();
    }, [fetchHarvests]),
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev !== id ? id : null));
  }, []);

  const handleDelete = useCallback(
    (harvest: HarvestData) => {
      Alert.alert(
        'Delete Harvest',
        'Are you sure you want to delete this harvest detail?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await axiosPrivate.delete(`/harvest_details/${harvest.id}`);
                Toast.show({
                  type: 'success',
                  text1: 'Harvest deleted successfully',
                });
                setExpandedId(null);
                fetchHarvests();
              } catch (err: any) {
                if (!err?.__handledGlobally) {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2:
                      err?.response?.data?.message ||
                      'Failed to delete harvest. Please try again.',
                  });
                }
              }
            },
          },
        ],
      );
    },
    [fetchHarvests],
  );

  const handleEdit = useCallback(
    async (harvest: HarvestData) => {
      try {
        // Fetch the full harvest detail for editing
        const res = await axiosPrivate.get(`/harvest_details/${harvest.id}`);
        const record = res.data?.data;
        const attrs = record?.attributes || record || {};

        // Collect all farm_uuids linked to OTHER harvest details
        const linkedFarmUuids = harvests
          .filter(h => h.id !== harvest.id)
          .flatMap(h => h.farmUuids);

        navigation.navigate('HarvestDetails', {
          harvest: {
            id: harvest.id,
            selected_produce: attrs.selected_produce ?? harvest.selectedProduce,
            expected_volume: attrs.expected_volume ?? harvest.expectedVolume,
            expected_volume_unit: attrs.expected_volume_unit ?? harvest.expectedVolumeUnit,
            expected_selling_price_per_unit:
              attrs.expected_selling_price_per_unit ?? harvest.expectedSellingPricePerUnit,
            farm_uuids: attrs.farm_uuids ?? harvest.farmUuids,
          },
          linkedFarmUuids,
        });
      } catch {
        // Fallback: navigate with local data
        const linkedFarmUuids = harvests
          .filter(h => h.id !== harvest.id)
          .flatMap(h => h.farmUuids);

        navigation.navigate('HarvestDetails', {
          harvest: {
            id: harvest.id,
            selected_produce: harvest.selectedProduce,
            expected_volume: harvest.expectedVolume,
            expected_volume_unit: harvest.expectedVolumeUnit,
            expected_selling_price_per_unit: harvest.expectedSellingPricePerUnit,
            farm_uuids: harvest.farmUuids,
          },
          linkedFarmUuids,
        });
      }
    },
    [harvests, navigation],
  );

  const handleAddHarvest = useCallback(() => {
    // Collect all farm_uuids currently linked across all harvest details
    const linkedFarmUuids = harvests.flatMap(h => h.farmUuids);
    navigation.navigate('HarvestDetails', { linkedFarmUuids });
  }, [harvests, navigation]);

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: top }]}>
        <LoanScreenHeader
          title="My Expected Harvest Details"
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
        title="My Expected Harvest Details"
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
            <FinancialProfileIcon bgFill="#1D3A70" borderColor="#1D3A70" iconFill="#FFFFFF" />
            <UITypography variant="semiBold" style={s.cardTitle}>
              Harvest Details
            </UITypography>
          </View>

          {harvests.length === 0 ? (
            <View style={s.emptyState}>
              <UITypography variant="regular" style={s.emptyText}>
                No harvest details found.
              </UITypography>
            </View>
          ) : (
            harvests.map(harvest => (
              <HarvestCard
                key={harvest.id}
                harvest={harvest}
                isExpanded={expandedId === harvest.id}
                onToggle={() => toggleExpand(harvest.id)}
                onDelete={() => handleDelete(harvest)}
                onEdit={() => handleEdit(harvest)}
              />
            ))
          )}
        </View>

        <TouchableOpacity
          style={s.addHarvestRow}
          activeOpacity={0.7}
          onPress={handleAddHarvest}
        >
          <View style={s.addHarvestCircle}>
            <PlusIcon size={12} color="#FFFFFF" />
          </View>
          <UITypography variant="medium" style={s.addHarvestText}>
            Add Harvest
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
  harvestCard: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
  },
  harvestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  harvestCardTitle: { fontSize: 13, color: '#101010', flex: 1 },
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
  harvestCardBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#404040',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#404040',
  },
  readonlyValueContainer: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#F2F2F2',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  readonlyValueText: { fontSize: 16, fontWeight: '600', color: '#808080' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  produceTile: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  produceTileSelected: {
    borderColor: '#099453',
    backgroundColor: '#09945310',
  },
  produceLabel: {
    fontSize: 14,
    color: '#099453',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  inlineLeft: {
    flex: 0.5,
  },
  inlineRight: {
    flex: 0.5,
  },
  farmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  farmLabel: {
    fontSize: 14,
    color: '#404040',
    flex: 1,
    marginRight: 10,
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
  addHarvestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  addHarvestCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#099453',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHarvestText: {
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
