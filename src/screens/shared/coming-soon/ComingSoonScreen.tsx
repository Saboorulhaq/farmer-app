import React from 'react';
import { View, StatusBar } from 'react-native';
import { UIContainedButton, UITypography } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import MaintenanceIcon from '@/components/icons/MaintenanceIcon';
import { styles } from './ComingSoonScreen.styled';

const ComingSoonScreen = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
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
            Coming Soon
          </UITypography>
        </View>

        <UITypography variant="medium" style={styles.description}>
          This page will be updated shortly.
        </UITypography>
        <UITypography variant="medium" style={styles.description}>
          Please check back later for more information.
        </UITypography>
      </View>

      <View style={styles.buttonContainer}>
        <UIContainedButton onPress={handleGoBack} style={styles.button}>
          Go Back
        </UIContainedButton>
      </View>
    </View>
  );
};

export default ComingSoonScreen;
