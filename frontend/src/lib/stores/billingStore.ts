import { create } from 'zustand';
import {
    type Transaction,
    type StripeSessionResponse,
    getTransactions,
    createStripeSession,
} from '@/lib/api/billingService';

interface BillingState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;

    fetchBillingData: () => Promise<void>;
    startPayment: (data: { amount: number, currency: string, description: string, planId?: string }) => Promise<StripeSessionResponse>;
    downloadInvoice: (transactionId: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set) => ({
    transactions: [],
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

    downloadInvoice: async (transactionId: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Downloading invoice for transaction ${transactionId}`);
    }
}));
