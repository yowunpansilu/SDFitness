import api from '@/lib/api/axios';

export const mlService = {
    getMLStats: async () => {
        const response = await api.get('/analytics/ml');
        return response.data;
    }
};
