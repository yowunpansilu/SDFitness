import api from './axios';
import { useAuthStore } from '../stores/authStore';

// Types
export type PlanTier = 'Basic' | 'Standard' | 'Premium' | 'Elite';
export type BillingCycle = 'monthly' | 'yearly';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'frozen';

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
    id: string;
    planId: string;
    status: MembershipStatus;
    startDate: string;
    endDate: string;
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

// Service
export const getPlans = async (): Promise<MembershipPlan[]> => {
    try {
        const response = await api.get('/membership/plans');
        return (response.data || []).map((plan: any) => ({
            id: plan._id,
            name: plan.name,
            description: `${plan.name} access to gym facilities.`,
            monthlyPrice: plan.price,
            yearlyPrice: plan.price * 10, // Simulating 2 months free for yearly
            features: plan.features || [],
            popular: plan.name === 'Standard',
            color: plan.name === 'Basic' ? 'bg-slate-500' : (plan.name === 'Premium' ? 'bg-amber-500' : 'bg-primary/80'),
            trialDays: 7
        }));
    } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        return [];
    }
};

export const getCurrentMembership = async (): Promise<UserMembership> => {
    try {
        const response = await api.get('/membership/subscriptions');
        const subs = response.data || [];
        // Find the most relevant subscription (active, or just the latest one)
        const activeSub = subs.find((s: any) => s.status === 'active' || s.status === 'frozen') || subs[0];
        
        if (!activeSub) return null as any;

        return {
            id: activeSub._id,
            planId: activeSub.plan?._id || activeSub.plan,
            status: activeSub.status,
            startDate: activeSub.startDate,
            endDate: activeSub.endDate,
            billingCycle: 'monthly',
            autoRenew: activeSub.status === 'active',
            paymentMethod: {
                brand: 'Visa',
                last4: '4242'
            }
        };
    } catch (error) {
        console.error('Failed to fetch current membership:', error);
        return null as any;
    }
};

export const getUsageStats = async (): Promise<UsageStats> => {
    try {
        // Fetching attendance to calculate stats
        const response = await api.get('/attendance');
        const attendance = response.data || [];
        
        // Fetching bookings for class count
        const classesResponse = await api.get('/classes');
        const classes = classesResponse.data || [];
        const enrolledClasses = classes.filter((c: any) => c.enrolled > 0).length;

        return {
            checkInsThisMonth: attendance.length,
            classesAttendedThisMonth: enrolledClasses,
            totalWorkouts: attendance.length + enrolledClasses,
            streakDays: 3 // Mocked streak calculation as it requires sequential history logic
        };
    } catch (error) {
        console.error('Failed to fetch usage stats:', error);
        return {
            checkInsThisMonth: 0,
            classesAttendedThisMonth: 0,
            totalWorkouts: 0,
            streakDays: 0
        };
    }
};

export const updateMembershipPlan = async (
    newPlanId: string,
    _billingCycle: BillingCycle
): Promise<UserMembership> => {
    try {
        const { user } = useAuthStore.getState();
        const userId = user?._id || user?.id;
        
        const response = await api.post('/membership/subscriptions', { 
            plan: newPlanId,
            user: userId
        });
        const sub = response.data;
        return {
            id: sub._id,
            planId: sub.plan?._id || sub.plan,
            status: sub.status,
            startDate: sub.startDate,
            endDate: sub.endDate,
            billingCycle: 'monthly',
            autoRenew: true
        };
    } catch (error) {
        console.error('Failed to update membership:', error);
        throw error;
    }
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
