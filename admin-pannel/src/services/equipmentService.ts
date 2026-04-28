import api from '@/lib/api/axios';

export const equipmentService = {
    getEquipment: async () => {
        const response = await api.get('/equipment');
        return response.data;
    },

    getEquipmentById: async (id: string) => {
        const response = await api.get(`/equipment/${id}`);
        return response.data;
    },

    createEquipment: async (data: Record<string, unknown>) => {
        const response = await api.post('/equipment', data);
        return response.data;
    },

    updateEquipment: async (id: string, data: Record<string, unknown>) => {
        const response = await api.put(`/equipment/${id}`, data);
        return response.data;
    },

    deleteEquipment: async (id: string) => {
        const response = await api.delete(`/equipment/${id}`);
        return response.data;
    }
};
