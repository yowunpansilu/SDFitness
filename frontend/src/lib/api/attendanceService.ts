
// Types
export interface AttendanceRecord {
    id: string;
    userId: string;
    date: string; // ISO date string YYYY-MM-DD
    checkInTime: string; // ISO datetime
    checkOutTime?: string; // ISO datetime
    durationMinutes?: number;
    method: 'qr' | 'manual';
}

export interface AttendanceStats {
    totalVisits: number;
    currentStreak: number;
    avgDurationMinutes: number;
    lastVisitDate?: string;
}

// Mock Data
export const MOCK_ATTENDANCE_HISTORY: AttendanceRecord[] = [
    {
        id: 'att_1',
        userId: 'user_1',
        date: '2024-01-28',
        checkInTime: '2024-01-28T18:00:00Z',
        checkOutTime: '2024-01-28T19:30:00Z',
        durationMinutes: 90,
        method: 'qr'
    },
    {
        id: 'att_2',
        userId: 'user_1',
        date: '2024-01-26',
        checkInTime: '2024-01-26T17:15:00Z',
        checkOutTime: '2024-01-26T18:15:00Z',
        durationMinutes: 60,
        method: 'manual'
    },
    {
        id: 'att_3',
        userId: 'user_1',
        date: '2024-01-25',
        checkInTime: '2024-01-25T07:00:00Z',
        checkOutTime: '2024-01-25T08:00:00Z',
        durationMinutes: 60,
        method: 'qr'
    }
];

// Service
export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ATTENDANCE_HISTORY), 800));
};

export const checkInUser = async (method: 'qr' | 'manual'): Promise<AttendanceRecord> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const now = new Date();
            resolve({
                id: `att_${Math.random().toString(36).substr(2, 9)}`,
                userId: 'user_1',
                date: now.toISOString().split('T')[0],
                checkInTime: now.toISOString(),
                method
            });
        }, 1000);
    });
};

export const checkOutUser = async (recordId: string): Promise<AttendanceRecord> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app we'd fetch the record
            const now = new Date();
            // Mocking the update
            resolve({
                id: recordId,
                userId: 'user_1',
                date: now.toISOString().split('T')[0],
                checkInTime: now.toISOString(), // This would be the original check-in time
                checkOutTime: now.toISOString(),
                durationMinutes: 60, // Mock duration
                method: 'manual'
            });
        }, 800);
    });
};
