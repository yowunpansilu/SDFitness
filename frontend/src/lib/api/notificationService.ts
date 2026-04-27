import api from './axios';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string; // ISO string
    relatedId?: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

export const clearAllNotifications = async (): Promise<void> => {
    await api.delete('/notifications');
};
