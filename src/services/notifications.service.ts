import { axiosPrivate } from '@/config/axios';

export interface NotificationMetadata {
  entity_id: string;
  entity_type: string;
}

export interface NotificationAttributes {
  title: string;
  body: string;
  description: string;
  status: 'unread' | 'read';
  read: boolean;
  read_at: string | null;
  notification_type: string;
  type: string;
  metadata: NotificationMetadata;
  time: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  attributes: NotificationAttributes;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  meta: {
    total: number;
    filters: Record<string, string>;
  };
}

export function formatNotificationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return `Today, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (diffDays <= 1 && date.getDate() === yesterday.getDate()) {
    return `Yesterday, ${timeStr}`;
  }

  const day = date.getDate();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[date.getMonth()]}, ${timeStr}`;
}

export const notificationsService = {
  getAll: async (): Promise<NotificationsResponse> => {
    const response = await axiosPrivate.get<NotificationsResponse>('/notifications');
    return response.data;
  },

  getUnread: async (): Promise<NotificationsResponse> => {
    const response = await axiosPrivate.get<NotificationsResponse>('/notifications', {
      params: { 'filter[status]': 'unread' },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await axiosPrivate.post(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosPrivate.post('/notifications/read_all');
  },
};
