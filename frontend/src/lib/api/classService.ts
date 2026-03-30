import api from './axios';

// Types
export type ClassType = 'Yoga' | 'HIIT' | 'Pilates' | 'Spin' | 'Strength' | 'Zumba' | 'CrossFit';

export interface GymClass {
    id: string;
    _id?: string;
    name: string;
    description: string;
    trainerName: string;
    trainerId: string;
    startTime: string; // ISO string
    duration: number;
    capacity: number;
    bookedCount: number;
    type: ClassType;
    location: string;
    image?: string;
    schedule?: {
        dayOfWeek: string;
        startTime: string; // HH:mm
        endTime: string;
    };
}

export interface Booking {
    id: string;
    classId: string;
    userId: string;
    bookingDate: string;
    status: 'confirmed' | 'waitlist' | 'cancelled';
    gymClass: GymClass;
}

// Service mapping helper
const mapBackendClassToFrontend = (cls: any): GymClass => {
    return {
        id: cls._id || cls.id,
        name: cls.name,
        description: cls.description || '',
        trainerName: cls.trainer?.user ? `${cls.trainer.user.firstName} ${cls.trainer.user.lastName}` : 'Unknown Trainer',
        trainerId: cls.trainer?._id || '',
        startTime: cls.startTime || new Date().toISOString(),
        duration: cls.duration || 60,
        capacity: cls.capacity || 20,
        bookedCount: cls.enrolled || 0,
        type: (cls.type || 'Strength') as ClassType,
        location: cls.location || 'Main Gym',
        image: cls.image,
        schedule: cls.schedule
    };
};

// Service
export const getClasses = async (_startDate?: Date, _endDate?: Date): Promise<GymClass[]> => {
    const response = await api.get('/classes');
    // Ensure we are working with an array
    const data = Array.isArray(response.data) ? response.data : 
                 (response.data?.success && Array.isArray(response.data.data) ? response.data.data : []);
    return data.map(mapBackendClassToFrontend);
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    const response = await api.get(`/members/${userId}/bookings`);
    return response.data;
};

export const bookClass = async (classId: string, userId: string, classDate?: string): Promise<Booking> => {
    const response = await api.post('/classes/book', { classId, userId, classDate });
    return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await api.delete(`/bookings/${bookingId}`);
};
