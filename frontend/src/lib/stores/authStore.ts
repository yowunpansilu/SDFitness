import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export interface User {
    id: string;
    _id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'member' | 'trainer' | 'admin';
    avatar?: string;
}

export interface Member {
    _id: string;
    memberNumber?: string;
    userId: string;
    dateOfBirth?: string | Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    height?: { value: number; unit: string };
    currentWeight?: { value: number; unit: string };
    targetWeight?: { value: number; unit: string };
    bodyFatPercentage?: number;
    fitnessGoals?: string[];
    activityLevel?: string;
    dietaryPreferences?: string[];
    allergies?: string[];
    dietBudget?: {
        amount: number;
        currency: string;
        period: string;
    };
    notificationPreferences?: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    notes?: string;
    bmi?: number;
    status?: string;
    membershipType?: string;
}

interface AuthState {
    user: User | null;
    member: Member | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string, member?: any) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateMember: (member: any) => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            member: null,
            token: null,
            isAuthenticated: false,
            login: (user, token, member) => set({ user, token, member, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, member: null, isAuthenticated: false }),
            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
            updateMember: (memberData) =>
                set((state) => ({
                    member: state.member ? { ...state.member, ...memberData } : memberData,
                })),
            fetchProfile: async () => {
                const { token } = (get as any)();
                if (!token) return;

                try {
                    const response = await api.get('/auth/profile');
                    if (response.data.success) {
                        const { user, member } = response.data;
                        set({ user, member, isAuthenticated: true });
                        console.log('✅ Profile synced');
                    }
                } catch (error: any) {
                    console.error('❌ Profile sync failed:', error.message);
                    if (error.response?.status === 401) {
                        set({ user: null, member: null, token: null, isAuthenticated: false });
                    }
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
