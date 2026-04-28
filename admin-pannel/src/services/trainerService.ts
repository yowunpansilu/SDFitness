import api from '@/lib/api/axios';

export const trainerService = {
    getTrainers: async () => {
        const response = await api.get('/trainers');
        return response.data;
    },

    getTrainerDetails: async (id: string) => {
        const response = await api.get(`/trainers/${id}`);
        return response.data;
    },

    updateTrainer: async (id: string, data: Record<string, unknown>) => {
        const response = await api.put(`/trainers/${id}`, data);
        return response.data;
    },

    deleteTrainer: async (id: string) => {
        const response = await api.delete(`/trainers/${id}`);
        return response.data;
    },

    createTrainer: async (data: Record<string, unknown>) => {
        const response = await api.post('/trainers', data);
        return response.data;
    }
};
