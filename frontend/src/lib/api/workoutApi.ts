import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

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
    workoutId: string;
    memberId: string;
    templateId?: string;
    workoutDate: Date;
    startTime?: Date;
    endTime?: Date;
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
    achievedAt: Date;
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
    try {
        const params = new URLSearchParams();
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.muscleGroup) params.append('muscleGroup', filters.muscleGroup);

        const response = await axios.get(`${API_URL}/workouts/templates?${params.toString()}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching workout templates:', error);
        throw error;
    }
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
    try {
        const response = await axios.post(`${API_URL}/workouts`, workoutData);
        return response.data.data;
    } catch (error) {
        console.error('Error logging workout:', error);
        throw error;
    }
}

/**
 * Get workout history for a member
 */
export async function getWorkoutHistory(
    memberId: string,
    params?: WorkoutHistoryParams
): Promise<{ data: Workout[]; stats: WorkoutStats }> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
        if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await axios.get(`${API_URL}/workouts/member/${memberId}?${queryParams.toString()}`);
        return {
            data: response.data.data,
            stats: response.data.stats,
        };
    } catch (error) {
        console.error('Error fetching workout history:', error);
        throw error;
    }
}

/**
 * Get workout statistics for a member
 */
export async function getWorkoutStats(memberId: string): Promise<WorkoutStats> {
    try {
        const response = await axios.get(`${API_URL}/workouts/member/${memberId}/stats`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching workout stats:', error);
        throw error;
    }
}

/**
 * Get a specific workout by ID
 */
export async function getWorkoutById(workoutId: string): Promise<Workout> {
    try {
        const response = await axios.get(`${API_URL}/workouts/${workoutId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching workout:', error);
        throw error;
    }
}

/**
 * Update a workout
 */
export async function updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<Workout> {
    try {
        const response = await axios.put(`${API_URL}/workouts/${workoutId}`, updates);
        return response.data.data;
    } catch (error) {
        console.error('Error updating workout:', error);
        throw error;
    }
}

/**
 * Delete a workout
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
    try {
        await axios.delete(`${API_URL}/workouts/${workoutId}`);
    } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
    }
}
