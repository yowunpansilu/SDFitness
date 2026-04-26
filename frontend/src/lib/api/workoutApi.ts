import api from './axios';

// Types for workout data structures
export interface Exercise {
    exerciseId: string;
    name?: string;
    sets: ExerciseSet[];
    notes?: string;
}

export interface ExerciseSet {
    setNumber: number;
    reps?: number;
    weight?: number;
    duration?: number; // seconds
    completed: boolean;
}

export interface WorkoutTemplate {
    _id?: string;
    templateId: string;
    name: string;
    description?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'strength' | 'cardio' | 'hiit' | 'endurance' | 'flexibility' | 'full_body' | 'upper_body' | 'lower_body' | 'core';
    duration: number; // minutes
    exercises: TemplateExercise[];
    estimatedCaloriesBurned: number;
    rating: {
        average: number;
        count: number;
    };
}

export interface TemplateExercise {
    exerciseId: string;
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
    restPeriod: number;
    weight?: number;
    notes?: string;
    muscleGroups?: string[];
}

export interface Workout {
    _id?: string;
    workoutId: string;
    memberId: string;
    templateId?: string;
    workoutDate: Date | string;
    startTime?: Date | string;
    endTime?: Date | string;
    duration: number; // minutes
    exercises: Exercise[];
    totalCaloriesBurned: number;
    personalRecords?: PersonalRecord[];
    difficulty?: 'too_easy' | 'just_right' | 'too_hard';
    energyLevel?: 'low' | 'medium' | 'high';
    notes?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'skipped';
}

export interface PersonalRecord {
    exerciseId: string;
    exerciseName?: string;
    recordType: 'max_weight' | 'max_reps' | 'longest_duration';
    value: number;
    achievedAt: Date | string;
}

export interface WorkoutStats {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    averageDuration: number;
    thisWeek?: number;
    thisMonth?: number;
}

export interface WorkoutFilters {
    difficulty?: string;
    category?: string;
    muscleGroup?: string;
}

export interface WorkoutHistoryParams {
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

// API Functions

/**
 * Get workout templates with optional filters
 */
export async function getWorkoutTemplates(filters?: WorkoutFilters): Promise<WorkoutTemplate[]> {
    const response = await api.get('/workouts/templates', { params: filters });
    return response.data.data;
}

/**
 * Log a new workout
 */
export async function logWorkout(workoutData: {
    memberId: string;
    templateId?: string;
    workoutDate: Date;
    exercises: Exercise[];
    notes?: string;
    difficulty?: 'too_easy' | 'just_right' | 'too_hard';
    energyLevel?: 'low' | 'medium' | 'high';
}): Promise<Workout> {
    const response = await api.post('/workouts', workoutData);
    return response.data.data;
}

/**
 * Get workout history for a member
 */
export async function getWorkoutHistory(
    memberId: string,
    params?: WorkoutHistoryParams
): Promise<{ data: Workout[]; stats: WorkoutStats }> {
    const response = await api.get(`/workouts/member/${memberId}`, { params });
    return {
        data: response.data.data,
        stats: response.data.stats,
    };
}

/**
 * Get workout statistics for a member
 */
export async function getWorkoutStats(memberId: string): Promise<WorkoutStats> {
    const response = await api.get(`/workouts/member/${memberId}/stats`);
    return response.data.data;
}

/**
 * Get a specific workout by ID
 */
export async function getWorkoutById(workoutId: string): Promise<Workout> {
    const response = await api.get(`/workouts/${workoutId}`);
    return response.data.data;
}

/**
 * Update a workout
 */
export async function updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<Workout> {
    const response = await api.put(`/workouts/${workoutId}`, updates);
    return response.data.data;
}

/**
 * Delete a workout
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
    await api.delete(`/workouts/${workoutId}`);
}

/**
 * Get approved AI Workouts for member
 */
export async function getMemberApprovedWorkouts(memberId: string): Promise<WorkoutTemplate[]> {
    const response = await api.get(`/workouts/member/${memberId}/approved`);
    return response.data.data;
}

/**
 * Get 30-day aggregated workout history (for progress chart)
 */
export async function getWorkoutHistory30Days(memberId: string): Promise<{
    data: Array<{ date: string; calories: number; duration: number; count: number }>;
    workouts: Workout[];
}> {
    const response = await api.get(`/workouts/member/${memberId}/history30`);
    return response.data;
}

/**
 * Update member approved AI workout template (Rename)
 */
export async function updateWorkoutTemplate(templateId: string, updates: { name: string }): Promise<WorkoutTemplate> {
    const response = await api.patch(`/workouts/templates/${templateId}`, updates);
    return response.data.data;
}

/**
 * Delete a workout template
 */
export async function deleteWorkoutTemplate(templateId: string): Promise<void> {
    await api.delete(`/workouts/templates/${templateId}`);
}
