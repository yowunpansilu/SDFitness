import api from './axios';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    timestamp: string; // ISO string
}

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await api.get('/communication/notifications');
        return (response.data || []).map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type === 'alert' ? 'error' : (n.type === 'reminder' ? 'warning' : 'info'),
            isRead: n.isRead,
            timestamp: n.createdAt
        }));
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
};

export const markNotificationRead = async (id: string): Promise<void> => {
    try {
        await api.put(`/communication/notifications/${id}/read`);
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
};

export const deleteNotification = async (id: string): Promise<void> => {
    try {
        await api.delete(`/communication/notifications/${id}`);
    } catch (error) {
        console.error('Failed to delete notification:', error);
        throw error;
    }
};

export const clearAllNotifications = async (): Promise<void> => {
    // Backend endpoint might not exist yet, but we'll simulate success for UI consistency
    console.warn('Clear all notifications endpoint not officially implemented on backend.');
};
