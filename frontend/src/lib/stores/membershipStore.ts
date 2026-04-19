import { create } from 'zustand';
import {
    type MembershipPlan,
    type UserMembership,
    type UsageStats,
    getPlans,
    getCurrentMembership,
    getUsageStats,
    initiatePlanPayment,
    cancelMembership,
    freezeMembership,
} from '../api/membershipService';

interface MembershipState {
    plans: MembershipPlan[];
    currentMembership: UserMembership | null;
    usageStats: UsageStats | null;
    isLoading: boolean;
    error: string | null;
    paymentData: { checkoutUrl: string; orderId: string; formData: Record<string, string> } | null;

    fetchPlans: () => Promise<void>;
    fetchMembershipData: () => Promise<void>;
    startPlanPayment: (planId: string) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    freezeSubscription: (resumeDate: Date) => Promise<void>;
    clearPaymentData: () => void;
}

export const useMembershipStore = create<MembershipState>((set, get) => ({
    plans: [],
    currentMembership: null,
    usageStats: null,
    isLoading: false,
    error: null,
    paymentData: null,

    fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
            const plans = await getPlans();
            set({ plans, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch membership plans', isLoading: false });
        }
    },

    fetchMembershipData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [currentMembership, usageStats] = await Promise.all([
                getCurrentMembership(),
                getUsageStats(),
            ]);
            set({ currentMembership, usageStats, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch membership details', isLoading: false });
        }
    },

    startPlanPayment: async (planId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await initiatePlanPayment(planId);
            set({ paymentData: data, isLoading: false });
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Failed to initiate payment';
            set({ error: message, isLoading: false });
            throw err;
        }
    },

    cancelSubscription: async () => {
        const { currentMembership } = get();
        if (!currentMembership) return;
        set({ isLoading: true, error: null });
        try {
            await cancelMembership(currentMembership.id);
            set(state => ({
                currentMembership: state.currentMembership
                    ? { ...state.currentMembership, status: 'cancelled' }
                    : null,
                isLoading: false,
            }));
        } catch {
            set({ error: 'Failed to cancel subscription', isLoading: false });
            throw new Error('Cancel failed');
        }
    },

    freezeSubscription: async (resumeDate: Date) => {
        const { currentMembership } = get();
        if (!currentMembership) return;
        set({ isLoading: true, error: null });
        try {
            await freezeMembership(currentMembership.id, resumeDate);
            set(state => ({
                currentMembership: state.currentMembership
                    ? { ...state.currentMembership, status: 'frozen', endDate: resumeDate.toISOString() }
                    : null,
                isLoading: false,
            }));
        } catch {
            set({ error: 'Failed to freeze subscription', isLoading: false });
            throw new Error('Freeze failed');
        }
    },

    clearPaymentData: () => set({ paymentData: null }),
}));
