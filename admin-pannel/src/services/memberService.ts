import axios from 'axios';

const API_URL = 'http://localhost:5000/api/members';

const getAuthHeaders = () => {
    try {
        const storage = localStorage.getItem('admin-auth-storage');
        if (storage) {
            const { state } = JSON.parse(storage);
            if (state && state.token) {
                return {
                    headers: {
                        'Authorization': `Bearer ${state.token}`
                    }
                };
            }
        }
    } catch (e) {
        console.error('Error getting auth token:', e);
    }
    return { headers: {} };
};

export const memberService = {
    getMembers: async () => {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    },

    getMemberDetails: async (id: string) => {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    updateMemberStatus: async (id: string, status: string) => {
        const response = await axios.put(`${API_URL}/${id}`, { status }, getAuthHeaders());
        return response.data;
    },

    deleteMember: async (id: string) => {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    createMember: async (data: any) => {
        const response = await axios.post(API_URL, data, getAuthHeaders());
        return response.data;
    }
};
