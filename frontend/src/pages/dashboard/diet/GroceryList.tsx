import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Square, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDietPlan } from '@/lib/api/dietPlanApi';
import type { DietPlan, ShoppingItem } from '@/lib/api/dietPlanApi';

export function GroceryList() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<DietPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<ShoppingItem[]>([]);

    useEffect(() => {
        if (id) {
            getDietPlan(id)
                .then(p => {
                    setPlan(p);
                    // Extract items
                    const rawList = p.shoppingList;
                    const isNewFormat = rawList && 'items' in rawList && !Array.isArray(rawList);
                    const shoppingData = isNewFormat
                        // @ts-ignore
                        ? rawList.items.map((it: any, i: number) => ({ ...it, id: it.id || String(i), checked: it.checked ?? false }))
                        : (Array.isArray(rawList) ? rawList : []);
                    setItems(shoppingData);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const toggleItem = (itemId: string) => {
        setItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        );
    };

    if (isLoading) return <div className="text-white">Loading grocery list...</div>;
    if (!plan) return <div className="text-white">Plan not found.</div>;

    // Group items by category if possible
    const categories = Array.from(new Set(items.map(it => it.category || 'Other')));

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Button variant="link" className="text-gray-400 p-0 mb-2" onClick={() => navigate(`/dashboard/diet-plans/${plan.id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Weekly Plan
                    </Button>
                    <h1 className="text-3xl font-headline font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-primary-500" />
                        Grocery List
                    </h1>
                    <p className="text-gray-400 mt-1">
                        For 7-Day Plan: {plan.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-400">
                        Total items: {items.length} ({items.filter(it => it.checked).length} checked)
                    </span>
                </div>
            </div>

            {/* List */}
            {categories.length > 0 ? (
                <div className="space-y-6">
                    {categories.map(category => {
                        const catItems = items.filter(it => (it.category || 'Other') === category);
                        return (
                            <Card key={category} className="border-dark-700 bg-dark-800">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 border-b border-dark-600 pb-2">
                                        {category}
                                    </h2>
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {catItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleItem(item.id)}
                                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${item.checked
                                                    ? 'bg-dark-700/50 border-dark-600'
                                                    : 'bg-dark-700 border-dark-500 hover:border-primary-500/50'
                                                    }`}
                                            >
                                                {item.checked ? (
                                                    <CheckSquare className="w-5 h-5 text-primary-500 shrink-0" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-500 shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`font-medium ${item.checked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                        {item.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {item.quantity} {item.unit}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center p-12 bg-dark-800 rounded-lg border border-dark-700">
                    <p className="text-gray-400">No external items in grocery list.</p>
                </div>
            )}
        </div>
    );
}
