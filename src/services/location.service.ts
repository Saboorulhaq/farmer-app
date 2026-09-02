import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@env';

export interface CapturedCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface CapturedLocation extends CapturedCoordinates {
  address: string;
}

let isConfigured = false;

// Configure the native module lazily (never at import time) so a not-yet-linked
// module can't crash the app at startup. Permissions are requested explicitly
// below so we can surface a friendly UI when access is denied.
function ensureConfigured() {
  if (isConfigured) return;
  try {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: true,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });
  } catch {
    // No-op: getCurrentPosition will surface a proper error if unavailable.
  }
  isConfigured = true;
}

// Cached within the app session. Once the user grants location permission we
// skip the native requestAuthorization call on subsequent visits — on iOS the
// shared CLLocationManager does not fire its delegate again when authorization
// status has not changed, which causes the Promise to hang forever.
let _locationPermissionGranted = false;

export interface LocationPermissionResult {
  granted: boolean;
  // True when location services are switched off at the system level (GPS
  // toggle off), as opposed to the app's own permission being denied.
  servicesDisabled: boolean;
}

// iOS: when Location Services are disabled in the system settings, the
// CLLocationManager never invokes its authorization delegate, so
// requestAuthorization's callbacks never fire. Fall back after this delay
// instead of hanging forever.
const IOS_AUTHORIZATION_TIMEOUT = 8000;

/**
 * Request foreground location permission from the OS.
 */
export async function requestLocationPermission(): Promise<LocationPermissionResult> {
  ensureConfigured();

  // Fast-path: permission was already confirmed this session.
  if (_locationPermissionGranted) {
    return { granted: true, servicesDisabled: false };
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission',
          message:
            'We need your precise location to capture your farm coordinates.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        _locationPermissionGranted = true;
        return { granted: true, servicesDisabled: false };
      }
      return { granted: false, servicesDisabled: false };
    } catch {
      return { granted: false, servicesDisabled: false };
    }
  }

  // iOS: the plist string (NSLocationWhenInUseUsageDescription) is already set.
  // requestAuthorization can silently hang on repeat calls when permission is
  // already determined and the CLLocationManager delegate is never re-invoked.
  return new Promise<LocationPermissionResult>(resolve => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const finish = (result: LocationPermissionResult) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(result);
    };

    // Safety net: if the native delegate never fires (location services are
    // disabled), resolve as "services disabled" instead of hanging.
    timeoutId = setTimeout(() => {
      finish({ granted: false, servicesDisabled: true });
    }, IOS_AUTHORIZATION_TIMEOUT);

    try {
      Geolocation.requestAuthorization(
        () => {
          _locationPermissionGranted = true;
          finish({ granted: true, servicesDisabled: false });
        },
        (error: any) => {
          // Code 2 (POSITION_UNAVAILABLE) maps to kCLAuthorizationStatusRestricted,
          // i.e. Location Services are switched off at the system level.
          const servicesDisabled = error?.code === 2;
          finish({ granted: false, servicesDisabled });
        },
      );
    } catch {
      finish({ granted: false, servicesDisabled: false });
    }
  });
}

/**
 * Read the device's current position.
 *
 * Strategy:
 *  1. Try high-accuracy GPS (requires GPS hardware active and FINE_LOCATION).
 *  2. If the hardware is unavailable or times out (error code 2 or 3 — common on
 *     physical devices with GPS disabled or in battery-saving mode), retry with
 *     network/cell-tower location (enableHighAccuracy: false, COARSE_LOCATION).
 */
export function getCurrentPosition(): Promise<CapturedCoordinates> {
  return new Promise<CapturedCoordinates>((resolve, reject) => {
    ensureConfigured();

    const toCoords = (position: any): CapturedCoordinates => ({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? 999,
      timestamp: position.timestamp ?? Date.now(),
    });

    // First attempt — GPS hardware (high accuracy).
    Geolocation.getCurrentPosition(
      position => resolve(toCoords(position)),
      highAccuracyError => {
        // Error 2 = POSITION_UNAVAILABLE (GPS off / no hardware signal)
        // Error 3 = TIMEOUT (GPS hardware too slow to get a fix)
        // Both can happen on physical devices — fall back to network location.
        if (highAccuracyError.code === 2 || highAccuracyError.code === 3) {
          Geolocation.getCurrentPosition(
            position => resolve(toCoords(position)),
            networkError => reject(networkError),
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 60000,
            },
          );
        } else {
          reject(highAccuracyError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

/**
 * Reverse-geocode coordinates into a human readable address.
 *
 * Strategy:
 *  1. Try the Google Geocoding REST API (needs Geocoding API enabled on the key).
 *  2. Fall back to OpenStreetMap Nominatim (free, no key required) if Google
 *     returns an error, is not configured, or the network call fails.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  // --- Google Geocoding API ---
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url =
        'https://maps.googleapis.com/maps/api/geocode/json' +
        `?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data?.status === 'OK' && Array.isArray(data.results) && data.results.length) {
        return data.results[0].formatted_address ?? '';
      }
      // Surface the API error so it is visible during development.
      console.warn(
        '[reverseGeocode] Google API returned status:',
        data?.status,
        data?.error_message ?? '',
      );
    } catch (err) {
      console.warn('[reverseGeocode] Google API fetch error:', err);
    }
  }

  // --- OpenStreetMap Nominatim fallback ---
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'FaureeGhanaRN/1.0' },
    });
    const data = await response.json();

    if (data?.display_name) {
      return data.display_name as string;
    }
  } catch (err) {
    console.warn('[reverseGeocode] Nominatim fallback error:', err);
  }

  return '';
}

/**
 * Capture the current location and resolve its address in one call.
 */
export async function captureCurrentLocation(): Promise<CapturedLocation> {
  const coords = await getCurrentPosition();
  const address = await reverseGeocode(coords.latitude, coords.longitude);
  return { ...coords, address };
}

/**
 * Format a decimal latitude/longitude into a display string with hemisphere,
 * e.g. 6.524379 -> "6.524379° N".
 */
export function formatCoordinate(
  value: number,
  type: 'latitude' | 'longitude',
): string {
  const hemisphere =
    type === 'latitude'
      ? value >= 0
        ? 'N'
        : 'S'
      : value >= 0
      ? 'E'
      : 'W';
  return `${Math.abs(value).toFixed(6)}\u00B0 ${hemisphere}`;
}

/**
 * Format an accuracy value (in meters) into a display string, e.g. "\u00B1 5 meters".
 */
export function formatAccuracy(accuracy: number): string {
  return `\u00B1 ${Math.max(1, Math.round(accuracy))} meters`;
}

/**
 * Stop the native location manager and cancel any pending requests.
 * Call this in a component's unmount cleanup to ensure CLLocationManager (iOS)
 * is reset to a clean state before the next mount reuses it.
 */
export function stopLocationObserving(): void {
  try {
    Geolocation.stopObserving();
  } catch {
    // No-op — ignore if the native module isn't ready.
  }
}
