import { useActiveDietPlan } from '../../hooks/queries/useDietQueries';
import { MacroRing } from '../../components/diet/MacroRing';
import { MealLog } from '../../components/diet/MealLog';
import { AppSkeleton } from '../../components/ui/AppSkeleton';
import { Flame, Loader2 } from 'lucide-react';
import type { DietPlan, DayPlan, Meal } from '@/lib/api/dietPlanApi';

export function DietPage() {
  const { data: dietPlan, isLoading, error } = useActiveDietPlan() as { 
    data: DietPlan | null, 
    isLoading: boolean, 
    error: any 
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <p className="text-red-400 mb-4">Failed to load nutrition data.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-brand"
        >
          Retry
        </button>
      </div>
    );
  }

  const targetCalories = dietPlan?.targetCalories || 2000;
  const consumedCalories = 0; 
  const remaining = targetCalories - consumedCalories;

  const macroSplit = dietPlan?.macroSplit || { 
    protein: { grams: 0, percentage: 0 }, 
    carbs: { grams: 0, percentage: 0 }, 
    fats: { grams: 0, percentage: 0 } 
  };
  
  // Get today's plan (default to day 0 if not found)
  const today = new Date().getDay(); // 0 is Sunday
  const todayPlan: DayPlan | undefined = dietPlan?.days.find(d => d.dayOfWeek === today) || dietPlan?.days[0];

  const meals = todayPlan?.meals.map((m: Meal) => ({
    type: (m.mealType.split('_')[0].charAt(0).toUpperCase() + m.mealType.split('_')[0].slice(1)) as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks',
    calories: m.calories,
    items: m.items.map(f => `${f.food} (${f.quantity}${f.unit || ''})`)
  })) || [];

  return (
    <div className="pb-32 page-animate-in">
      <header className="px-6 py-6 pt-10">
        <h1 className="font-headline text-3xl font-bold text-white">Nutrition</h1>
        <p className="text-ink-muted mt-1">
          {dietPlan?.name || 'No active plan'}
        </p>
      </header>

      {/* Hero Calorie Section */}
      <section className="px-6 mb-8">
        <AppSkeleton name="diet-hero" loading={isLoading}>
          <div className="diet-hero-card">
            <div className="diet-hero-card__header flex items-center gap-2 mb-6">
              <Flame className="text-brand" size={24} />
              <h2 className="font-headline font-bold text-xl text-white">Daily Target</h2>
            </div>
            
            <div className="flex flex-col items-center mb-8 relative">
              <span className="text-5xl font-headline font-black text-white">{remaining}</span>
              <span className="text-sm font-bold text-ink-muted tracking-widest uppercase mt-1">kcal Remaining</span>
            </div>

            {/* Macros Row */}
            <div className="flex justify-between px-4">
              <MacroRing 
                label="Carbs" 
                value={0} 
                total={macroSplit.carbs.grams} 
                colorClass="stroke-energy" 
              />
              <MacroRing 
                label="Protein" 
                value={0} 
                total={macroSplit.protein.grams} 
                colorClass="stroke-brand" 
              />
              <MacroRing 
                label="Fats" 
                value={0} 
                total={macroSplit.fats.grams} 
                colorClass="stroke-cta" 
              />
            </div>
          </div>
        </AppSkeleton>
      </section>

      {/* Meals Summary List */}
      <section className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="section-title mb-0">Today's Recommended Meals</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          ) : meals.length > 0 ? (
            meals.map((meal, idx) => (
              <MealLog 
                key={`${meal.type}-${idx}`} 
                type={meal.type === 'Breakfast' || meal.type === 'Lunch' || meal.type === 'Dinner' || meal.type === 'Snacks' ? meal.type : 'Snacks'} 
                calories={meal.calories} 
                items={meal.items} 
                isLoading={isLoading} 
              />
            ))
          ) : (
            <div className="p-8 text-center text-ink-muted bg-surface/30 rounded-3xl border border-white/5">
              No meals planned for today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
