import api from './axios';

// Types
export type ClassType = 'Yoga' | 'HIIT' | 'Pilates' | 'Spin' | 'Strength' | 'Zumba' | 'CrossFit';

export interface GymClass {
    id: string;
    _id?: string; // Support for MongoDB _id
    name: string;
    description: string;
    trainerName: string;
    trainerId: string;
    startTime: string; // ISO string or formatted string
    duration: number; // minutes
    capacity: number;
    bookedCount: number;
    type: ClassType;
    location: string;
    image?: string;
}

export interface Booking {
    id: string;
    classId: string;
    memberId: string;
    bookingDate: string;
    status: 'confirmed' | 'waitlist' | 'cancelled';
    gymClass: GymClass;
}

// Service mapping helper
const mapBackendClassToFrontend = (cls: any): GymClass => {
    // Determine a start time ISO string from the schedule object if possible
    // For now, we'll provide a fallback if a full ISO date isn't stored in the DB
    return {
        id: cls._id || cls.id,
        name: cls.name,
        description: cls.description || '',
        trainerName: cls.trainer?.user ? `${cls.trainer.user.firstName} ${cls.trainer.user.lastName}` : 'Unknown Trainer',
        trainerId: cls.trainer?._id || '',
        startTime: cls.startTime || new Date().toISOString(), // Fallback to now if missing
        duration: cls.duration || 60,
        capacity: cls.capacity || 20,
        bookedCount: cls.enrolled || 0,
        type: (cls.type || 'Strength') as ClassType,
        location: cls.location || 'Main Gym',
        image: cls.image
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

export const bookClass = async (classId: string, userId: string): Promise<Booking> => {
    const response = await api.post('/classes/book', { classId, userId });
    return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await api.delete(`/bookings/${bookingId}`);
};
