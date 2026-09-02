import React from 'react';
import { View, StatusBar, BackHandler } from 'react-native';
import { UIContainedButton, UITypography } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import MaintenanceIcon from '@/components/icons/MaintenanceIcon';
import { styles } from './MaintenanceScreen.styled';
import { useAppConfigStore } from '@/store/useAppConfigStore';

interface MaintenanceScreenProps {
  fromSplash?: boolean;
}

const MaintenanceScreen = ({ fromSplash = false }: MaintenanceScreenProps) => {
  const navigation = useNavigation();
  const appName = useAppConfigStore(state => state.appName);

  const handleClose = () => {
    if (fromSplash) {
      // If shown during splash (maintenance mode), exit the app
      BackHandler.exitApp();
    } else {
      // If shown as a regular screen, allow going back
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <MaintenanceIcon width={214} height={213} />
        </View>

        <View style={styles.titleContainer}>
          <UITypography variant="medium" style={styles.title}>
            We're Under
          </UITypography>
          <UITypography variant="medium" style={styles.title}>
            Maintenance
          </UITypography>
        </View>

        <UITypography variant="medium" style={styles.description}>
          The {appName} app is temporarily unavailable while
          we carry out essential updates.
        </UITypography>
        <UITypography variant="medium" style={styles.description}>
          Please check back shortly.
        </UITypography>
      </View>

      {!fromSplash && (
        <View style={styles.buttonContainer}>
          <UIContainedButton onPress={handleClose} style={styles.button}>
            Close
          </UIContainedButton>
        </View>
      )}
    </View>
  );
};

export default MaintenanceScreen;
