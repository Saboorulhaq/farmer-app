import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import Navigation from './src/navigation';
import { DefaultTheme } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {SENTRY_DNS} from '@env';
// import { isDeveloperModeEnabled } from './src/util/developerMode';

// Import app config store - this auto-fetches UI feature toggles on app start
import './src/store/useAppConfigStore';

Sentry.init({
    dsn: SENTRY_DNS,
    enableAutoSessionTracking: true,
    enableCaptureFailedRequests: true,
});

const blockedStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#E53935',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#404040',
    textAlign: 'center',
    lineHeight: 22,
  },
});

function App(): React.JSX.Element {
  const theme = DefaultTheme;
  // const [devModeBlocked, setDevModeBlocked] = useState(false);
  // const [checked, setChecked] = useState(false);

  // useEffect(() => {
  //   isDeveloperModeEnabled().then(enabled => {
  //     setDevModeBlocked(enabled);
  //     setChecked(true);
  //   });
  // }, []);

  // if (!checked) {
  //   return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  // }

  // if (devModeBlocked) {
  //   return (
  //     <View style={blockedStyles.container}>
  //       <Text style={blockedStyles.title}>Developer Mode Detected</Text>
  //       <Text style={blockedStyles.message}>
  //         For security reasons, this app cannot be used while Developer Mode is enabled on your device. Please disable Developer Mode in your device settings and restart the app.
  //       </Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaProvider>
      <Navigation
        theme={theme}
        linking={{
          enabled: 'auto',
          prefixes: ['faureeghana://'],
        }}
      />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
