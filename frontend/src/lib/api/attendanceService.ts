import api from './axios';

// Types
export interface AttendanceRecord {
    _id: string;
    user: string;
    facility: string;
    checkInTime: string; // ISO datetime
    checkOutTime?: string; // ISO datetime
}

export interface AttendanceStats {
    totalVisits: number;
    currentStreak: number;
    avgDurationMinutes: number;
    lastVisitDate?: string;
}

// Service
export const getAttendanceHistory = async (userId?: string): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance', { params: { userId } });
    return response.data;
};

export const checkInUser = async (userId: string, facility: string = 'Main Gym'): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/checkin', { userId, facility });
    return response.data;
};

export const checkOutUser = async (userId: string): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/checkout', { userId });
    return response.data;
};
