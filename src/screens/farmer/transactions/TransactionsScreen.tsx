import React, { useRef, useState, useCallback } from 'react';
import { ScrollView, StatusBar, View, RefreshControl, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UITypography from '@/components/ui/typography';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ActiveRequestsSection, { ActiveRequestsSectionRef } from '@/components/screens/farmer/main/ActiveRequestsSection';
import { styles } from './TransactionsScreen.styled';

export default function TransactionsScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const activeRequestsRef = useRef<ActiveRequestsSectionRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.getParent()?.navigate('Home');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await activeRequestsRef.current?.refresh();
    } catch (error) {
      console.log('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: top + 16 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#099453"
          colors={['#099453']}
        />
      }
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeftIcon size={24} color="#101010" />
        </Pressable>
        <UITypography variant="semiBold" style={styles.title}>
          Transactions
        </UITypography>
      </View>
      <ActiveRequestsSection ref={activeRequestsRef} />
    </ScrollView>
  );
}
