import api from './axios';

export const addWeightLog = async (data: { weight: number; unit: 'kg' | 'lbs'; date?: string; note?: string }) => {
    const response = await api.post('/weight', data);
    return response.data;
};

export const getWeightHistory = async () => {
    const response = await api.get('/weight/history');
    return response.data;
};

export const deleteWeightLog = async (id: string) => {
    const response = await api.delete(`/weight/${id}`);
    return response.data;
};

export const setWeightGoal = async (data: { targetWeight: number; type: 'lose' | 'gain'; targetDate?: string }) => {
    const response = await api.post('/weight/goal', data);
    return response.data;
};

export const getActiveGoal = async () => {
    const response = await api.get('/weight/goal/active');
    return response.data;
};
