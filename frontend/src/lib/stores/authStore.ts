import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { AxiosError } from 'axios';

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
    _id?: string;
    memberNumber?: string;
    userId?: string;
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
    login: (user: User, token: string, member?: Member) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateMember: (member: Partial<Member>) => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            member: null,
            token: null,
            isAuthenticated: false,
            login: (user: User, token: string, member?: Member) => set({ user, token, member, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, member: null, isAuthenticated: false }),
            updateUser: (userData: Partial<User>) =>
                set((state: AuthState) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
            updateMember: (memberData: Partial<Member>) =>
                set((state: AuthState) => ({
                    member: state.member ? { ...state.member, ...memberData } : memberData as Member,
                })),
            fetchProfile: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const response = await api.get<{ success: boolean; user: User; member: Member }>('/auth/profile');
                    if (response.data.success) {
                        const { user, member } = response.data;
                        set({ user, member, isAuthenticated: true });
                        console.log('✅ Profile synced');
                    }
                } catch (error) {
                    const axiosError = error as AxiosError;
                    console.error('❌ Profile sync failed:', axiosError.message);
                    if (axiosError.response?.status === 401) {
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
