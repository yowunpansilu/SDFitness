import api from '@/lib/api/axios';

const API_URL = '/members';

export const memberService = {
    getMembers: async () => {
        const response = await api.get(API_URL);
        return response.data;
    },

    getMemberDetails: async (id: string) => {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    },

    updateMemberStatus: async (id: string, status: string) => {
        const response = await api.put(`${API_URL}/${id}`, { status });
        return response.data;
    },

    deleteMember: async (id: string) => {
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    },

    createMember: async (data: Record<string, unknown>) => {
        const response = await api.post(API_URL, data);
        return response.data;
    }
};
