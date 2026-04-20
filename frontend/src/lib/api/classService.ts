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
    price?: number;
    priceLKR?: number;
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
        trainerName: cls.trainer?.userId ? `${cls.trainer.userId.firstName} ${cls.trainer.userId.lastName}` : 'Unknown Trainer',
        trainerId: cls.trainer?._id || '',
        startTime: cls.startTime || '',
        duration: cls.duration || 60,
        capacity: cls.capacity || 20,
        bookedCount: cls.enrolled || 0,
        type: (cls.type || 'Strength') as ClassType,
        location: cls.location || 'Main Gym',
        image: cls.image,
        price: cls.price || 0,
        priceLKR: cls.price || 0,
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
    return response.data.map((b: any) => ({
        ...b,
        classId: b.classId || b.class?._id || b.class,
        gymClass: b.gymClass || (b.class ? mapBackendClassToFrontend(b.class) : undefined)
    }));
};

export const bookClass = async (classId: string, userId: string, classDate?: string): Promise<Booking> => {
    const response = await api.post('/classes/book', { classId, userId, classDate });
    return response.data;
};

export const initiateClassPayment = async (classId: string, classDate: string, userId: string): Promise<{ checkoutUrl: string }> => {
    const response = await api.post('/payments/class-booking', { classId, classDate, userId });
    return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await api.delete(`/bookings/${bookingId}`);
};
