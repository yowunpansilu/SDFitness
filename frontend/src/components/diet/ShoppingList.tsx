import type { ShoppingItem, ShoppingListData } from '@/lib/api/dietPlanApi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

interface ShoppingListProps {
    items: ShoppingItem[];
    onToggleItem: (itemId: string) => void;
    priceData?: ShoppingListData | null;
}

export function ShoppingList({ items, onToggleItem, priceData }: ShoppingListProps) {
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, ShoppingItem[]>);

    const categoryLabels: Record<string, string> = {
        protein: '🥩 Protein',
        carbs: '🌾 Carbs & Grains',
        vegetable: '🥬 Vegetables',
        fruit: '🍌 Fruits',
        dairy: '🥛 Dairy',
        fats: '🫒 Fats & Oils',
        Other: '📦 Other',
        Grains: '🌾 Grains',
        Supplements: '💊 Supplements',
        Fruits: '🍌 Fruits',
        Spreads: '🧈 Spreads',
        Protein: '🥩 Protein',
        Vegetables: '🥬 Vegetables',
        Produce: '🥑 Produce',
        Dairy: '🥛 Dairy',
    };

    const handleExport = () => {
        const lines: string[] = [];
        if (priceData) {
            lines.push(`Shopping List — ${priceData.currency} ${priceData.currentTotal?.toLocaleString()} total`);
            lines.push('');
        }

        Object.entries(groupedItems).forEach(([category, categoryItems]) => {
            lines.push(`${categoryLabels[category] || category}:`);
            categoryItems.forEach(item => {
                const price = item.currentPrice ? ` — ${priceData?.currency || 'LKR'} ${item.currentPrice.toFixed(0)}` : '';
                lines.push(`  ${item.checked ? '✓' : '○'} ${item.name} (${item.quantity}${item.unit || ''})${price}`);
            });
            lines.push('');
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-list.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="border-border">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-foreground">Shopping List</CardTitle>
                        {priceData && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {priceData.currency} {priceData.currentTotal?.toLocaleString()} total for 7 days
                                {priceData.priceChanged && (
                                    <span className="text-yellow-500 ml-2">• Prices have changed</span>
                                )}
                            </p>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-foreground mb-3">
                                {categoryLabels[category] || category}
                            </h3>
                            <div className="space-y-2">
                                {categoryItems.map((item) => {
                                    const priceChanged = item.currentPrice && item.priceAtGeneration &&
                                        item.currentPrice !== item.priceAtGeneration;
                                    const priceIncreased = priceChanged && (item.currentPrice || 0) > (item.priceAtGeneration || 0);

                                    return (
                                        <label
                                            key={item.id}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-card cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => onToggleItem(item.id)}
                                                className="w-4 h-4 rounded border-border bg-muted text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                            />
                                            <span className={`flex-1 text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.quantity}{item.unit ? item.unit : ''}
                                            </span>
                                            {item.currentPrice != null && (
                                                <span className={`text-sm font-medium min-w-[70px] text-right ${priceChanged
                                                        ? (priceIncreased ? 'text-red-400' : 'text-green-400')
                                                        : 'text-muted-foreground'
                                                    }`}>
                                                    {priceData?.currency || 'LKR'} {item.currentPrice.toFixed(0)}
                                                    {priceChanged && (
                                                        priceIncreased
                                                            ? <TrendingUp className="w-3 h-3 inline ml-1" />
                                                            : <TrendingDown className="w-3 h-3 inline ml-1" />
                                                    )}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
