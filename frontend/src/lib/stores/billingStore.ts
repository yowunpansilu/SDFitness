import { create } from 'zustand';
import {
    type Transaction,
    type StripeSessionResponse,
    getTransactions,
    createStripeSession,
    submitPayment as submitPaymentApi,
} from '@/lib/api/billingService';

interface BillingState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    paymentMethods: any[];

    fetchBillingData: () => Promise<void>;
    addNewPaymentMethod: (data: any) => Promise<void>;
    removePaymentMethod: (id: string) => Promise<void>;
    setAsDefault: (id: string) => Promise<void>;
    startPayment: (data: { amount: number, currency: string, description: string, planId?: string }) => Promise<StripeSessionResponse>;
    submitPayment: (data: FormData) => Promise<any>;
    downloadInvoice: (transactionId: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set) => ({
    transactions: [],
    paymentMethods: [],
    isLoading: false,
    error: null,

    fetchBillingData: async () => {
        set({ isLoading: true, error: null });
        try {
            const txs = await getTransactions();
            set({ transactions: txs, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to fetch billing information', isLoading: false });
        }
    },

    startPayment: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await createStripeSession(data);
            set({ isLoading: false });
            return res;
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Failed to initiate payment';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    submitPayment: async (data: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await submitPaymentApi(data);
            set({ isLoading: false });
            return res;
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Failed to submit payment';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    downloadInvoice: async (transactionId: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Downloading invoice for transaction ${transactionId}`);
    },

    addNewPaymentMethod: async (data: any) => {
        console.log('Adding payment method', data);
        set(state => ({
            paymentMethods: [...state.paymentMethods, { ...data, id: Math.random().toString() }]
        }));
    },

    removePaymentMethod: async (id: string) => {
        set(state => ({
            paymentMethods: state.paymentMethods.filter(m => m.id !== id)
        }));
    },

    setAsDefault: async (id: string) => {
        set(state => ({
            paymentMethods: state.paymentMethods.map(m => ({
                ...m,
                isDefault: m.id === id
            }))
        }));
    }
}));
