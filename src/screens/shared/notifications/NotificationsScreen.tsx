import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { UITypography } from '@/components/ui';
import {
  NotificationItem,
  formatNotificationTime,
  notificationsService,
} from '@/services/notifications.service';
import { styles } from './NotificationsScreen.styled';

function BackArrowIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke="#101010"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NotificationIcon() {
  return (
    <Svg width="21" height="21" viewBox="0 0 21 21" fill="none">
      <Rect x="2" y="1" width="17" height="19" rx="2" stroke="#099453" strokeWidth="1.5" />
      <Path d="M6 6H15" stroke="#099453" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 10H15" stroke="#099453" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 14H11" stroke="#099453" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="15" cy="15" r="3" fill="#099453" />
      <Path d="M14 15L14.75 15.75L16.25 14.25" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <Circle cx="6" cy="6" r="5" stroke="#404040" strokeWidth="1" opacity={0.6} />
      <Path d="M6 3V6L8 7.5" stroke="#404040" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </Svg>
  );
}

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
}

function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const { attributes } = notification;
  const isUnread = !attributes.read;

  return (
    <Pressable
      style={[
        styles.notificationCard,
        isUnread ? styles.unreadCard : styles.readCard,
      ]}
      onPress={() => onPress(notification)}
    >
      <View>
        <View style={styles.iconContainer}>
          <NotificationIcon />
        </View>
        <View
          style={[
            styles.dotIndicator,
            isUnread ? styles.unreadDot : styles.readDot,
          ]}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <UITypography
            variant={isUnread ? 'bold' : 'regular'}
            style={[
              styles.notificationTitle,
              isUnread ? styles.unreadTitle : styles.readTitle,
            ]}
          >
            {attributes.title}
          </UITypography>
          <View style={styles.badge}>
            <UITypography variant="semiBold" style={styles.badgeText}>
              {isUnread ? 'Unread' : 'Read'}
            </UITypography>
          </View>
        </View>

        <UITypography variant="medium" style={styles.notificationBody} numberOfLines={2}>
          {attributes.body}
        </UITypography>

        <View style={styles.timeRow}>
          <ClockIcon />
          <UITypography variant="medium" style={styles.timeText}>
            {formatNotificationTime(attributes.time)}
          </UITypography>
        </View>
      </View>
    </Pressable>
  );
}

type FilterTab = 'all' | 'unread';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.getAll();
      setAllNotifications(response.data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await notificationsService.getAll();
      setAllNotifications(response.data);
    } catch (error) {
      console.log('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const navigateToEntity = useCallback(
    (notification: NotificationItem) => {
      const { entity_id, entity_type } = notification.attributes.metadata;
      const nav = navigation as any;

      if (entity_type === 'credit_line_request') {
        nav.navigate('ViewOffers', { submissionId: entity_id });
      } else if (entity_type === 'sale_order') {
        nav.navigate('SaleOrderDetail', { orderId: entity_id });
      }
    },
    [navigation],
  );

  const handleNotificationPress = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.attributes.read) {
        try {
          await notificationsService.markAsRead(notification.id);
          setAllNotifications(prev =>
            prev.map(n =>
              n.id === notification.id
                ? {
                    ...n,
                    attributes: {
                      ...n.attributes,
                      read: true,
                      status: 'read',
                    },
                  }
                : n,
            ),
          );
        } catch (error) {
          console.log('Error marking notification as read:', error);
        }
      }
      navigateToEntity(notification);
    },
    [navigateToEntity],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setAllNotifications(prev =>
        prev.map(n => ({
          ...n,
          attributes: { ...n.attributes, read: true, status: 'read' as const },
        })),
      );
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  }, []);

  const filteredNotifications =
    activeTab === 'unread'
      ? allNotifications.filter(n => !n.attributes.read)
      : allNotifications;

  const hasUnread = allNotifications.some(n => !n.attributes.read);
  const unreadCount = allNotifications.filter(n => !n.attributes.read).length;

  const renderItem = useCallback(
    ({ item, index }: { item: NotificationItem; index: number }) => (
      <View>
        <NotificationCard notification={item} onPress={handleNotificationPress} />
        {index < filteredNotifications.length - 1 && (
          <View style={styles.separator} />
        )}
      </View>
    ),
    [filteredNotifications.length, handleNotificationPress],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={[styles.header, { marginTop: top }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <BackArrowIcon />
        </Pressable>
        <UITypography variant="semiBold" style={styles.headerTitle}>
          Notification
        </UITypography>
        {hasUnread && (
          <Pressable
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            hitSlop={10}
          >
            <UITypography variant="medium" style={styles.markAllText}>
              Mark all read
            </UITypography>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <UITypography
            variant={activeTab === 'all' ? 'bold' : 'medium'}
            style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}
          >
            All
          </UITypography>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
          onPress={() => setActiveTab('unread')}
        >
          <UITypography
            variant={activeTab === 'unread' ? 'bold' : 'medium'}
            style={[
              styles.tabText,
              activeTab === 'unread' && styles.tabTextActive,
            ]}
          >
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </UITypography>
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#099453" />
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UITypography variant="medium" style={styles.emptyText}>
              {activeTab === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </UITypography>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#099453"
                colors={['#099453']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
