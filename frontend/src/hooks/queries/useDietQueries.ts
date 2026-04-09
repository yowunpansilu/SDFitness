import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';
import type { DietPlan } from '@/lib/api/dietPlanApi';

export function useActiveDietPlan() {
    const { member, token } = useAuthStore();
    const memberId = member?._id;

    return useQuery({
        queryKey: ['active-diet-plan', memberId],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: DietPlan[] }>('/diet-plans', {
                params: { memberId }
            });
            // Find active or just return the latest one for now
            const plans = response.data.data;
            return plans.find(p => p.isActive) || plans[0] || null;
        },
        enabled: !!token && !!memberId,
    });
}

export function useSaveDietPlan() {
    const queryClient = useQueryClient();
    const { member } = useAuthStore();

    return useMutation({
        mutationFn: async (plan: Partial<DietPlan>) => {
            const response = await api.post('/diet-plans', {
                ...plan,
                memberId: member?._id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-diet-plan'] });
        }
    });
}
