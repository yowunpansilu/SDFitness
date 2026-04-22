import api from '@/lib/api/axios';

export interface FeedbackFilters {
    status?: string;
    category?: string;
    page?: number;
}

export const getAllFeedback = async (filters: FeedbackFilters = {}) => {
    const response = await api.get('/feedback', { params: filters });
    return response.data;
};

export const getFeedbackById = async (id: string) => {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
};

export const updateFeedbackStatus = async (id: string, status: string) => {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    return response.data;
};

export const addAdminNotes = async (id: string, adminNotes: string) => {
    const response = await api.patch(`/feedback/${id}/notes`, { adminNotes });
    return response.data;
};
