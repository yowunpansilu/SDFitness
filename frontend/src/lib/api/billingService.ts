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

export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'cancelled';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: TransactionStatus;
    invoiceUrl: string;
    orderId?: string;
}

export interface PayhereInitResponse {
    success: boolean;
    checkoutUrl: string;
    formData: {
        merchant_id: string;
        return_url: string;
        cancel_url: string;
        notify_url: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
        order_id: string;
        items: string;
        currency: string;
        amount: number;
        hash: string;
    };
}

// Service
export const initiatePayherePayment = async (data: {
    amount: number;
    currency: string;
    description: string;
    planId?: string;
}): Promise<PayhereInitResponse> => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
};

export const getPaymentByOrderId = async (orderId: string): Promise<any> => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
};

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
    try {
        const response = await api.get('/payments');
        const payments = response.data;
        
        return payments.map((p: any) => ({
            id: p._id,
            date: p.createdAt,
            amount: p.amount,
            description: p.description,
            status: p.status === 'completed' ? 'paid' : p.status,
            invoiceUrl: '#',
            orderId: p.orderId
        }));
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
};

// ... other existing methods remain same or can be removed if strictly using PayHere

export const recordAdminPayment = async (data: {
    memberId: string;
    amount: number;
    currency: string;
    method: string;
    description?: string;
    planId?: string;
    transactionId?: string;
}): Promise<any> => {
    const response = await api.post('/payments/admin-record', data);
    return response.data;
};
