import api from './axios';

// Types
export type BillingCycle = 'monthly' | 'yearly';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'frozen';

// Raw plan as it comes from the DB
export interface MembershipPlan {
    id: string;
    _id: string;
    name: string;
    description: string;
    price: number;           // Single price from DB
    duration: number;        // 1 = monthly, 12 = yearly
    durationType: 'months' | 'days';
    features: string[];
    isActive: boolean;
    color: string;
    memberCount?: number;
    monthlyPrice?: number;
    yearlyPrice?: number;
    popular?: boolean;
    trialDays?: number;
}

export interface UserMembership {
    id: string;
    planId: string;
    planName: string;
    status: MembershipStatus;
    startDate: string;
    endDate: string;
    plan?: MembershipPlan;
    paymentMethod?: {
        brand: string;
        last4: string;
    };
}

export interface UsageStats {
    checkInsThisMonth: number;
    classesAttendedThisMonth: number;
    totalWorkouts: number;
    streakDays: number;
}

// GET all membership plans from DB
export const getPlans = async (): Promise<MembershipPlan[]> => {
    try {
        const response = await api.get('/membership/plans');
        // API returns { success: true, data: [...] }
        const plans = response.data?.data || response.data || [];
        return plans.filter((p: MembershipPlan) => p.isActive !== false);
    } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        return [];
    }
};

// GET current active subscription for logged-in user
export const getCurrentMembership = async (): Promise<UserMembership | null> => {
    try {
        const response = await api.get('/membership/subscriptions');
        const subs = response.data?.data || response.data || [];

        // Find active or the most recent
        const activeSub = subs.find((s: any) => s.status === 'active' || s.status === 'frozen') || subs[0];
        if (!activeSub) return null;

        return {
            id: activeSub._id,
            planId: activeSub.plan?._id || activeSub.plan,
            planName: activeSub.plan?.name || 'Unknown Plan',
            status: activeSub.status,
            startDate: activeSub.startDate,
            endDate: activeSub.endDate,
            plan: activeSub.plan ? {
                ...activeSub.plan,
                id: activeSub.plan._id,
                _id: activeSub.plan._id,
            } : undefined,
        };
    } catch (error) {
        console.error('Failed to fetch current membership:', error);
        return null;
    }
};

export const getUsageStats = async (): Promise<UsageStats> => {
    try {
        const response = await api.get('/attendance');
        const attendance = response.data || [];
        return {
            checkInsThisMonth: attendance.length,
            classesAttendedThisMonth: 0,
            totalWorkouts: attendance.length,
            streakDays: 0
        };
    } catch (error) {
        return {
            checkInsThisMonth: 0,
            classesAttendedThisMonth: 0,
            totalWorkouts: 0,
            streakDays: 0
        };
    }
};

// Initiate PayHere payment for a plan (redirects to PayHere checkout)
export const initiatePlanPayment = async (planId: string): Promise<{
    checkoutUrl: string;
    orderId: string;
    formData: Record<string, string>;
}> => {
    const plan = (await getPlans()).find(p => p._id === planId || p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const response = await api.post('/payments/initiate', {
        amount: plan.price,
        currency: 'LKR',
        description: plan.name,
        planId: plan._id || plan.id,
    });

    return response.data;
};

export const cancelMembership = async (subscriptionId: string): Promise<void> => {
    await api.put(`/membership/subscriptions/${subscriptionId}/status`, { status: 'cancelled' });
};

export const freezeMembership = async (subscriptionId: string, resumeDate: Date): Promise<void> => {
    await api.put(`/membership/subscriptions/${subscriptionId}/status`, {
        status: 'frozen',
        endDate: resumeDate.toISOString()
    });
};
