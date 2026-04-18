import { create } from 'zustand';
import type { DietPlan } from '../api/dietPlanApi';
import { updateDietPlan, saveDietPlan as savePlanApi } from '../api/dietPlanApi';

interface DietStore {
    currentPlan: DietPlan | null;
    isSaving: boolean;
    lastError: string | null;
    // Actions
    setCurrentPlan: (plan: DietPlan | null) => void;
    updateCurrentPlan: (updates: Partial<DietPlan>) => void;
    saveGeneratedPlan: (plan: DietPlan) => Promise<DietPlan>;
    persistChanges: () => Promise<void>;
}

let autoSaveTimer: any = null;

export const useDietStore = create<DietStore>((set, get) => ({
    currentPlan: null,
    isSaving: false,
    lastError: null,

    setCurrentPlan: (plan: DietPlan | null) => {
        set({ currentPlan: plan, lastError: null });
    },

    updateCurrentPlan: (updates: Partial<DietPlan>) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedPlan = { ...currentPlan, ...updates };
        set({ currentPlan: updatedPlan });

        // Trigger debounced auto-save
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        
        autoSaveTimer = setTimeout(() => {
            get().persistChanges();
        }, 1500);
    },

    saveGeneratedPlan: async (plan: DietPlan) => {
        set({ isSaving: true, lastError: null });
        try {
            const saved = await savePlanApi(plan);
            set({ currentPlan: saved });
            return saved;
        } catch (error: any) {
            set({ lastError: error.message });
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    persistChanges: async () => {
        const { currentPlan, isSaving } = get();
        if (!currentPlan?._id || isSaving) return;

        set({ isSaving: true, lastError: null });
        try {
            await updateDietPlan(currentPlan._id, currentPlan);
            console.log('✨ Diet plan auto-saved (background)');
        } catch (error: any) {
            console.error('❌ Background save failed:', error);
            set({ lastError: error.message });
        } finally {
            set({ isSaving: false });
        }
    }
}));
