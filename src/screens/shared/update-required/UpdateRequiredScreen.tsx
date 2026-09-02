import React from 'react';
import { View, StatusBar } from 'react-native';
import { UITypography } from '@/components/ui';
import UpdateIcon from '@/components/icons/UpdateIcon';
import { styles } from './UpdateRequiredScreen.styled';
import { useAppConfigStore } from '@/store/useAppConfigStore';

const UpdateRequiredScreen = () => {
  const appName = useAppConfigStore(state => state.appName);
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <UpdateIcon width={36} height={36} />
        </View>

        <View style={styles.titleContainer}>
          <UITypography variant="medium" style={styles.title}>
            Update Required
          </UITypography>
        </View>

        <UITypography variant="medium" style={styles.description}>
          A new version of the {appName} app is available.
        </UITypography>
        <UITypography variant="medium" style={styles.description}>
          Please update the app to continue using all features and services.
        </UITypography>
      </View>
    </View>
  );
};

export default UpdateRequiredScreen;
