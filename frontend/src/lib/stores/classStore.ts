import { create } from 'zustand';
import { getClasses, getUserBookings, bookClass, cancelBooking } from '../api/classService';
import type { GymClass, Booking, ClassType } from '../api/classService';

interface ClassFilters {
    type: ClassType | 'All';
    trainer: string | 'All';
    onlyAvailable: boolean;
}

interface ClassState {
    classes: GymClass[];
    userBookings: Booking[];
    loading: boolean;
    error: string | null;
    selectedDate: Date;
    filters: ClassFilters;

    // Actions
    setSelectedDate: (date: Date) => void;
    setFilters: (filters: Partial<ClassFilters>) => void;

    fetchClasses: (startDate: Date, endDate: Date) => Promise<void>;
    fetchUserBookings: (userId: string) => Promise<void>;
    joinClass: (classId: string, userId: string, classDate: string) => Promise<void>;
    leaveClass: (bookingId: string) => Promise<void>;
}

export const useClassStore = create<ClassState>((set, get) => ({
    // ... initial state ...
    classes: [],
    userBookings: [],
    loading: false,
    error: null,
    selectedDate: new Date(),
    filters: {
        type: 'All',
        trainer: 'All',
        onlyAvailable: false
    },

    setSelectedDate: (date) => set({ selectedDate: date }),
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    fetchClasses: async (startDate, endDate) => {
        set({ loading: true, error: null });
        try {
            const classes = await getClasses(startDate, endDate);
            set({ classes, loading: false });
        } catch (err: any) {
            set({ loading: false, error: err.message || 'Failed to fetch classes' });
        }
    },

    fetchUserBookings: async (userId) => {
        try {
            const userBookings = await getUserBookings(userId);
            set({ userBookings });
        } catch (err: any) {
            console.error('Failed to fetch bookings:', err);
        }
    },

    joinClass: async (classId: string, userId: string, classDate: string) => {
        set({ loading: true, error: null });
        try {
            await bookClass(classId, userId, classDate);
            // Refresh data
            await get().fetchClasses(get().selectedDate, get().selectedDate);
            await get().fetchUserBookings(userId);
            set({ loading: false });
        } catch (err: any) {
            set({ loading: false, error: err.message || 'Failed to book class' });
            throw err;
        }
    },

    leaveClass: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            await cancelBooking(bookingId);
            // Optimistic update or refresh
            set((state) => ({
                userBookings: state.userBookings.filter(b => b.id !== bookingId)
            }));
            // Refresh classes to update counts
            await get().fetchClasses(get().selectedDate, get().selectedDate);
            set({ loading: false });
        } catch (err: any) {
            set({ loading: false, error: err.message || 'Failed to cancel booking' });
            throw err;
        }
    }
}));
