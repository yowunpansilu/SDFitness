import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';

export interface NutritionItem {
    foodName: string;
    quantity?: number;
    unit?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface NutritionLog {
    _id: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: NutritionItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    date: string;
}

export function useDailyNutrition(date?: string) {
    const { member, token } = useAuthStore();
    const memberId = member?._id;

    return useQuery({
        queryKey: ['nutrition-daily', memberId, date],
        queryFn: async () => {
            const response = await api.get(`/nutrition/member/${memberId}/daily`, {
                params: { date }
            });
            return response.data;
        },
        enabled: !!token && !!memberId,
    });
}

export function useLogMeal() {
    const queryClient = useQueryClient();
    const { member } = useAuthStore();

    return useMutation({
        mutationFn: async (data: { mealType: string; items: NutritionItem[] }) => {
            const response = await api.post('/nutrition', {
                ...data,
                memberId: member?._id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-daily'] });
            queryClient.invalidateQueries({ queryKey: ['member-stats'] });
            queryClient.invalidateQueries({ queryKey: ['member-badges'] });
        }
    });
}
