import React from 'react';
import { View, ScrollView, Pressable, StatusBar, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { Toast } from 'toastify-react-native';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import BellOutlineIcon from '@/components/icons/BellOutlineIcon';
import CopyIcon from '@/components/icons/CopyIcon';
import RefreshIcon from '@/components/icons/RefreshIcon';
import MapPinIcon from '@/components/icons/MapPinIcon';
import CrosshairIcon from '@/components/icons/CrosshairIcon';
import TrackShipmentMap from './TrackShipmentMap';
import { styles, COLORS } from './index.styled';

const STEPS = ['Booked', 'Driver', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];
const ACTIVE_STEP = 0;

const SHIPMENT_ID = '#SHP-45871';
const TRACKING_ID = 'TRK-45871-PK';
const BOOKING_REF = 'BK-240825-091';

export default function ShippingStatus() {
  const navigation = useNavigation<any>();
  const { top } = useSafeAreaInsets();

  const handleCopy = (value: string) => {
    Clipboard.setString(value);
    Toast.show({ type: 'success', text1: 'Copied', text2: value });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ─── Header ─── */}
      <View style={[styles.headerWrap, { paddingTop: top }]}>
        <View style={styles.navRow}>
          <Pressable style={styles.navSide} onPress={() => navigation.goBack()} hitSlop={8}>
            <ChevronLeftIcon size={24} color={COLORS.textDark} />
          </Pressable>
          <UITypography variant="semiBold" style={styles.navTitle}>
            Track Shipment
          </UITypography>
          <View style={styles.navSide}>
            <BellOutlineIcon size={23} color={COLORS.textDark} />
          </View>
        </View>

        <View style={styles.idRow}>
          <View style={styles.idCol}>
            <UITypography variant="regular" style={styles.idLabel}>
              SHIPMENT ID
            </UITypography>
            <UITypography variant="semiBold" style={styles.idValue}>
              {SHIPMENT_ID}
            </UITypography>
          </View>
          <View style={styles.idCol}>
            <UITypography variant="regular" style={styles.idLabel}>
              TRACKING ID
            </UITypography>
            <Pressable style={styles.idValueRow} onPress={() => handleCopy(TRACKING_ID)} hitSlop={6}>
              <UITypography variant="semiBold" style={styles.idValue}>
                {TRACKING_ID}
              </UITypography>
              <CopyIcon size={14} color={COLORS.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Progress stepper ─── */}
        <View style={styles.card}>
          <View style={styles.stepperRow}>
            {STEPS.map((label, i) => {
              const isActive = i === ACTIVE_STEP;
              return (
                <View key={label} style={styles.step}>
                  <View style={styles.stepTop}>
                    <View
                      style={[styles.connector, i !== 0 && styles.connectorGrey]}
                    />
                    <View style={styles.stepCircleSlot}>
                      {isActive ? (
                        <>
                          <View style={styles.stepHalo} />
                          <View style={styles.stepActiveCircle}>
                            <View style={styles.stepActiveDot} />
                          </View>
                        </>
                      ) : (
                        <View style={styles.stepInactiveCircle} />
                      )}
                    </View>
                    <View
                      style={[styles.connector, i !== STEPS.length - 1 && styles.connectorGrey]}
                    />
                  </View>
                  <UITypography
                    variant={isActive ? 'semiBold' : 'medium'}
                    style={[styles.stepLabel, isActive && styles.stepLabelActive]}
                  >
                    {label}
                  </UITypography>
                </View>
              );
            })}
          </View>

          <View style={styles.stepperFooter}>
            <UITypography variant="semiBold" style={styles.stepperFooterTitle}>
              Booking Confirmed
            </UITypography>
            <UITypography variant="regular" style={styles.stepperFooterTime}>
              25 Aug · 08:15 AM
            </UITypography>
          </View>
          <UITypography variant="regular" style={styles.awaitingText}>
            Awaiting driver assignment
          </UITypography>
        </View>

        {/* ─── Booking confirmed status ─── */}
        <View style={styles.card}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingTitleRow}>
              <View style={styles.greenDotHalo}>
                <View style={styles.greenDot} />
              </View>
              <UITypography variant="semiBold" style={styles.bookingTitle}>
                Booking Confirmed
              </UITypography>
            </View>
            <View style={styles.scheduleBadge}>
              <UITypography variant="semiBold" style={styles.scheduleBadgeText}>
                On Schedule
              </UITypography>
            </View>
          </View>
          <UITypography variant="regular" style={styles.bookingDesc}>
            Your booking is confirmed. A driver will be assigned shortly.
          </UITypography>
          <View style={styles.cardFooterRow}>
            <Text style={styles.footerMuted}>
              <UITypography variant="regular" style={styles.footerMuted}>
                Last updated{' '}
              </UITypography>
              <UITypography variant="semiBold" style={styles.footerStrong}>
                Today, 08:15 AM
              </UITypography>
            </Text>
            <Pressable hitSlop={8}>
              <RefreshIcon size={17} color={COLORS.textGreen} />
            </Pressable>
          </View>
        </View>

        {/* ─── Map ─── */}
        <View style={styles.mapCard}>
          <View style={styles.mapWrap}>
            <TrackShipmentMap height={186} />
            <View style={[styles.mapLabel, { left: 12, top: 10 }]}>
              <UITypography variant="semiBold" style={styles.mapLabelText}>
                FAISALABAD
              </UITypography>
            </View>
            <View style={[styles.mapLabel, { right: 12, bottom: 43 }]}>
              <UITypography variant="semiBold" style={styles.mapLabelText}>
                MULTAN
              </UITypography>
            </View>
            <Pressable style={styles.crosshairBtn} hitSlop={6}>
              <CrosshairIcon size={16} color={COLORS.textDark} />
            </Pressable>
            <View style={styles.dispatchPill}>
              <View style={styles.dispatchDot} />
              <UITypography variant="semiBold" style={styles.dispatchText}>
                Awaiting dispatch
              </UITypography>
            </View>
          </View>

          <View style={styles.mapDetails}>
            <View style={styles.mapAddressRow}>
              <View style={{ paddingTop: 2 }}>
                <MapPinIcon size={16} color={COLORS.textGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <UITypography variant="semiBold" style={styles.mapAddressTitle}>
                  Punjab Warehouse Yard, Sargodha Road
                </UITypography>
                <UITypography variant="regular" style={styles.mapAddressSub}>
                  Faisalabad, Punjab · pickup point
                </UITypography>
              </View>
            </View>
            <View style={styles.gpsRow}>
              <UITypography variant="regular" style={styles.gpsLabel}>
                PICKUP GPS COORDINATES
              </UITypography>
              <UITypography variant="semiBold" style={styles.gpsValue}>
                31.4180° N, 73.0790° E
              </UITypography>
            </View>
          </View>
        </View>

        {/* ─── Route ─── */}
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeCol}>
              <UITypography variant="regular" style={styles.routeSmallLabel}>
                FROM
              </UITypography>
              <UITypography variant="semiBold" style={styles.routeCity}>
                Faisalabad
              </UITypography>
              <UITypography variant="regular" style={styles.routeRegion}>
                Punjab
              </UITypography>
            </View>

            <View style={styles.routeMiddle}>
              <View style={styles.routeBarRow}>
                <View style={styles.routeBarDot} />
                <View style={styles.routeBarFilled} />
                <View style={styles.routeBarRemaining} />
                <View style={styles.routeBarEnd} />
              </View>
              <UITypography variant="medium" style={styles.routePercent}>
                0% COMPLETE
              </UITypography>
            </View>

            <View style={[styles.routeCol, styles.routeColRight]}>
              <UITypography variant="regular" style={[styles.routeSmallLabel, { textAlign: 'right' }]}>
                TO
              </UITypography>
              <UITypography variant="semiBold" style={[styles.routeCity, { textAlign: 'right' }]}>
                Multan
              </UITypography>
              <UITypography variant="regular" style={[styles.routeRegion, { textAlign: 'right' }]}>
                Punjab
              </UITypography>
            </View>
          </View>

          <View style={styles.routeFooter}>
            <MapPinIcon size={16} color={COLORS.textGreen} />
            <Text>
              <UITypography variant="regular" style={styles.footerMuted}>
                Current location{' '}
              </UITypography>
              <UITypography variant="semiBold" style={styles.footerStrong}>
                Not dispatched
              </UITypography>
            </Text>
          </View>
        </View>

        {/* ─── ETA ─── */}
        <View style={styles.card}>
          <View style={styles.etaRow}>
            <View style={styles.etaCol}>
              <UITypography variant="regular" style={styles.etaLabel}>
                Estimated arrival
              </UITypography>
              <UITypography variant="semiBold" style={styles.etaValue}>
                —
              </UITypography>
            </View>
            <View style={styles.etaDivider} />
            <View style={styles.etaCol}>
              <UITypography variant="regular" style={styles.etaLabel}>
                Delivery date
              </UITypography>
              <UITypography variant="semiBold" style={styles.etaValue}>
                26 Aug
              </UITypography>
            </View>
            <View style={styles.etaDivider} />
            <View style={styles.etaCol}>
              <UITypography variant="regular" style={styles.etaLabel}>
                Distance
              </UITypography>
              <UITypography variant="semiBold" style={styles.etaValue}>
                412 km
              </UITypography>
            </View>
          </View>
          <View style={styles.etaPill}>
            <Text>
              <UITypography variant="regular" style={styles.footerMuted}>
                Pickup scheduled{' '}
              </UITypography>
              <UITypography variant="semiBold" style={styles.footerStrong}>
                25 Aug, 08:00–10:00 AM
              </UITypography>
            </Text>
          </View>
        </View>

        {/* ─── Shipment details ─── */}
        <View style={styles.card}>
          <UITypography variant="semiBold" style={styles.sectionTitle}>
            Shipment Details
          </UITypography>
          {[
            ['Commodity', 'Wheat'],
            ['Quantity', '50 Metric Tons'],
            ['Pickup date', '25 Aug 2026'],
            ['Pickup window', '08:00–10:00 AM'],
            ['Delivery date', '26 Aug 2026'],
            ['Delivery window', 'Before 06:00 PM'],
          ].map(([label, value], i, arr) => (
            <View
              key={label}
              style={[styles.detailRow, i === arr.length - 1 && styles.detailRowLast]}
            >
              <UITypography variant="regular" style={styles.detailLabel}>
                {label}
              </UITypography>
              <UITypography variant="semiBold" style={styles.detailValue}>
                {value}
              </UITypography>
            </View>
          ))}
        </View>

        {/* ─── Reference ─── */}
        <View style={styles.card}>
          <UITypography variant="semiBold" style={styles.sectionTitle}>
            Reference
          </UITypography>
          {[
            ['Tracking ID', TRACKING_ID],
            ['Shipment ID', SHIPMENT_ID],
            ['Booking reference', BOOKING_REF],
          ].map(([label, value], i, arr) => (
            <View
              key={label}
              style={[styles.detailRow, i === arr.length - 1 && styles.detailRowLast]}
            >
              <UITypography variant="regular" style={styles.detailLabel}>
                {label}
              </UITypography>
              <Pressable style={styles.detailValueRow} onPress={() => handleCopy(value)} hitSlop={6}>
                <UITypography variant="semiBold" style={styles.detailValue}>
                  {value}
                </UITypography>
                <CopyIcon size={14} color={COLORS.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* ─── Contact support ─── */}
        <Pressable
          style={styles.contactButton}
          onPress={() => {}}
        >
          <UITypography variant="semiBold" style={styles.contactButtonText}>
            Contact Support
          </UITypography>
        </Pressable>
      </ScrollView>
    </View>
  );
}
