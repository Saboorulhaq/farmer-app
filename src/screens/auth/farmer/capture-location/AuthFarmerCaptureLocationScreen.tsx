import AuthHeader from '@/components/layout/auth/AuthHeader';
import { UITypography } from '@/components/ui';
import {
  CapturedLocation,
  getCurrentPosition,
  reverseGeocode,
  formatAccuracy,
  formatCoordinate,
  requestLocationPermission,
  stopLocationObserving,
} from '@/services/location.service';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Toast } from 'toastify-react-native';
import LocationMapView from './LocationMapView';
import { styles } from './AuthFarmerCaptureLocationScreen.styled';

type Status = 'loading' | 'success' | 'error';

const GREEN = '#166534';

/* ----------------------------- inline icons ----------------------------- */

function PinIcon({ size = 20, color = '#166534' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 4.87 6.36 11.5 6.9 12.06.34.35.86.35 1.2 0 .54-.56 6.9-7.19 6.9-12.06C19.5 5.36 16.14 2 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
        fill={color}
      />
    </Svg>
  );
}

function PinOutlineIcon({ size = 22, color = '#166534' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.5c.4 0 .78-.16 1.06-.44C14.02 20.06 19 14.9 19 9.9 19 5.7 15.87 2.5 12 2.5S5 5.7 5 9.9c0 5 4.98 10.16 5.94 11.16.28.28.66.44 1.06.44Z"
        stroke={color}
        strokeWidth={1.6}
      />
      <Circle cx="12" cy="9.8" r="2.6" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

function TargetIcon({ size = 22, color = '#166534' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="2.2" fill={color} />
      <Line x1="12" y1="1.5" x2="12" y2="4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="19.5" x2="12" y2="22.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="1.5" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="19.5" y1="12" x2="22.5" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CopyIcon({ size = 18, color = '#9AA0A6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="9" width="11" height="11" rx="2.5" stroke={color} strokeWidth={1.6} />
      <Path
        d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5V4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5 10 17.5 19 7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BulbIcon({ size = 22, color = '#166534' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.38.9 1 .95 1.7l.05.5h5.2l.05-.5c.05-.7.45-1.32.95-1.7A6 6 0 0 0 12 3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------- helpers -------------------------------- */

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hourStr = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hourStr}:${minutes} ${period}`;
}

async function copyToClipboard(value: string) {
  try {
    // Loaded lazily so a missing native module never crashes the bundle.
    const Clipboard = require('@react-native-clipboard/clipboard').default;
    Clipboard.setString(value);
    trigger('impactLight');
    Toast.show({ type: 'success', text1: 'Copied to clipboard' });
  } catch {
    Toast.show({ type: 'error', text1: 'Unable to copy' });
  }
}

/* -------------------------------- screen -------------------------------- */

export default function AuthFarmerCaptureLocationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { top, bottom } = useSafeAreaInsets();

  const [status, setStatus] = useState<Status>('loading');
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Track mount state so async callbacks never update an unmounted component.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Reset iOS CLLocationManager so the next mount gets a clean state.
      stopLocationObserving();
    };
  }, []);

  const capture = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus('loading');
    setErrorMessage('');
    setLocation(null);

    const permission = await requestLocationPermission();
    if (!mountedRef.current) return;
    if (!permission.granted) {
      setStatus('error');
      setErrorMessage(
        permission.servicesDisabled
          ? 'Location services are disabled. Please enable GPS/location services and try again.'
          : 'Location permission is required. Please enable location access for this app in your settings and try again.',
      );
      trigger('notificationError');
      return;
    }

    try {
      // Phase 1 — GPS coordinates arrive: button becomes active immediately.
      const coords = await getCurrentPosition();
      if (!mountedRef.current) return;
      const partial: CapturedLocation = { ...coords, address: '' };
      setLocation(partial);
      setStatus('success');
      trigger('notificationSuccess');

      // Phase 2 — Reverse-geocoding runs in background; button stays active.
      setIsGeocodingAddress(true);
      try {
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        if (mountedRef.current) {
          setLocation(prev => (prev ? { ...prev, address } : prev));
        }
      } catch {
        // Address is optional; GPS coordinates are sufficient for confirmation.
      } finally {
        if (mountedRef.current) setIsGeocodingAddress(false);
      }
    } catch (error: any) {
      if (!mountedRef.current) return;
      setStatus('error');
      let message: string;
      switch (error?.code) {
        case 1:
          message =
            'Location permission was denied. Please enable location access for this app in your device settings and try again.';
          break;
        case 2:
          message =
            'Location services are disabled. Please enable GPS/location services and try again.';
          break;
        case 3:
          message =
            'It is taking too long to get your location. Move to an open area with a clear view of the sky and try again.';
          break;
        default:
          message =
            'We could not get your location. Make sure GPS is enabled and try again.';
      }
      setErrorMessage(message);
      trigger('notificationError');
    }
  }, []);

  useEffect(() => {
    capture();
  }, [capture]);

  const handleConfirm = () => {
    if (!location) return;
    const address =
      location.address ||
      `${formatCoordinate(location.latitude, 'latitude')}, ${formatCoordinate(
        location.longitude,
        'longitude',
      )}`;
    const capturedLocation: CapturedLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
      address,
    };
    const returnTo: string = route.params?.returnTo ?? 'Details';
    navigation.navigate({
      name: returnTo,
      merge: true,
      params: { capturedLocation },
    });
  };

  const isHighAccuracy = !!location && location.accuracy > 0 && location.accuracy <= 20;

  return (
    <View style={[styles.container, { paddingTop: top + 20 }]}>
      <AuthHeader title="Capture Location" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 12 }]}
      >
        {/* Info banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconCircle}>
            <PinOutlineIcon />
          </View>
          <View style={styles.bannerTextWrap}>
            <UITypography variant="semiBold" style={styles.bannerTitle}>
              We need your precise location
            </UITypography>
            <UITypography variant="regular" style={styles.bannerSubtitle}>
              Please enable GPS and allow location access for accurate capture.
            </UITypography>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapCard}>
          {location && (
            <LocationMapView
              style={styles.map}
              latitude={location.latitude}
              longitude={location.longitude}
              accuracy={location.accuracy}
            />
          )}

          {status === 'loading' && (
            <View style={styles.mapOverlayLoading}>
              <ActivityIndicator size="large" color={GREEN} />
              <UITypography variant="regular" style={styles.mapOverlayText}>
                Getting your location…
              </UITypography>
            </View>
          )}

          {status === 'success' && location && (
            <>
              <View style={styles.accuracyPill}>
                <TargetIcon size={20} color={GREEN} />
                <View style={styles.accuracyPillTextWrap}>
                  <UITypography variant="semiBold" style={styles.accuracyPillTitle}>
                    {isHighAccuracy ? 'High Accuracy' : 'Approximate'}
                  </UITypography>
                  <UITypography variant="regular" style={styles.accuracyPillSubtitle}>
                    {formatAccuracy(location.accuracy)}
                  </UITypography>
                </View>
              </View>

              <Pressable style={styles.recenterButton} onPress={capture} hitSlop={8}>
                <TargetIcon size={22} color={GREEN} />
              </Pressable>
            </>
          )}
        </View>

        {/* Captured details */}
        {status === 'success' && location && (
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsHeaderIcon}>
                <PinIcon size={20} color={GREEN} />
              </View>
              <View style={styles.detailsHeaderTextWrap}>
                <UITypography variant="semiBold" style={styles.detailsTitle}>
                  Current Location Captured
                </UITypography>
                <UITypography variant="regular" style={styles.detailsTimestamp}>
                  {formatTimestamp(location.timestamp)}
                </UITypography>
              </View>
              <View style={styles.checkBadge}>
                <CheckIcon size={14} color="#fff" />
              </View>
            </View>

            <View style={styles.detailRow}>
              <UITypography variant="regular" style={styles.detailLabel}>
                Latitude
              </UITypography>
              <View style={styles.detailValueWrap}>
                <UITypography variant="medium" style={styles.detailValue}>
                  {formatCoordinate(location.latitude, 'latitude')}
                </UITypography>
                <Pressable
                  style={styles.copyButton}
                  hitSlop={8}
                  onPress={() =>
                    copyToClipboard(formatCoordinate(location.latitude, 'latitude'))
                  }
                >
                  <CopyIcon />
                </Pressable>
              </View>
            </View>

            <View style={styles.detailRow}>
              <UITypography variant="regular" style={styles.detailLabel}>
                Longitude
              </UITypography>
              <View style={styles.detailValueWrap}>
                <UITypography variant="medium" style={styles.detailValue}>
                  {formatCoordinate(location.longitude, 'longitude')}
                </UITypography>
                <Pressable
                  style={styles.copyButton}
                  hitSlop={8}
                  onPress={() =>
                    copyToClipboard(formatCoordinate(location.longitude, 'longitude'))
                  }
                >
                  <CopyIcon />
                </Pressable>
              </View>
            </View>

            <View style={styles.detailRow}>
              <UITypography variant="regular" style={styles.detailLabel}>
                Accuracy
              </UITypography>
              <View style={styles.detailValueWrap}>
                <UITypography variant="medium" style={styles.detailValue}>
                  {formatAccuracy(location.accuracy)}
                </UITypography>
              </View>
            </View>

            <View style={styles.detailRow}>
              <UITypography variant="regular" style={styles.detailLabel}>
                Address
              </UITypography>
              {isGeocodingAddress ? (
                <View style={[styles.detailValueWrap, { alignItems: 'center' }]}>
                  <UITypography variant="regular" style={[styles.detailValue, { color: '#8B8B8B' }]}>
                    Getting address…
                  </UITypography>
                  <ActivityIndicator size="small" color={GREEN} style={{ marginLeft: 8 }} />
                </View>
              ) : !!location.address ? (
                <View style={styles.detailValueWrap}>
                  <UITypography variant="medium" style={styles.detailValue}>
                    {location.address}
                  </UITypography>
                  <Pressable
                    style={styles.copyButton}
                    hitSlop={8}
                    onPress={() => copyToClipboard(location.address)}
                  >
                    <CopyIcon />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.detailValueWrap}>
                  <UITypography variant="regular" style={[styles.detailValue, { color: '#8B8B8B' }]}>
                    Address unavailable
                  </UITypography>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Error state */}
        {status === 'error' && (
          <View style={styles.detailsCard}>
            <View style={styles.errorCard}>
              <PinOutlineIcon size={40} color="#B42318" />
              <UITypography variant="semiBold" style={styles.errorTitle}>
                Location unavailable
              </UITypography>
              <UITypography variant="regular" style={styles.errorSubtitle}>
                {errorMessage}
              </UITypography>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsIconCircle}>
            <BulbIcon />
          </View>
          <View style={styles.tipsTextWrap}>
            <UITypography variant="semiBold" style={styles.tipsTitle}>
              Tips for better accuracy
            </UITypography>
            <UITypography variant="regular" style={styles.tipsSubtitle}>
              Go to an open area, away from tall buildings and trees. Keep GPS enabled.
            </UITypography>
          </View>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={[styles.footer, { paddingBottom: bottom + (Platform.OS === 'ios' ? 8 : 16) }]}>
        {status === 'success' && !!location ? (
          <Pressable
            style={styles.confirmButton}
            onPress={handleConfirm}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
          >
            <PinIcon size={20} color="#fff" />
            <UITypography variant="semiBold" style={styles.confirmButtonText}>
              Confirm Location
            </UITypography>
          </Pressable>
        ) : (
          <View style={[styles.confirmButton, styles.confirmButtonDisabled]}>
            <PinIcon size={20} color="rgba(255,255,255,0.45)" />
            <UITypography
              variant="semiBold"
              style={[styles.confirmButtonText, { color: 'rgba(255,255,255,0.45)' }]}
            >
              Confirm Location
            </UITypography>
          </View>
        )}

        <Pressable style={styles.retakeButton} onPress={capture} hitSlop={8}>
          <UITypography variant="semiBold" style={styles.retakeText}>
            {status === 'error' ? 'Try Again' : 'Retake Location'}
          </UITypography>
        </Pressable>
      </View>
    </View>
  );
}
