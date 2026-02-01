
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    timestamp: string; // ISO string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif_1',
        title: 'Class Reminder',
        message: 'Your "Advanced HIIT" class starts in 1 hour.',
        type: 'info',
        isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
        id: 'notif_2',
        title: 'Payment Successful',
        message: 'We successfully processed your monthly membership payment.',
        type: 'success',
        isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
        id: 'notif_3',
        title: 'New Diet Plan Available',
        message: 'Your weekly AI diet plan has been generated.',
        type: 'info',
        isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    }
];

export const getNotifications = async (): Promise<Notification[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_NOTIFICATIONS), 600));
};

export const markNotificationRead = async (_id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 300));
};

export const clearAllNotifications = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};
