import api from './axios';

export interface WeightLog {
    _id: string;
    userId: string;
    weight: number;
    unit: string;
    date: string;
    notes?: string;
}

export interface DailyProgress {
    _id: string;
    userId: string;
    date: string;
    workoutCompleted: boolean;
    dietLogged: boolean; // Keep for FE, map to dietFollowed in backend
}

export const getWeightLogs = async (userId: string, days: number = 30): Promise<WeightLog[]> => {
    try {
        const response = await api.get(`/weight/history?userId=${userId}&days=${days}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching weight logs:', error);
        throw error;
    }
};

export const logWeight = async (userId: string, weight: number): Promise<WeightLog> => {
    try {
        const response = await api.post(`/weight`, {
            userId,
            weight
        });
        return response.data.data;
    } catch (error) {
        console.error('Error logging weight:', error);
        throw error;
    }
};

export const getDailyProgress = async (_userId: string, date: Date): Promise<DailyProgress> => {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const response = await api.get(`/progress/daily/${dateStr}`);
        const data = response.data.data;
        // Map backend dietFollowed to frontend dietLogged
        return {
            ...data,
            dietLogged: data.dietFollowed
        };
    } catch (error) {
        console.error('Error fetching daily progress:', error);
        throw error;
    }
};

export const toggleDailyProgress = async (userId: string, date: Date, type: 'workout' | 'diet', value: boolean): Promise<DailyProgress> => {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const response = await api.post(`/progress/daily/toggle`, {
            userId,
            date: dateStr,
            type,
            value
        });
        const data = response.data.data;
        return {
            ...data,
            dietLogged: data.dietFollowed
        };
    } catch (error) {
        console.error('Error toggling daily progress:', error);
        throw error;
    }
};

export const getWeeklyProgress = async (userId: string): Promise<DailyProgress[]> => {
    try {
        const response = await api.get(`/progress/weekly?userId=${userId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching weekly progress:', error);
        throw error;
    }
};
