import api from '@/lib/api/axios';

export interface WorkoutTemplate {
    _id: string;
    templateId: string;
    memberId?: string | null;
    name: string;
    description: string;
    difficulty: string;
    category: string;
    duration: number;
    estimatedCaloriesBurned: number;
    status: 'pending_review' | 'approved' | 'rejected';
    aiGenerated: boolean;
    aiPrompt?: unknown;
    adminNotes?: string;
    exercises: unknown[];
}

export const generateWorkout = async (memberId: string, overrides: { targetDuration?: number, difficulty?: string, category?: string, notes?: string }) => {
    const response = await api.post('/workouts/admin/generate', { memberId, ...overrides });
    return response.data;
};

export const getAdminWorkouts = async (status?: string) => {
    const url = status ? `/workouts/admin/list?status=${status}` : '/workouts/admin/list';
    const response = await api.get(url);
    return response.data;
};

export const approveWorkout = async (id: string, adminNotes?: string) => {
    const response = await api.patch(`/workouts/admin/${id}/approve`, { adminNotes });
    return response.data;
};

export const rejectWorkout = async (id: string, adminNotes?: string) => {
    const response = await api.patch(`/workouts/admin/${id}/reject`, { adminNotes });
    return response.data;
};
