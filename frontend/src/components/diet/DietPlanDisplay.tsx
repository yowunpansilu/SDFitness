import { useState, useMemo, useEffect } from 'react';
import { Save, Brain, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { MealCard } from './MealCard';
import { ShoppingList } from './ShoppingList';
import { MacroWheel } from './MacroWheel';
import { WeeklyTimeline } from './WeeklyTimeline';
import { RecipeModal } from './RecipeModal';
import type { DietPlan, ShoppingListData, ShoppingItem } from '@/lib/api/dietPlanApi';
import { cn } from '@/lib/utils';

interface DietPlanDisplayProps {
    plan: DietPlan;
    onSave?: () => void;
    onChange?: (updates: Partial<DietPlan>) => void;
    isSaving?: boolean;
}

export function DietPlanDisplay({ plan, onSave, onChange, isSaving }: DietPlanDisplayProps) {
    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

    // Normalize shopping list
    const rawShoppingList = plan.shoppingList;
    const isNewFormat = rawShoppingList && 'items' in rawShoppingList && !Array.isArray(rawShoppingList);
    const shoppingData = isNewFormat ? rawShoppingList as ShoppingListData : null;
    const shoppingItems: ShoppingItem[] = useMemo(() => {
        if (isNewFormat) {
            return (rawShoppingList as ShoppingListData).items.map((item, i) => ({
                ...item,
                id: item.id || String(i),
                checked: item.checked ?? false
            }));
        }
        return (rawShoppingList as ShoppingItem[]) || [];
    }, [rawShoppingList, isNewFormat]);

    const [items, setItems] = useState(shoppingItems);

    // Sync from props if plan changes (e.g. after remote save)
    useEffect(() => {
        setItems(shoppingItems);
    }, [shoppingItems]);

    const toggleShoppingItem = (itemId: string) => {
        const newItems = items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        setItems(newItems);

        // Notify parent of change
        if (onChange) {
            if (isNewFormat) {
                onChange({
                    shoppingList: {
                        ...(rawShoppingList as ShoppingListData),
                        items: newItems
                    }
                });
            } else {
                onChange({ shoppingList: newItems });
            }
        }
    };

    // Prepare Timeline Data
    const timelineDays = useMemo(() => {
        if (plan.days && plan.days.length > 0) {
            const startDate = plan.createdAt ? new Date(plan.createdAt) : new Date();
            return plan.days.map((day, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                return {
                    dayName: day.dayName?.substring(0, 3) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                    date: date.getDate(),
                    progress: 0, // No longer mocked
                    isActive: i === activeDayIdx
                };
            });
        }
        // Fallback for legacy format
        return Array.from({ length: 7 }, (_, i) => ({
            dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            date: 23 + i,
            progress: 0.5,
            isActive: i === activeDayIdx
        }));
    }, [plan.days, plan.createdAt, activeDayIdx]);

    const activeDay = plan.days?.[activeDayIdx];
    const dailyCalories = activeDay?.totalCalories || activeDay?.meals?.reduce((s, m) => s + (m.calories || 0), 0) || 2000;
    const dailyProtein = activeDay?.meals?.reduce((s, m) => s + (m.macros?.protein || m.protein || 0), 0) || 120;
    const dailyCarbs = activeDay?.meals?.reduce((s, m) => s + (m.macros?.carbs || m.carbs || 0), 0) || 250;
    const dailyFats = activeDay?.meals?.reduce((s, m) => s + (m.macros?.fats || m.fats || 0), 0) || 70;

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-[2rem] border border-primary-50">
                <div>
                    <h1 className="text-4xl font-headline font-black text-primary-900 leading-tight">
                        Weekly Overview & Daily Meals
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                        <Sparkles className="w-4 h-4 text-secondary-500" />
                        {plan.planName || plan.name || 'Personalized Health Strategy'} • Generated on {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {onSave && (
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className={cn(
                                "h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg transition-all",
                                isSaving ? "bg-muted" : "bg-white border-primary-500 border-2 text-primary-900 hover:bg-primary-50 shadow-primary-900/5"
                            )}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-secondary-500" />}
                            {isSaving ? 'Saving...' : 'Save Plan'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start">

                {/* Left Column: Plan Content */}
                <div className="space-y-8 min-w-0">

                    {/* Weekly Timeline */}
                    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary-900/5 bg-white/80 overflow-hidden">
                        <CardHeader className="pb-2 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-primary-900">Weekly Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <WeeklyTimeline
                                days={timelineDays}
                                activeDay={activeDayIdx}
                                onDaySelect={setActiveDayIdx}
                            />
                        </CardContent>
                    </Card>

                    {/* Stats & Macro Wheel */}
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                        {/* Daily Totals Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="flex flex-col items-center justify-center p-4 rounded-3xl bg-secondary-50 border-2 border-secondary-500 shadow-lg shadow-secondary-500/10">
                                <span className="text-3xl font-black text-secondary-600">{Math.round(dailyCalories)}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">Total Kcal</span>
                            </Card>
                            <Card className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border-primary-50">
                                <span className="text-3xl font-black text-primary-900">{Math.round(dailyProtein)}g</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Protein</span>
                            </Card>
                            <Card className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border-primary-50">
                                <span className="text-3xl font-black text-primary-900">{Math.round(dailyCarbs)}g</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Carbs</span>
                            </Card>
                            <Card className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border-primary-50">
                                <span className="text-3xl font-black text-primary-900">{Math.round(dailyFats)}g</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Fats</span>
                            </Card>
                        </div>

                        {/* Macro Wheel Chart */}
                        <Card className="rounded-[2.5rem] bg-white border-none shadow-xl shadow-primary-900/5 flex items-center justify-center overflow-hidden h-[300px]">
                            <MacroWheel
                                calories={dailyCalories}
                                protein={dailyProtein}
                                carbs={dailyCarbs}
                                fats={dailyFats}
                            />
                        </Card>
                    </div>

                    {/* Daily Meals List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-primary-900">Today's Meals</h2>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                {timelineDays[activeDayIdx].dayName} • {timelineDays[activeDayIdx].date}
                            </span>
                        </div>
                        <div className="grid gap-4">
                            {activeDay?.meals?.map((meal, j) => (
                                <MealCard
                                    key={`${activeDayIdx}-${j}`}
                                    meal={meal}
                                    onMakeNow={(m) => {
                                        setSelectedMeal(m);
                                        setIsRecipeModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <Card className="rounded-[2rem] border-primary-100 bg-white p-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                            <Brain className="w-24 h-24 text-primary-100" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-2xl shadow-sm">
                                <Sparkles className="w-6 h-6 text-secondary-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary-900 mb-2">AI Generated Insights</h3>
                                <p className="text-primary-800 leading-relaxed max-w-[90%]">
                                    Your {timelineDays[activeDayIdx].dayName} plan focus is <strong>{plan.goal === 'LOSE_WEIGHT' ? 'Metabolic Efficiency' : 'Hypertrophy Activation'}</strong>.
                                    The chicken breast provides 45% of your daily protein, optimized with complex carbohydrates to sustain energy during your planned activity levels.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Shopping List (Desktop) */}
                <div className="hidden lg:block sticky top-8 h-[calc(100vh-120px)] lg:h-[800px]">
                    <ShoppingList
                        items={items}
                        onToggleItem={toggleShoppingItem}
                        priceData={shoppingData}
                    />
                </div>

            </div>

            {/* Mobile Shopping List Floating Button & Drawer */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="gym" className="h-16 w-16 rounded-full shadow-2xl shadow-primary-900/30 bg-primary-600 hover:bg-primary-700 p-0 text-white flex items-center justify-center relative transition-transform hover:scale-110 active:scale-95">
                            <ShoppingBag className="w-7 h-7" />
                            {items.filter(i => !i.checked).length > 0 && (
                                <span className="absolute top-0 right-0 max-w-[24px] min-w-[20px] h-5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center translate-x-1 -translate-y-1 text-white shadow-sm">
                                    {items.filter(i => !i.checked).length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-[2.5rem] bg-slate-50 border-none shadow-2xl">
                        <SheetTitle className="sr-only">Shopping List</SheetTitle>
                        <SheetDescription className="sr-only">
                            Your grocery items based on the generated diet plan
                        </SheetDescription>
                        <div className="h-full overflow-y-auto p-4 pb-12 pt-6">
                            <ShoppingList
                                items={items}
                                onToggleItem={toggleShoppingItem}
                                priceData={shoppingData}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            {/* Recipe Modal */}
            <RecipeModal
                meal={selectedMeal}
                open={isRecipeModalOpen}
                onOpenChange={setIsRecipeModalOpen}
            />
        </div>
    );
}

