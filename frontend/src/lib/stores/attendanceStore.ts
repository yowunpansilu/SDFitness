import { create } from 'zustand';
import {
    type AttendanceRecord,
    type AttendanceStats,
    getAttendanceHistory,
    checkInUser,
    checkOutUser
} from '@/lib/api/attendanceService';
import { useAuthStore } from './authStore';
import { produce } from 'immer';
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

export const useAttendanceStore = create<AttendanceState>((set) => ({
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
            const totalDuration = history.reduce((acc, curr) => {
                if (curr.checkInTime && curr.checkOutTime) {
                    return acc + differenceInMinutes(new Date(curr.checkOutTime), new Date(curr.checkInTime));
                }
                return acc;
            }, 0);
            
            const avgDurationMinutes = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;
            const lastVisitDate = history.length > 0 ? history[0].checkInTime : undefined;

            set({
                history,
                stats: { totalVisits, currentStreak, avgDurationMinutes, lastVisitDate },
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to fetch attendance history', isLoading: false });
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
        } catch (err) {
            set({ error: 'Failed to check in', isLoading: false });
        }
    },

    checkOut: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
            const completedSession = await checkOutUser(userId);
            
            set(produce((state: AttendanceState) => {
                state.history.unshift(completedSession);
                state.currentSession = null;
                
                // Update stats roughly
                if (state.stats) {
                    state.stats.totalVisits += 1;
                    if (completedSession.checkInTime && completedSession.checkOutTime) {
                        const duration = differenceInMinutes(new Date(completedSession.checkOutTime), new Date(completedSession.checkInTime));
                        const totalDur = (state.stats.avgDurationMinutes * (state.stats.totalVisits - 1)) + duration;
                        state.stats.avgDurationMinutes = Math.round(totalDur / state.stats.totalVisits);
                    }
                }
                state.isLoading = false;
            }));
        } catch (err) {
            set({ error: 'Failed to check out', isLoading: false });
        }
    }
}));

// Helper to calculate streak (simplified logic)
function calculateStreak(history: AttendanceRecord[]): number {
    if (history.length === 0) return 0;
    // Real calculation would involve checking consecutive days in checkInTime
    return 3; // Placeholder for now
}
