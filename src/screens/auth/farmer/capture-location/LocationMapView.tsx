import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { GOOGLE_MAPS_API_KEY } from '@env';

interface LocationMapViewProps {
  latitude: number;
  longitude: number;
  accuracy: number;
  style?: StyleProp<ViewStyle>;
}

// A muted map style close to the reference design (soft greys/greens, no POIs).
const MAP_STYLE = JSON.stringify([
  { elementType: 'geometry', stylers: [{ color: '#f2efe9' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9a958c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f2efe9' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#e7e3da' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#c9e6c2' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#f0eee8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#bcd6e6' }],
  },
]);

function buildHtml(
  latitude: number,
  longitude: number,
  accuracy: number,
): string {
  const safeAccuracy = Math.max(1, Math.round(accuracy || 0));
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #f2efe9; }
      #map { overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      function initMap() {
        var position = { lat: ${latitude}, lng: ${longitude} };
        var map = new google.maps.Map(document.getElementById('map'), {
          center: position,
          zoom: 16,
          disableDefaultUI: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
          clickableIcons: false,
          styles: ${MAP_STYLE}
        });

        new google.maps.Circle({
          strokeColor: '#4285F4',
          strokeOpacity: 0.35,
          strokeWeight: 1,
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          map: map,
          center: position,
          radius: ${safeAccuracy}
        });

        new google.maps.Marker({
          position: position,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#1a73e8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });
      }
    </script>
    <script async defer
      src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap"></script>
  </body>
</html>`;
}

export default function LocationMapView({
  latitude,
  longitude,
  accuracy,
  style,
}: LocationMapViewProps) {
  const html = useMemo(
    () => buildHtml(latitude, longitude, accuracy),
    [latitude, longitude, accuracy],
  );

  return (
    <View style={[styles.wrapper, style]} pointerEvents="none">
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost/' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        androidLayerType="hardware"
        setBuiltInZoomControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f2efe9',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
