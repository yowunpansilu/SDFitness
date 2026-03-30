import api from '@/lib/api/axios';

export const analyticsService = {
    getAnalytics: async (range: string = '6months') => {
        const response = await api.get(`/analytics?range=${range}`);
        return response.data;
    }
};
