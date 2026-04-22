import api from './axios';

export const submitDailyProgress = async (data: { workoutCompleted: boolean; dietFollowed: boolean; notes?: string; date?: string }) => {
    const response = await api.post('/progress/daily', data);
    return response.data;
};

export const getDailyProgress = async () => {
    const response = await api.get('/progress/daily');
    return response.data;
};

export const getWeeklyProgress = async () => {
    const response = await api.get('/progress/weekly');
    return response.data;
};

export const addBodyMeasurement = async (data: { chest: number; waist: number; hips: number; notes?: string; date?: string }) => {
    const response = await api.post('/progress/measurement', data);
    return response.data;
};

export const getBodyMeasurements = async () => {
    const response = await api.get('/progress/measurements');
    return response.data;
};
