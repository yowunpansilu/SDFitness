import { useActiveDietPlan } from '../../hooks/queries/useDietQueries';
import { useDailyNutrition, useLogMeal } from '../../hooks/queries/useNutritionQueries';
import { MacroRing } from '../../components/diet/MacroRing';
import { MealLog } from '../../components/diet/MealLog';
import { AppSkeleton } from '../../components/ui/AppSkeleton';
import { Flame, Loader2, Plus, Utensils } from 'lucide-react';
import { useState } from 'react';
import type { DietPlan, DayPlan, Meal } from '@/lib/api/dietPlanApi';
import { useToast } from '../../hooks/use-toast';

export function DietPage() {
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  
  const { data: dietPlan, isLoading: isPlanLoading, error: planError } = useActiveDietPlan() as { 
    data: DietPlan | null, 
    isLoading: boolean, 
    error: any 
  };

  const { data: dailyStats, isLoading: isStatsLoading } = useDailyNutrition();
  const { mutate: logMeal, isPending: isLoggingPending } = useLogMeal();

  if (planError) {
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

  const isLoading = isPlanLoading || isStatsLoading;

  const targetCalories = dietPlan?.targetCalories || 2000;
  const consumedCalories = dailyStats?.totals?.calories || 0; 
  const remaining = Math.max(0, targetCalories - consumedCalories);

  const macroSplit = dietPlan?.macroSplit || { 
    protein: { grams: 150, percentage: 30 }, 
    carbs: { grams: 200, percentage: 40 }, 
    fats: { grams: 65, percentage: 30 } 
  };

  const consumedMacros = dailyStats?.totals || { protein: 0, carbs: 0, fats: 0 };
  
  // Get today's plan (default to day 0 if not found)
  const today = new Date().getDay(); // 0 is Sunday
  const todayPlan: DayPlan | undefined = dietPlan?.days.find(d => d.dayOfWeek === today) || dietPlan?.days[0];

  const meals = todayPlan?.meals.map((m: Meal) => ({
    type: (m.mealType.split('_')[0].charAt(0).toUpperCase() + m.mealType.split('_')[0].slice(1)) as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks',
    calories: m.calories,
    items: m.items.map(f => `${f.food} (${f.quantity}${f.unit || ''})`)
  })) || [];

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    logMeal({
      mealType,
      items: [{
        foodName,
        calories: parseInt(calories),
        protein: Math.round(parseInt(calories) * 0.1), // Proxy if not provided
        carbs: Math.round(parseInt(calories) * 0.1),
        fats: Math.round(parseInt(calories) * 0.05)
      }]
    }, {
      onSuccess: () => {
        toast({ title: "Meal Logged!", description: `${foodName} added to your ${mealType}.` });
        setIsLogging(false);
        setFoodName('');
        setCalories('');
      }
    });
  };

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
                value={consumedMacros.carbs} 
                total={macroSplit.carbs.grams} 
                colorClass="stroke-energy" 
              />
              <MacroRing 
                label="Protein" 
                value={consumedMacros.protein} 
                total={macroSplit.protein.grams} 
                colorClass="stroke-brand" 
              />
              <MacroRing 
                label="Fats" 
                value={consumedMacros.fats} 
                total={macroSplit.fats.grams} 
                colorClass="stroke-cta" 
              />
            </div>
          </div>
        </AppSkeleton>
      </section>

      {/* Log Meal Trigger */}
      <section className="px-6 mb-8">
        {!isLogging ? (
          <button 
            onClick={() => setIsLogging(true)}
            className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white font-bold hover:bg-white/10 transition-all"
          >
            <Plus size={20} className="text-brand" />
            Quick Log Intake
          </button>
        ) : (
          <form onSubmit={handleLogMeal} className="bg-surface/40 p-6 rounded-3xl border border-brand/20 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
              <Utensils className="text-brand" size={20} />
              <h3 className="text-white font-bold">What did you eat?</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <input 
                  type="text" 
                  placeholder="Food name (e.g. Chicken Salad)"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="bg-zinc-900 border-0 rounded-xl px-4 py-3 text-white placeholder-ink-muted text-sm focus:ring-1 focus:ring-brand"
                />
              </div>
              <input 
                type="number" 
                placeholder="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="bg-zinc-900 border-0 rounded-xl px-4 py-3 text-white placeholder-ink-muted text-sm focus:ring-1 focus:ring-brand"
              />
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="bg-zinc-900 border-0 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-brand"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={isLoggingPending}
                className="flex-1 bg-brand text-white font-bold py-3 rounded-xl shadow-lg shadow-brand/20 disabled:opacity-50"
              >
                {isLoggingPending ? 'Saving...' : 'Save Log'}
              </button>
              <button 
                type="button"
                onClick={() => setIsLogging(false)}
                className="px-6 bg-zinc-800 text-white font-bold py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
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
