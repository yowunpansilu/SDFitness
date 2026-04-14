import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';

export interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    earnedAt?: string;
}

export function useMemberBadges() {
    const { member, token } = useAuthStore();
    const memberId = member?._id;

    return useQuery({
        queryKey: ['member-badges', memberId],
        queryFn: async () => {
            const response = await api.get(`/badges/member/${memberId}`);
            return response.data.data as Badge[];
        },
        enabled: !!token && !!memberId,
    });
}

export function useAvailableBadges() {
    return useQuery({
        queryKey: ['available-badges'],
        queryFn: async () => {
            const response = await api.get('/badges');
            return response.data.data as Badge[];
        }
    });
}
