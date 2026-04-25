import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

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
    dietLogged: boolean;
}

export const getWeightLogs = async (userId: string, days: number = 30): Promise<WeightLog[]> => {
    try {
        const response = await axios.get(`${API_URL}/progress/weight/${userId}?days=${days}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching weight logs:', error);
        throw error;
    }
};

export const logWeight = async (userId: string, weight: number): Promise<WeightLog> => {
    try {
        const response = await axios.post(`${API_URL}/progress/weight`, {
            userId,
            weight
        });
        return response.data.data;
    } catch (error) {
        console.error('Error logging weight:', error);
        throw error;
    }
};

export const getDailyProgress = async (userId: string, date: Date): Promise<DailyProgress> => {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const response = await axios.get(`${API_URL}/progress/daily/${userId}/${dateStr}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching daily progress:', error);
        throw error;
    }
};

export const toggleDailyProgress = async (userId: string, date: Date, type: 'workout' | 'diet', value: boolean): Promise<DailyProgress> => {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const response = await axios.post(`${API_URL}/progress/daily/toggle`, {
            userId,
            date: dateStr,
            type,
            value
        });
        return response.data.data;
    } catch (error) {
        console.error('Error toggling daily progress:', error);
        throw error;
    }
};

export const getWeeklyProgress = async (userId: string): Promise<DailyProgress[]> => {
    try {
        const response = await axios.get(`${API_URL}/progress/weekly/${userId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching weekly progress:', error);
        throw error;
    }
};
