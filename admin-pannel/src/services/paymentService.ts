import api from '@/lib/api/axios';

export const paymentService = {
    getPayments: async (status: string = 'all') => {
        const response = await api.get(`/payments?status=${status}`);
        return response.data;
    },

    getPaymentDetails: async (id: string) => {
        const response = await api.get(`/payments/status/${id}`);
        return response.data;
    },

    createPayment: async (data: Record<string, unknown>) => {
        const response = await api.post('/payments/admin-record', data);
        return response.data;
    },

    updatePaymentStatus: async (id: string, status: string) => {
        const response = await api.patch(`/payments/${id}/status`, { status });
        return response.data;
    },

    approvePayment: async (id: string, remarks?: string) => {
        const response = await api.patch(`/payments/${id}/approve`, { remarks });
        return response.data;
    },

    rejectPayment: async (id: string, remarks?: string) => {
        const response = await api.patch(`/payments/${id}/reject`, { remarks });
        return response.data;
    }
};
