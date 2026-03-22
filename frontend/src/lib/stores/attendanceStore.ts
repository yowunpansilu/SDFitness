import { create } from 'zustand';
import {
    type AttendanceRecord,
    type AttendanceStats,
    getAttendanceHistory,
    checkInUser,
    checkOutUser
} from '@/lib/api/attendanceService';
import { produce } from 'immer';
import { differenceInMinutes, parseISO } from 'date-fns';

interface AttendanceState {
    history: AttendanceRecord[];
    currentSession: AttendanceRecord | null;
    stats: AttendanceStats | null;
    isLoading: boolean;
    error: string | null;

    fetchHistory: () => Promise<void>;
    checkIn: (method: 'qr' | 'manual') => Promise<void>;
    checkOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
    history: [],
    currentSession: null,
    stats: null,
    isLoading: false,
    error: null,

    fetchHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const history = await getAttendanceHistory();

            // Calculate stats
            const totalVisits = history.length;
            const currentStreak = calculateStreak(history);
            const totalDuration = history.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
            const avgDurationMinutes = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;
            const lastVisitDate = history.length > 0 ? history[0].date : undefined;

            set({
                history,
                stats: { totalVisits, currentStreak, avgDurationMinutes, lastVisitDate },
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to fetch attendance history', isLoading: false });
        }
    },

    checkIn: async (method) => {
        set({ isLoading: true, error: null });
        try {
            const session = await checkInUser(method);
            set({ currentSession: session, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to check in', isLoading: false });
        }
    },

    checkOut: async () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({ isLoading: true, error: null });
        try {
            const completedSession = await checkOutUser(currentSession.id);
            // Update the completed session with actual duration calculations if needed in a real app
            const endTime = new Date();
            const startTime = parseISO(currentSession.checkInTime);
            const duration = differenceInMinutes(endTime, startTime);

            const finalRecord = { ...completedSession, checkOutTime: endTime.toISOString(), durationMinutes: duration };

            set(produce((state: AttendanceState) => {
                state.history.unshift(finalRecord);
                state.currentSession = null;
                // Update stats
                if (state.stats) {
                    state.stats.totalVisits += 1;
                    // Recalculate average approx
                    const totalDur = (state.stats.avgDurationMinutes * (state.stats.totalVisits - 1)) + duration;
                    state.stats.avgDurationMinutes = Math.round(totalDur / state.stats.totalVisits);
                }
                state.isLoading = false;
            }));
        } catch (err) {
            set({ error: 'Failed to check out', isLoading: false });
        }
    }
}));

// Helper to calculate streak (mock logic for now - consecutive days)
function calculateStreak(history: AttendanceRecord[]): number {
    // Determine streak based on history dates
    // Simplified logic: just returning a mock number or simple calculation
    // In real app, sort by date desc and check consecutiveness
    return history.length > 0 ? 3 : 0;
}
