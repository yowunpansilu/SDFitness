import type { ShoppingItem } from '@/lib/api/dietPlanApi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface ShoppingListProps {
    items: ShoppingItem[];
    onToggleItem: (itemId: string) => void;
}

export function ShoppingList({ items, onToggleItem }: ShoppingListProps) {
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ShoppingItem[]>);

    const handleExport = () => {
        const text = Object.entries(groupedItems)
            .map(([category, categoryItems]) => {
                const itemsList = categoryItems
                    .map(item => `  - ${item.name} (${item.quantity})`)
                    .join('\n');
                return `${category}:\n${itemsList}`;
            })
            .join('\n\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-list.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="border-dark-700">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Shopping List</CardTitle>
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
                            <h3 className="font-semibold text-white mb-3">{category}</h3>
                            <div className="space-y-2">
                                {categoryItems.map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-dark-800 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => onToggleItem(item.id)}
                                            className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                        />
                                        <span className={`flex-1 text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-300'
                                            }`}>
                                            {item.name}
                                        </span>
                                        <span className="text-sm text-gray-500">{item.quantity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
