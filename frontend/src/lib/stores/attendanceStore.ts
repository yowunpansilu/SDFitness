import { create } from 'zustand';
import {
    type AttendanceRecord,
    getAttendanceHistory,
    checkIn,
    checkOut
} from '@/lib/api/attendanceService';
import { produce } from 'immer';
import { differenceInMinutes, parseISO } from 'date-fns';

interface AttendanceStats {
    totalVisits: number;
    currentStreak: number;
    avgDurationMinutes: number;
    lastVisitDate?: string;
}

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

    checkIn: async (method) => {
        set({ isLoading: true, error: null });
        try {
            const session = await checkIn('current-user', method === 'qr' ? 'Main Gym' : 'Main Gym');
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
            const userId = typeof currentSession.user === 'string' ? currentSession.user : currentSession.user._id;
            const completedSession = await checkOut(userId);
            const endTime = new Date();
            const startTime = parseISO(currentSession.checkInTime);
            const duration = differenceInMinutes(endTime, startTime);

            const finalRecord = { ...completedSession, checkOutTime: endTime.toISOString(), durationMinutes: duration };

            set(produce((state: AttendanceState) => {
                state.history.unshift(finalRecord);
                state.currentSession = null;
                if (state.stats) {
                    state.stats.totalVisits += 1;
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

// Helper to calculate streak (consecutive days with attendance)
function calculateStreak(history: AttendanceRecord[]): number {
    if (history.length === 0) return 0;

    // Get unique dates sorted descending
    const uniqueDates = [...new Set(
        history.map(r => {
            const d = new Date(r.checkInTime);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    )].sort().reverse();

    if (uniqueDates.length === 0) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const [y1, m1, d1] = uniqueDates[i - 1].split('-').map(Number);
        const [y2, m2, d2] = uniqueDates[i].split('-').map(Number);
        const date1 = new Date(y1, m1, d1);
        const date2 = new Date(y2, m2, d2);
        const diffDays = Math.round((date1.getTime() - date2.getTime()) / 86400000);
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
