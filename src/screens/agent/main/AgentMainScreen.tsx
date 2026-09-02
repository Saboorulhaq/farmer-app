import ImageOne from '@/assets/images/agent/1.png';
import ImageTwo from '@/assets/images/agent/2.png';
import ImageThree from '@/assets/images/agent/3.png';
import ImageFour from '@/assets/images/agent/4.png';
import Avatar from '@/assets/images/avatar.png';
import NotificationBellIcon from '@/components/icons/NotificationBellIcon';
import { AgentBackgroundCarousel } from '@/components/screens/agent/main/AgentBackgroundCarousel';
import { UIContainedButton, UITypography } from '@/components/ui';
import { useAgent } from '@/constants/context/agent/context';
import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, RefreshControl, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './AgentMainScreen.styled';
import { useFarmerIdCardStore } from '@/store/useFarmerIdCardStore';

const AgentMainScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const { loading, agent, refresh } = useAgent();
  const { top } = useSafeAreaInsets();
  const images = [ImageOne, ImageTwo, ImageThree, ImageFour];
  const { reset } = useFarmerIdCardStore();

  const [refreshing, setRefreshing] = useState(false);

  const handleNewFarmer = () => {
    reset();
    navigate('AgentFarmerRegistrationFlow' as never);
  };

  // ✅ Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.log('Error refreshing agent data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#099453" // spinner color for iOS
          colors={['#099453']} // spinner color for Android
        />
      }
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'light-content'}
      />
      <View style={[styles.topContainer]}>
        <AgentBackgroundCarousel images={images}>
          <View style={[styles.header, { marginTop: top }]}>
            <View style={styles.headerContent}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <View>
                    <Image source={Avatar} style={styles.avatar} />
                  </View>
                  <View>
                    <UITypography variant="regular" style={styles.hello}>
                      Hello
                    </UITypography>
                    <UITypography variant="semiBold" style={styles.name}>
                      {agent?.attributes?.name ?? 'Agent'}
                    </UITypography>
                  </View>
                </>
              )}
            </View>
            <Pressable onPress={() => navigate('Notifications' as never)} hitSlop={10}>
              <NotificationBellIcon />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centerCard}>
              <ActivityIndicator color="white" size="large" />
            </View>
          ) : !agent?.attributes.is_approved ? (
            <View style={styles.centerCard}>
              <UITypography variant="semiBold" style={styles.title}>
                Account Under Verification
              </UITypography>
              <UITypography variant="regular" style={styles.subtitle}>
                Your account request has been submitted. Verification is in
                progress.
              </UITypography>
            </View>
          ) : (
            <View style={styles.verifiedBox}>
              <UITypography variant="semiBold" style={styles.verifiedTitle}>
                Register a Farmer
              </UITypography>
              <UITypography variant="regular" style={styles.verifiedSubtitle}>
                Create and save a new farmer profile for record keeping.
              </UITypography>
              <UIContainedButton onPress={handleNewFarmer}>
                Add New Farmer
              </UIContainedButton>
              {(agent?.attributes?.farmers_count ?? 0) > 0 && (
                <Pressable
                  onPress={() => navigate('AllFarmers' as never)}
                  style={({ pressed }) => [
                    styles.viewAllFarmersBtn,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <UITypography variant="semiBold" style={styles.viewAllFarmersBtnText}>
                    View All Farmers
                  </UITypography>
                </Pressable>
              )}
            </View>
          )}
        </AgentBackgroundCarousel>
      </View>

      <View style={styles.bottomCardWrapper}>
        <View style={styles.card}>
          <View style={styles.counterBox}>
            <UITypography variant="bold" style={styles.counterNumber}>
              {String(agent?.attributes?.farmers_count ?? 0).padStart(2, '0')}
            </UITypography>
            <View style={styles.counterTextWrapper}>
              <UITypography variant="semiBold" style={styles.counterTitle}>
                Total Farmers
              </UITypography>
              <UITypography variant="regular" style={styles.counterDescription}>
                The people who have applied under your account
              </UITypography>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AgentMainScreen;
