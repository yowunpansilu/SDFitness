import api from './axios';

// Types
export interface GymClass {
    _id: string;
    name: string;
    description: string;
    trainer: {
        _id: string;
        user?: { firstName: string; lastName: string };
        specialization?: string[];
    };
    schedule: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    };
    capacity: number;
    enrolled: number;
}

export interface Booking {
    _id: string;
    user: string;
    class: string | GymClass;
    status: 'confirmed' | 'cancelled' | 'attended';
    bookingDate: string;
}

// Real API calls
export const getClasses = async (): Promise<GymClass[]> => {
    const response = await api.get('/classes');
    return response.data;
};

export const getClassById = async (id: string): Promise<GymClass> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
};

export const getUserBookings = async (): Promise<Booking[]> => {
    // TODO: Add user-specific booking endpoint
    return [];
};

export const bookClass = async (classId: string, userId: string): Promise<Booking> => {
    const response = await api.post('/classes/book', { classId, userId });
    return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await api.delete(`/classes/bookings/${bookingId}`);
};
