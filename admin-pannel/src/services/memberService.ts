import api from '@/lib/api/axios';

export const memberService = {
    getMembers: async () => {
        const response = await api.get('/members');
        return response.data;
    },

    getMemberDetails: async (id: string) => {
        const response = await api.get(`/members/${id}`);
        return response.data;
    },

    updateMemberStatus: async (id: string, status: string) => {
        const response = await api.put(`/members/${id}`, { status });
        return response.data;
    },

    deleteMember: async (id: string) => {
        const response = await api.delete(`/members/${id}`);
        return response.data;
    },

    createMember: async (data: any) => {
        const response = await api.post('/members', data);
        return response.data;
    }
};
