import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'member' | 'trainer' | 'admin';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    member: any | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string, member?: any) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateMember: (member: any) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
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
        }),
        {
            name: 'auth-storage',
        }
    )
);
