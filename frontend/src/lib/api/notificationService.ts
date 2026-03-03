import api from './axios';

// Types
export interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    type: 'alert' | 'reminder' | 'system';
    createdAt: string;
}

// Real API calls
export const getNotifications = async (userId?: string): Promise<Notification[]> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/communications/notifications${params}`);
    return response.data;
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
    const response = await api.put(`/communications/notifications/${notificationId}/read`);
    return response.data;
};
