import api from './axios';

// Types
export type PlanTier = 'Basic' | 'Pro' | 'Elite' | 'Student';
export type BillingCycle = 'monthly' | 'yearly';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'frozen';

export interface MembershipPlan {
    _id: string;
    id?: string;
    name: string;
    price: number;
    durationDays: number;
    features: string[];
    isActive: boolean;
    description?: string;
    createdAt?: string;
}

export interface UserMembership {
    _id: string;
    user: string;
    plan: MembershipPlan;
    startDate: string;
    endDate: string;
    status: MembershipStatus;
    createdAt?: string;
}

export interface UsageStats {
    checkInsThisMonth: number;
    classesAttendedThisMonth: number;
    totalWorkouts: number;
    streakDays: number;
}

// Real API calls
export const getPlans = async (): Promise<MembershipPlan[]> => {
    const response = await api.get('/membership/plans');
    return response.data;
};

export const getCurrentMembership = async (): Promise<UserMembership | null> => {
    try {
        const response = await api.get('/membership/subscriptions');
        const subs = response.data;
        // Return the latest active subscription
        const active = subs.find((s: UserMembership) => s.status === 'active');
        return active || subs[0] || null;
    } catch {
        return null;
    }
};

export const getUsageStats = async (): Promise<UsageStats> => {
    try {
        const response = await api.get('/attendance');
        const records = response.data;
        const now = new Date();
        const thisMonth = records.filter((r: any) =>
            new Date(r.checkInTime).getMonth() === now.getMonth()
        );
        return {
            checkInsThisMonth: thisMonth.length,
            classesAttendedThisMonth: 0,
            totalWorkouts: records.length,
            streakDays: Math.min(thisMonth.length, 7)
        };
    } catch {
        return { checkInsThisMonth: 0, classesAttendedThisMonth: 0, totalWorkouts: 0, streakDays: 0 };
    }
};

export const updateMembershipPlan = async (
    newPlanId: string,
    _billingCycle: BillingCycle
): Promise<UserMembership> => {
    const response = await api.post('/membership/subscriptions', {
        plan: newPlanId,
        endDate: new Date(Date.now() + 30 * 86400000)
    });
    return response.data;
};

export const cancelMembership = async (): Promise<void> => {
    // Would need a cancel endpoint — for now just a placeholder
    return;
};
