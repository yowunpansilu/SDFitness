import api from '@/lib/api/axios';

export const paymentService = {
    getPayments: async (status: string = 'all') => {
        const response = await api.get(`/payments?status=${status}`);
        return response.data;
    },

    getPaymentDetails: async (id: string) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    createPayment: async (data: any) => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    updatePaymentStatus: async (id: string, status: string) => {
        const response = await api.patch(`/payments/${id}/status`, { status });
        return response.data;
    }
};
