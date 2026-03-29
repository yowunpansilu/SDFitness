import api from './axios';
import { useAuthStore } from '../stores/authStore';

// Types
export interface PaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'paypal';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    _id?: string; // MongoDB ID
}

export type TransactionStatus = 'paid' | 'pending' | 'failed';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: TransactionStatus;
    invoiceUrl: string;
}

export interface BillingSummary {
    nextBillingDate: string;
    nextBillingAmount: number;
    currency: string;
}

// Service
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id;
    if (!userId) return [];

    try {
        const response = await api.get(`/membership/payment-methods/${userId}`);
        return response.data.map((m: any) => ({
            ...m,
            id: m._id || m.id
        }));
    } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        return [];
    }
};

export const getTransactions = async (): Promise<Transaction[]> => {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id;
    try {
        const response = await api.get('/membership/subscriptions', {
            params: { userId }
        });
        const subscriptions = response.data;
        
        return subscriptions.map((sub: any) => ({
            id: sub._id,
            date: sub.startDate || sub.createdAt,
            amount: sub.plan?.price || 0,
            description: `${sub.plan?.name || 'Membership'} Subscription`,
            status: sub.status === 'active' ? 'paid' : 'failed',
            invoiceUrl: '#'
        }));
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
};

export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id;
    if (!userId) throw new Error('Authentication session not found. Please log in again.');

    const response = await api.post('/membership/payment-methods', {
        ...method,
        userId
    });
    
    return {
        ...response.data,
        id: response.data._id || response.data.id
    };
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id;
    if (!userId) throw new Error('Authentication session not found.');

    await api.delete(`/membership/payment-methods/${userId}/${id}`);
};

export const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id;
    if (!userId) throw new Error('Authentication session not found.');

    await api.put(`/membership/payment-methods/${userId}/${id}/default`);
};
