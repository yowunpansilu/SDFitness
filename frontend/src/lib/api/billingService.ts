import api from './axios';

// Types
export interface PaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'paypal';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
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

// API Functions — try real endpoints, fall back gracefully
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        const res = await api.get('/billing/payment-methods');
        return res.data;
    } catch {
        // Billing module not yet implemented in backend — return empty
        return [];
    }
};

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        const res = await api.get('/billing/transactions');
        return res.data;
    } catch {
        // Billing module not yet implemented in backend — return empty
        return [];
    }
};

export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    const res = await api.post('/billing/payment-methods', method);
    return res.data;
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
    await api.delete(`/billing/payment-methods/${id}`);
};

export const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    await api.patch(`/billing/payment-methods/${id}/default`);
};
