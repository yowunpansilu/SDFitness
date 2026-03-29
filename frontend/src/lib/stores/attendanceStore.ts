import { create } from 'zustand';
import {
    type AttendanceRecord,
    type AttendanceStats,
    getAttendanceHistory,
    checkInUser,
    checkOutUser
} from '@/lib/api/attendanceService';
import { useAuthStore } from './authStore';
import { differenceInMinutes } from 'date-fns';

interface AttendanceState {
    history: AttendanceRecord[];
    currentSession: AttendanceRecord | null;
    stats: AttendanceStats | null;
    isLoading: boolean;
    error: string | null;

    fetchHistory: () => Promise<void>;
    checkIn: (facility?: string) => Promise<void>;
    checkOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
    history: [],
    currentSession: null,
    stats: null,
    isLoading: false,
    error: null,

    fetchHistory: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
            const history = await getAttendanceHistory(userId);

            // Calculate stats
            const totalVisits = history.length;
            const currentStreak = calculateStreak(history);
            
            // Backend AttendanceRecord might not have durationMinutes if it's just raw records
            const completedVisits = history.filter(h => h.checkInTime && h.checkOutTime);
            const totalDuration = completedVisits.reduce((acc, curr) => {
                return acc + differenceInMinutes(new Date(curr.checkOutTime!), new Date(curr.checkInTime));
            }, 0);
            
            const avgDurationMinutes = completedVisits.length > 0 ? Math.round(totalDuration / completedVisits.length) : 0;
            const lastVisitDate = history.length > 0 ? history[0].checkInTime : undefined;

            set({
                history,
                stats: { totalVisits, currentStreak, avgDurationMinutes, lastVisitDate },
                isLoading: false
            });
        } catch (err: any) {
            console.error('Error fetching attendance history:', err);
            set({ error: `Failed to fetch attendance history: ${err.message || 'Unknown error'}`, isLoading: false });
        }
    },

    checkIn: async (facility = 'Main Gym') => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
            set({ error: 'User not authenticated' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const session = await checkInUser(userId, facility);
            set({ currentSession: session, isLoading: false });
            get().fetchHistory(); // Refresh history
        } catch (err) {
            set({ error: 'Failed to check in', isLoading: false });
        }
    },

    checkOut: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
            await checkOutUser(userId);
            set({ currentSession: null, isLoading: false });
            get().fetchHistory(); // Refresh history and accurately recalculate stats
        } catch (err) {
            set({ error: 'Failed to check out', isLoading: false });
        }
    }
}));

// Helper to calculate streak accurately from history
function calculateStreak(history: AttendanceRecord[]): number {
    if (!history || history.length === 0) return 0;

    // Normalize dates to midnight to compare just the days
    const dates = history
        .filter(h => h.checkInTime)
        .map(h => {
             const d = new Date(h.checkInTime);
             d.setHours(0, 0, 0, 0);
             return d.getTime();
        })
        .sort((a, b) => b - a);

    const uniqueDates = Array.from(new Set(dates));
    
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msInDay = 24 * 60 * 60 * 1000;
    
    let streak = 0;
    const diffDaysFirst = Math.round((today.getTime() - uniqueDates[0]) / msInDay);
    
    // If the most recent visit is today or yesterday, start counting streak
    if (diffDaysFirst <= 1) {
        streak = 1;
        let currentDate = uniqueDates[0];

        for (let i = 1; i < uniqueDates.length; i++) {
            const diffDays = Math.round((currentDate - uniqueDates[i]) / msInDay);
            if (diffDays === 1) {
                streak++;
                currentDate = uniqueDates[i];
            } else {
                break;
            }
        }
    }

    return streak;
}
