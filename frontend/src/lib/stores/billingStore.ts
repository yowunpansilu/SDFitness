import { create } from 'zustand';
import {
    type PaymentMethod,
    type Transaction,
    getPaymentMethods,
    getTransactions,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
} from '@/lib/api/billingService';
import { produce } from 'immer';

interface BillingState {
    paymentMethods: PaymentMethod[];
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;

    fetchBillingData: () => Promise<void>;
    addNewPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
    removePaymentMethod: (id: string) => Promise<void>;
    setAsDefault: (id: string) => Promise<void>;
    downloadInvoice: (transactionId: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set) => ({
    paymentMethods: [],
    transactions: [],
    isLoading: false,
    error: null,

    fetchBillingData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [methods, txs] = await Promise.all([
                getPaymentMethods(),
                getTransactions()
            ]);
            set({
                paymentMethods: methods,
                transactions: txs,
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to fetch billing information', isLoading: false });
        }
    },

    addNewPaymentMethod: async (method) => {
        set({ isLoading: true, error: null });
        try {
            const newMethod = await addPaymentMethod(method);
            set(produce((state: BillingState) => {
                state.paymentMethods.push(newMethod);
                // If it's the default, uncheck others. If it's the first one, make it default.
                if (method.isDefault || state.paymentMethods.length === 1) {
                    state.paymentMethods.forEach(pm => {
                        pm.isDefault = pm.id === newMethod.id;
                    });
                }
                state.isLoading = false;
            }));
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Failed to add payment method';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    removePaymentMethod: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deletePaymentMethod(id);
            set(produce((state: BillingState) => {
                state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== id);
                state.isLoading = false;
            }));
        } catch (err) {
            set({ error: 'Failed to remove payment method', isLoading: false });
            throw err;
        }
    },

    setAsDefault: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await setDefaultPaymentMethod(id);
            set(produce((state: BillingState) => {
                state.paymentMethods.forEach(pm => {
                    pm.isDefault = pm.id === id;
                });
                state.isLoading = false;
            }));
        } catch (err) {
            set({ error: 'Failed to update default payment method', isLoading: false });
            throw err;
        }
    },

    downloadInvoice: async (transactionId: string) => {
        // Simulating download delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real app, this would trigger a file download
        console.log(`Downloading invoice for transaction ${transactionId}`);
    }
}));
