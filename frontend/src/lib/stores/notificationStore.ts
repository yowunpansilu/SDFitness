import { create } from 'zustand';
import {
    type Notification,
    getNotifications,
    markNotificationRead,
    clearAllNotifications
} from '@/lib/api/notificationService';
import { produce } from 'immer';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const data = await getNotifications();
            set({
                notifications: data,
                unreadCount: data.filter(n => !n.isRead).length,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        // Optimistic update
        set(produce((state: NotificationState) => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount -= 1;
            }
        }));

        try {
            await markNotificationRead(id);
        } catch (error) {
            // Revert if failed (omitted for simplicity in this mock)
        }
    },

    markAllAsRead: async () => {
        set(produce((state: NotificationState) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        }));
        // In real app, call API
    },

    clearAll: async () => {
        set({ notifications: [], unreadCount: 0 });
        await clearAllNotifications();
    }
}));
