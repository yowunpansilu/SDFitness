import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';
import type { Member } from '@/lib/stores/authStore';

export function useMemberProfile() {
    const { user, token } = useAuthStore();
    
    return useQuery({
        queryKey: ['member-profile', user?._id],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: Member }>('/members/profile');
            return response.data.data;
        },
        enabled: !!token && !!user,
    });
}

export function useMemberStats() {
    const { member, token } = useAuthStore();
    const memberId = member?._id;

    return useQuery({
        queryKey: ['member-stats', memberId],
        queryFn: async () => {
            const response = await api.get(`/workouts/member/${memberId}/stats`);
            return response.data;
        },
        enabled: !!token && !!memberId,
    });
}
