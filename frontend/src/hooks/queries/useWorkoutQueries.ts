import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/authStore';

export interface Exercise {
    name: string;
    sets: number;
    reps: string | number;
    weight?: number;
    duration?: number;
}

export interface WorkoutTemplate {
    _id: string;
    name: string;
    description?: string;
    exercises: Exercise[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    category: string;
    image?: string;
}

export function useWorkoutTemplates() {
    return useQuery({
        queryKey: ['workout-templates'],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: WorkoutTemplate[] }>('/workouts/templates');
            return response.data.data;
        },
    });
}

export function useWorkoutHistory() {
    const { member, token } = useAuthStore();
    const memberId = member?._id;

    return useQuery({
        queryKey: ['workout-history', memberId],
        queryFn: async () => {
            const response = await api.get(`/workouts/member/${memberId}`);
            return response.data.data;
        },
        enabled: !!token && !!memberId,
    });
}

export function useLogWorkout() {
    const queryClient = useQueryClient();
    const { member } = useAuthStore();

    return useMutation({
        mutationFn: async (workoutData: Omit<WorkoutTemplate, '_id'> & { date?: string }) => {
            const response = await api.post('/workouts', {
                ...workoutData,
                memberId: member?._id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-history'] });
            queryClient.invalidateQueries({ queryKey: ['member-stats'] });
        }
    });
}
