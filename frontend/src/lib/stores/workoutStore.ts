import { create } from 'zustand';
import type { WorkoutTemplate, Workout, PersonalRecord, WorkoutStats } from '../api/workoutApi';

interface WorkoutState {
    // Templates
    templates: WorkoutTemplate[];
    selectedTemplate: WorkoutTemplate | null;
    templatesLoading: boolean;

    // Current workout session
    currentWorkout: Partial<Workout> | null;
    isWorkoutInProgress: boolean;
    workoutStartTime: Date | null;

    // History
    workoutHistory: Workout[];
    historyLoading: boolean;

    // Stats
    stats: WorkoutStats | null;
    statsLoading: boolean;

    // Personal Records
    personalRecords: PersonalRecord[];

    // Actions
    setTemplates: (templates: WorkoutTemplate[]) => void;
    setSelectedTemplate: (template: WorkoutTemplate | null) => void;
    setTemplatesLoading: (loading: boolean) => void;

    startWorkout: (template?: WorkoutTemplate) => void;
    updateCurrentWorkout: (workout: Partial<Workout>) => void;
    completeWorkout: () => void;
    cancelWorkout: () => void;

    setWorkoutHistory: (history: Workout[]) => void;
    addWorkoutToHistory: (workout: Workout) => void;
    setHistoryLoading: (loading: boolean) => void;

    setStats: (stats: WorkoutStats) => void;
    setStatsLoading: (loading: boolean) => void;

    setPersonalRecords: (records: PersonalRecord[]) => void;
    addPersonalRecord: (record: PersonalRecord) => void;

    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
    // Initial state
    templates: [],
    selectedTemplate: null,
    templatesLoading: false,

    currentWorkout: null,
    isWorkoutInProgress: false,
    workoutStartTime: null,

    workoutHistory: [],
    historyLoading: false,

    stats: null,
    statsLoading: false,

    personalRecords: [],

    // Actions
    setTemplates: (templates) => set({ templates }),
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setTemplatesLoading: (loading) => set({ templatesLoading: loading }),

    startWorkout: (template) => set({
        currentWorkout: template ? {
            templateId: template.templateId,
            exercises: template.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                name: ex.name,
                sets: Array.from({ length: ex.sets }, (_, i) => ({
                    setNumber: i + 1,
                    reps: ex.reps,
                    weight: ex.weight,
                    duration: ex.duration,
                    completed: false,
                })),
            })),
            status: 'in_progress' as const,
        } : {
            exercises: [],
            status: 'in_progress' as const,
        },
        isWorkoutInProgress: true,
        workoutStartTime: new Date(),
    }),

    updateCurrentWorkout: (workout) => set((state) => ({
        currentWorkout: state.currentWorkout ? { ...state.currentWorkout, ...workout } : workout,
    })),

    completeWorkout: () => set({
        currentWorkout: null,
        isWorkoutInProgress: false,
        workoutStartTime: null,
        selectedTemplate: null,
    }),

    cancelWorkout: () => set({
        currentWorkout: null,
        isWorkoutInProgress: false,
        workoutStartTime: null,
        selectedTemplate: null,
    }),

    setWorkoutHistory: (history) => set({ workoutHistory: history }),
    addWorkoutToHistory: (workout) => set((state) => ({
        workoutHistory: [workout, ...state.workoutHistory],
    })),
    setHistoryLoading: (loading) => set({ historyLoading: loading }),

    setStats: (stats) => set({ stats }),
    setStatsLoading: (loading) => set({ statsLoading: loading }),

    setPersonalRecords: (records) => set({ personalRecords: records }),
    addPersonalRecord: (record) => set((state) => ({
        personalRecords: [...state.personalRecords, record],
    })),

    reset: () => set({
        templates: [],
        selectedTemplate: null,
        templatesLoading: false,
        currentWorkout: null,
        isWorkoutInProgress: false,
        workoutStartTime: null,
        workoutHistory: [],
        historyLoading: false,
        stats: null,
        statsLoading: false,
        personalRecords: [],
    }),
}));
