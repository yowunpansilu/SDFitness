import { create } from 'zustand';
import {
    type MembershipPlan,
    type UserMembership,
    type UsageStats,
    type BillingCycle,
    getPlans,
    getCurrentMembership,
    getUsageStats,
    updateMembershipPlan,
    cancelMembership,
    freezeMembership
} from '../api/membershipService';

interface MembershipState {
    plans: MembershipPlan[];
    currentMembership: UserMembership | null;
    usageStats: UsageStats | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPlans: () => Promise<void>;
    fetchMembershipData: () => Promise<void>;
    changePlan: (planId: string, billingCycle: BillingCycle) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    freezeSubscription: (resumeDate: Date) => Promise<void>;
}

export const useMembershipStore = create<MembershipState>((set, get) => ({
    plans: [],
    currentMembership: null,
    usageStats: null,
    isLoading: false,
    error: null,

    fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
            const plans = await getPlans();
            set({ plans, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to fetch membership plans', isLoading: false });
        }
    },

    fetchMembershipData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [currentMembership, usageStats] = await Promise.all([
                getCurrentMembership(),
                getUsageStats()
            ]);
            set({ currentMembership, usageStats, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to fetch membership details', isLoading: false });
        }
    },

    changePlan: async (planId, billingCycle) => {
        set({ isLoading: true, error: null });
        try {
            const updatedMembership = await updateMembershipPlan(planId, billingCycle);
            set({ currentMembership: updatedMembership, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to update plan', isLoading: false });
            throw err;
        }
    },

    cancelSubscription: async () => {
        const { currentMembership } = get();
        if (!currentMembership) return;

        set({ isLoading: true, error: null });
        try {
            await cancelMembership(currentMembership.id);
            set((state) => ({
                currentMembership: state.currentMembership
                    ? { ...state.currentMembership, status: 'cancelled', autoRenew: false }
                    : null,
                isLoading: false
            }));
        } catch (err) {
            set({ error: 'Failed to cancel subscription', isLoading: false });
            throw err;
        }
    },

    freezeSubscription: async (resumeDate: Date) => {
        const { currentMembership } = get();
        if (!currentMembership) return;

        set({ isLoading: true, error: null });
        try {
            await freezeMembership(currentMembership.id, resumeDate);
            set((state) => ({
                currentMembership: state.currentMembership
                    ? { ...state.currentMembership, status: 'frozen', endDate: resumeDate.toISOString() }
                    : null,
                isLoading: false
            }));
        } catch (err) {
            set({ error: 'Failed to freeze subscription', isLoading: false });
            throw err;
        }
    }
}));
