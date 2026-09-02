import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { axiosPrivate } from '@/config/axios';
import { UIContainedButton, UITypography } from '@/components/ui';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import EmailIcon from '@/components/icons/EmailIcon';
import LocationIcon from '@/components/icons/LocationIcon';
import PersonIcon from '@/components/icons/PersonIcon';
import { styles } from './FarmerDetailScreen.styled';

type FarmerDetailParams = {
  FarmerDetail: { farmerId: number };
};

type FarmerData = {
  id: string;
  type: string;
  attributes: {
    id: number;
    email: string;
    country_code: string;
    status: string;
    name: string;
    ghana_card_number: string;
    phone_number: string;
    ghana_post_gps_number: string;
    address: string | null;
    residence_address: string | null;
    date_of_birth: string;
    gender: string;
    nationality: string;
    created_at: string;
    farm_profile: {
      owns_farm: string;
      farm_size: number;
      farm_size_unit: string;
      primary_crop: string;
      secondary_crop: string;
      address: string;
    } | null;
    farms: Array<{
      uuid: string;
      owns_farm: string;
      farm_size: number;
      farm_size_unit: string;
      primary_crop: string;
      secondary_crop: string;
      ghana_post_gps_number: string;
      address: string;
    }>;
    registration_status: {
      otp_verified: boolean;
      pin_set: boolean;
      farm_details_completed: boolean;
      terms_accepted: boolean;
      registration_complete: boolean;
      farms_count: number;
    };
  };
};

const FarmerDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FarmerDetailParams, 'FarmerDetail'>>();
  const { farmerId } = route.params;
  const { top } = useSafeAreaInsets();

  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosPrivate.get(`/agents/farmers/${farmerId}`);
      setFarmer(res.data?.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load farmer details.');
      console.warn('Error fetching farmer:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    fetchFarmer();
  }, [fetchFarmer]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#099453" />
      </View>
    );
  }

  if (error || !farmer) {
    return (
      <View style={[styles.container, styles.centered]}>
        <UITypography variant="regular" style={styles.errorText}>
          {error ?? 'Farmer not found.'}
        </UITypography>
        <UIContainedButton onPress={fetchFarmer}>Retry</UIContainedButton>
      </View>
    );
  }

  const a = farmer.attributes;
  const reg = a.registration_status;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Green header + profile card overlap */}
        <View style={[styles.headerBg, { paddingTop: top + 8 }]}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
              <ChevronLeftIcon size={24} color="#fff" />
            </Pressable>
            <UITypography variant="semiBold" style={styles.headerTitle}>
              Farmer Details
            </UITypography>
          </View>

          {/* Profile Card sits at bottom of green area */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <UITypography variant="semiBold" style={styles.avatarInitials}>
                {getInitials(a.name)}
              </UITypography>
            </View>
            <UITypography variant="semiBold" style={styles.profileName}>
              {a.name}
            </UITypography>
            <UITypography
              variant="medium"
              style={[styles.profileStatus, a.status === 'Active' ? styles.statusActive : styles.statusInactive]}
            >
              {a.status}
            </UITypography>
            <UITypography variant="regular" style={styles.profileDate}>
              Registered {formatDate(a.created_at)}
            </UITypography>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <UITypography variant="semiBold" style={styles.sectionTitle}>
            Personal Information
          </UITypography>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <PhoneIcon size={16} color="#099453" />
            </View>
            <View style={styles.rowContent}>
              <UITypography variant="regular" style={styles.rowLabel}>Phone</UITypography>
              <UITypography variant="medium" style={styles.rowValue}>{a.phone_number}</UITypography>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <EmailIcon size={16} color="#099453" />
            </View>
            <View style={styles.rowContent}>
              <UITypography variant="regular" style={styles.rowLabel}>Email</UITypography>
              <UITypography variant="medium" style={styles.rowValue}>{a.email || 'N/A'}</UITypography>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <UITypography variant="semiBold" style={{ fontSize: 10, color: '#099453' }}>ID</UITypography>
            </View>
            <View style={styles.rowContent}>
              <UITypography variant="regular" style={styles.rowLabel}>NADRA ID</UITypography>
              <UITypography variant="medium" style={styles.rowValue}>{a.ghana_card_number}</UITypography>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <LocationIcon size={16} color="#099453" />
            </View>
            <View style={styles.rowContent}>
              <UITypography variant="regular" style={styles.rowLabel}>GPS Number</UITypography>
              <UITypography variant="medium" style={styles.rowValue}>{a.ghana_post_gps_number || 'N/A'}</UITypography>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <PersonIcon size={16} color="#099453" />
            </View>
            <View style={styles.rowContent}>
              <UITypography variant="regular" style={styles.rowLabel}>Gender / DOB / Nationality</UITypography>
              <UITypography variant="medium" style={styles.rowValue}>
                {a.gender !== 'NA' ? a.gender : '–'}  ·  {a.date_of_birth !== 'NA' ? a.date_of_birth : '–'}  ·  {a.nationality !== 'NA' ? a.nationality : '–'}
              </UITypography>
            </View>
          </View>

          {a.address && (
            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.iconCircle}>
                <LocationIcon size={16} color="#099453" />
              </View>
              <View style={styles.rowContent}>
                <UITypography variant="regular" style={styles.rowLabel}>Address</UITypography>
                <UITypography variant="medium" style={styles.rowValue}>{a.address}</UITypography>
              </View>
            </View>
          )}
        </View>

        {/* Farms */}
        {a.farms && a.farms.length > 0 && (
          <View style={styles.section}>
            <UITypography variant="semiBold" style={styles.sectionTitle}>
              Farms ({a.farms.length})
            </UITypography>
            {a.farms.map((farm, i) => (
              <View key={farm.uuid} style={[styles.farmCard, i === a.farms.length - 1 && styles.farmCardLast]}>
                <View style={styles.farmRow}>
                  <UITypography variant="regular" style={styles.farmLabel}>Ownership</UITypography>
                  <UITypography variant="medium" style={styles.farmValue}>{farm.owns_farm}</UITypography>
                </View>
                <View style={styles.farmRow}>
                  <UITypography variant="regular" style={styles.farmLabel}>Size</UITypography>
                  <UITypography variant="medium" style={styles.farmValue}>
                    {farm.farm_size} {farm.farm_size_unit}
                  </UITypography>
                </View>
                <View style={styles.farmRow}>
                  <UITypography variant="regular" style={styles.farmLabel}>Primary Crop</UITypography>
                  <UITypography variant="medium" style={styles.farmValue}>{farm.primary_crop}</UITypography>
                </View>
                {farm.secondary_crop && (
                  <View style={styles.farmRow}>
                    <UITypography variant="regular" style={styles.farmLabel}>Secondary Crop</UITypography>
                    <UITypography variant="medium" style={styles.farmValue}>{farm.secondary_crop}</UITypography>
                  </View>
                )}
                <View style={styles.farmRow}>
                  <UITypography variant="regular" style={styles.farmLabel}>GPS</UITypography>
                  <UITypography variant="medium" style={styles.farmValue}>{farm.ghana_post_gps_number}</UITypography>
                </View>
                {farm.address && (
                  <View style={[styles.farmRow, { marginBottom: 0 }]}>
                    <UITypography variant="regular" style={styles.farmLabel}>Address</UITypography>
                    <UITypography variant="medium" style={styles.farmValue}>{farm.address}</UITypography>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Registration Status */}
        <View style={styles.section}>
          <UITypography variant="semiBold" style={styles.sectionTitle}>
            Registration Status
          </UITypography>
          <View style={styles.regGrid}>
            {[
              { label: 'OTP Verified', value: reg.otp_verified },
              { label: 'PIN Set', value: reg.pin_set },
              { label: 'Farm Details', value: reg.farm_details_completed },
              { label: 'Terms Accepted', value: reg.terms_accepted },
              { label: 'Registration', value: reg.registration_complete },
            ].map(item => (
              <View key={item.label} style={styles.regItem}>
                <View style={[styles.regDot, item.value ? styles.regDotTrue : styles.regDotFalse]} />
                <UITypography variant="regular" style={styles.regLabel}>
                  {item.label}
                </UITypography>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmerDetailScreen;
