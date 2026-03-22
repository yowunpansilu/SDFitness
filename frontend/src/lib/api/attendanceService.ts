import api from './axios';

// Types
export interface AttendanceRecord {
    _id: string;
    user: string | { _id: string; firstName: string; lastName: string };
    checkInTime: string;
    checkOutTime?: string;
    facility: string;
    durationMinutes?: number;
}

// Real API calls
export const getAttendanceHistory = async (userId?: string): Promise<AttendanceRecord[]> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/attendance${params}`);
    return response.data.map((record: any) => ({
        ...record,
        durationMinutes: record.checkOutTime
            ? Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / 60000)
            : undefined
    }));
};

export const checkIn = async (userId: string, facility?: string): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/checkin', { userId, facility });
    return response.data;
};

export const checkOut = async (userId: string): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/checkout', { userId });
    return response.data;
};
