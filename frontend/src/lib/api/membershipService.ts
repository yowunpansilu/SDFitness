import { produce } from 'immer';

// Types
export type PlanTier = 'Basic' | 'Pro' | 'Elite';
export type BillingCycle = 'monthly' | 'yearly';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'frozen';

export interface MembershipFeature {
    name: string;
    included: boolean;
}

export interface MembershipPlan {
    id: string;
    name: PlanTier;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    popular?: boolean;
    color: string;
    trialDays?: number;
}

export interface UserMembership {
    planId: string;
    status: MembershipStatus;
    startDate: string;
    endDate: string; // Renewal date
    billingCycle: BillingCycle;
    autoRenew: boolean;
    paymentMethod?: {
        last4: string;
        brand: string;
    };
}

export interface UsageStats {
    checkInsThisMonth: number;
    classesAttendedThisMonth: number;
    totalWorkouts: number;
    streakDays: number;
}

// Mock Data
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
    {
        id: 'plan_basic',
        name: 'Basic',
        description: 'Essential access to gym facilities.',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99, // 2 months free
        features: [
            'Access to Gym Floor',
            'Locker Room Access',
            'Free Parking',
            '1 Guest Pass/Month'
        ],
        color: 'bg-slate-500',
        trialDays: 7
    },
    {
        id: 'plan_pro',
        name: 'Pro',
        description: 'Perfect for regular gym-goers.',
        monthlyPrice: 59.99,
        yearlyPrice: 599.99,
        popular: true,
        features: [
            'All Basic Features',
            'Unlimited Group Classes',
            'Sauna & Steam Room',
            'Access to All Locations',
            'Quarterly Personal Training Session'
        ],
        color: 'bg-primary/80',
        trialDays: 14
    },
    {
        id: 'plan_elite',
        name: 'Elite',
        description: 'Ultimate fitness experience with priority access.',
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
        features: [
            'All Pro Features',
            'Unlimited Personal Training',
            'Nutritional Consultations',
            'Massage Therapy (1/month)',
            'Private Locker',
            'Laundry Service'
        ],
        color: 'bg-amber-500'
    }
];

const MOCK_MEMBERSHIP: UserMembership = {
    planId: 'plan_pro',
    status: 'active',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2023-12-15T00:00:00Z',
    billingCycle: 'monthly',
    autoRenew: true,
    paymentMethod: {
        brand: 'Visa',
        last4: '4242'
    }
};

const MOCK_STATS: UsageStats = {
    checkInsThisMonth: 12,
    classesAttendedThisMonth: 5,
    totalWorkouts: 145,
    streakDays: 3
};

// Service
export const getPlans = async (): Promise<MembershipPlan[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MEMBERSHIP_PLANS), 500));
};

export const getCurrentMembership = async (): Promise<UserMembership> => {
    return new Promise((resolve) => setTimeout(() => resolve({ ...MOCK_MEMBERSHIP }), 800));
};

export const getUsageStats = async (): Promise<UsageStats> => {
    return new Promise((resolve) => setTimeout(() => resolve({ ...MOCK_STATS }), 600));
};

export const updateMembershipPlan = async (
    newPlanId: string,
    billingCycle: BillingCycle
): Promise<UserMembership> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(produce(MOCK_MEMBERSHIP, draft => {
                draft.planId = newPlanId;
                draft.billingCycle = billingCycle;
                // In a real app, we'd calculate pro-ration and new dates
            }));
        }, 1500);
    });
};

export const cancelMembership = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};
