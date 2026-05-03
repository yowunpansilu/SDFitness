import api from '@/lib/api/axios';

export const membershipService = {
    getPlans: async () => {
        const response = await api.get('/membership/plans');
        return response.data;
    },

    createPlan: async (data: Record<string, unknown>) => {
        const response = await api.post('/membership/plans', data);
        return response.data;
    },

    updatePlan: async (id: string, data: Record<string, unknown>) => {
        const response = await api.put(`/membership/plans/${id}`, data);
        return response.data;
    },

    deletePlan: async (id: string) => {
        const response = await api.delete(`/membership/plans/${id}`);
        return response.data;
    },

    getSubscriptions: async () => {
        const response = await api.get('/membership/subscriptions');
        return response.data;
    },

    createSubscription: async (data: Record<string, unknown>) => {
        const response = await api.post('/membership/subscriptions', data);
        return response.data;
    },

    getUpcomingRenewals: async () => {
        const response = await api.get('/membership/admin/upcoming-renewals');
        return response.data;
    },

    cancelAutoRenewal: async (memberId: string) => {
        const response = await api.post(`/membership/admin/cancel-auto-renewal/${memberId}`);
        return response.data;
    }
};
