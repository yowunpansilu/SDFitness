import api from './axios';

// Types
export interface PaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'paypal';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    _id?: string;
}

export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'cancelled';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: TransactionStatus;
    invoiceUrl: string;
    sessionId?: string;
    bankSlipUrl?: string;
}

export interface StripeSessionResponse {
    success: boolean;
    checkoutUrl: string;
    sessionId: string;
    paymentId: string;
}

// Service
export const createStripeSession = async (data: {
    amount: number;
    currency: string;
    description: string;
    planId?: string;
}): Promise<StripeSessionResponse> => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
};

export const getPaymentById = async (paymentId: string): Promise<any> => {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
};

export const submitPayment = async (data: FormData): Promise<any> => {
    const response = await api.post('/payments/bank-slip', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        const response = await api.get('/payments');
        const payments = response.data;

        return payments.map((p: any) => ({
            id: p._id,
            date: p.createdAt,
            amount: p.currency === 'USD' ? p.amount * 300 : p.amount,
            description: p.description,
            status: p.status === 'completed' ? 'paid' : p.status,
            invoiceUrl: '#',
            sessionId: p.stripeSessionId,
            bankSlipUrl: p.bankSlipUrl
        }));
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
};

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
