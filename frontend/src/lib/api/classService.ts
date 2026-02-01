

// Types
export type ClassType = 'Yoga' | 'HIIT' | 'Pilates' | 'Spin' | 'Strength' | 'Zumba' | 'CrossFit';

export interface GymClass {
    id: string;
    name: string;
    description: string;
    trainerName: string;
    trainerId: string;
    startTime: string; // ISO string
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
    gymClass: GymClass; // Embedded for convenience in UI
}

// Mock Data
const MOCK_CLASSES: GymClass[] = [
    {
        id: '1',
        name: 'Morning Yoga Flow',
        description: 'Start your day with a energizing yoga flow focused on flexibility and breathing.',
        trainerName: 'Sarah Jenkins',
        trainerId: 't1',
        startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), // Today 8 AM
        duration: 60,
        capacity: 20,
        bookedCount: 15,
        type: 'Yoga',
        location: 'Studio A'
    },
    {
        id: '2',
        name: 'High Intensity Interval Training',
        description: 'Burn calories fast with this intense full-body workout.',
        trainerName: 'Mike Tyson',
        trainerId: 't2',
        startTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(), // Today 5:30 PM
        duration: 45,
        capacity: 15,
        bookedCount: 15, // Full
        type: 'HIIT',
        location: 'Studio B'
    },
    {
        id: '3',
        name: 'Spin Revolution',
        description: 'High energy cycling class with upbeat music.',
        trainerName: 'Emily Blunt',
        trainerId: 't3',
        startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
        duration: 45,
        capacity: 25,
        bookedCount: 10,
        type: 'Spin',
        location: 'Cycle Room'
    }
];

const MOCK_BOOKINGS: Booking[] = [];

// Service
export const getClasses = async (_startDate: Date, _endDate: Date): Promise<GymClass[]> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Filter mocks by date range if needed, for now return all for demo
            resolve(MOCK_CLASSES);
        }, 500);
    });
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_BOOKINGS.filter(b => b.memberId === userId && b.status !== 'cancelled'));
        }, 500);
    });
};

export const bookClass = async (classId: string, userId: string): Promise<Booking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const gymClass = MOCK_CLASSES.find(c => c.id === classId);
            if (!gymClass) {
                reject(new Error('Class not found'));
                return;
            }
            if (gymClass.bookedCount >= gymClass.capacity) {
                reject(new Error('Class is full'));
                return;
            }

            // Check if already booked
            const existing = MOCK_BOOKINGS.find(b => b.classId === classId && b.memberId === userId && b.status !== 'cancelled');
            if (existing) {
                reject(new Error('You are already booked for this class'));
                return;
            }

            const newBooking: Booking = {
                id: Math.random().toString(36).substr(2, 9),
                classId,
                memberId: userId,
                bookingDate: new Date().toISOString(),
                status: 'confirmed',
                gymClass: { ...gymClass }
            };

            MOCK_BOOKINGS.push(newBooking);
            gymClass.bookedCount++; // Update local mock state

            resolve(newBooking);
        }, 800);
    });
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const bookingIndex = MOCK_BOOKINGS.findIndex(b => b.id === bookingId);
            if (bookingIndex > -1) {
                MOCK_BOOKINGS[bookingIndex].status = 'cancelled';
                // Decrease count
                const cls = MOCK_CLASSES.find(c => c.id === MOCK_BOOKINGS[bookingIndex].classId);
                if (cls) cls.bookedCount--;
            }
            resolve();
        }, 500);
    });
};
