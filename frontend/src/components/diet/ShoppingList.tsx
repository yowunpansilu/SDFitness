import { useState } from 'react';
import {
    Package,
    Apple,
    Beef,
    Milk,
    Wheat,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    TrendingDown,
    Copy,
    Check,
    Sparkles
} from 'lucide-react';

import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import type { ShoppingItem, ShoppingListData } from '@/lib/api/dietPlanApi';

interface ShoppingListProps {
    items: ShoppingItem[];
    onToggleItem: (itemId: string) => void;
    priceData?: ShoppingListData | null;
}

export function ShoppingList({ items, onToggleItem, priceData }: ShoppingListProps) {
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Produce', 'Meat & Fish', 'Dairy', 'Protein', 'Vegetables']);
    const [copied, setCopied] = useState(false);

    // Map categories with icons
    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('fruit') || cat.includes('produce') || cat.includes('veg')) return <Apple className="w-5 h-5 text-green-500" />;
        if (cat.includes('protein') || cat.includes('meat') || cat.includes('fish')) return <Beef className="w-5 h-5 text-red-500" />;
        if (cat.includes('dairy') || cat.includes('milk')) return <Milk className="w-5 h-5 text-blue-500" />;
        if (cat.includes('grain') || cat.includes('carb') || cat.includes('bread')) return <Wheat className="w-5 h-5 text-amber-600" />;
        if (cat.includes('pantry') || cat.includes('spices')) return <Sparkles className="w-5 h-5 text-orange-500" />;
        return <Package className="w-5 h-5 text-muted-foreground" />;
    };

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
        const cat = item.category || 'Other';
        const displayCat = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (!acc[displayCat]) acc[displayCat] = [];
        acc[displayCat].push(item);
        return acc;
    }, {} as Record<string, ShoppingItem[]>);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const copyToClipboard = () => {
        const text = items
            .map(item => `- [${item.checked ? 'x' : ' '}] ${item.name}: ${item.quantity}${item.unit || ''}`)
            .join('\n');

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-6 flex flex-col h-full bg-white/50 rounded-3xl p-6 border border-primary-50">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-2xl font-bold text-primary-900 tracking-tight">
                        Weekly Shopping List
                    </h2>
                    {priceData && (
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            {items.filter(i => i.checked).length} of {items.length} items checked
                        </p>
                    )}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy List'}
                </button>
            </div>

            {/* Category Groups */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {Object.entries(groupedItems).map(([category, categoryItems]) => {
                    const isExpanded = expandedCategories.includes(category);
                    return (
                        <div key={category} className="group animate-fade-in">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                                    isExpanded ? "bg-primary-50/50" : "hover:bg-primary-50/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-primary-100">
                                        {getCategoryIcon(category)}
                                    </div>
                                    <span className="text-lg font-bold text-primary-900">{category}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-muted-foreground mr-2">{categoryItems.length} items</span>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-primary-400" /> : <ChevronDown className="w-5 h-5 text-primary-400" />}
                                </div>
                            </button>

                            {/* Category Items */}
                            {isExpanded && (
                                <div className="mt-2 ml-4 space-y-1 pl-4 border-l-2 border-primary-100">
                                    {categoryItems.map((item) => {
                                        const priceChanged = item.currentPrice && item.priceAtGeneration &&
                                            item.currentPrice !== item.priceAtGeneration;
                                        const priceIncreased = priceChanged && (item.currentPrice || 0) > (item.priceAtGeneration || 0);

                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3.5 rounded-xl transition-all group/item min-h-[56px]",
                                                    item.checked ? "opacity-60" : "hover:bg-white hover:shadow-md hover:shadow-primary-900/5 group/item"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        checked={item.checked}
                                                        onCheckedChange={() => onToggleItem(item.id)}
                                                        className="w-5 h-5 rounded-md data-[state=checked]:bg-primary-900 data-[state=checked]:text-white border-primary-200"
                                                    />
                                                    <span className={cn(
                                                        "text-sm font-bold text-primary-900 flex flex-wrap items-center gap-2 leading-tight",
                                                        item.checked && "line-through text-muted-foreground"
                                                    )}>
                                                        {item.name}
                                                        {item.isEssential && (
                                                            <span className="text-[9px] uppercase tracking-widest text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full border border-orange-200">
                                                                Essential
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    {item.currentPrice != null && (
                                                        <div className="flex flex-col items-end min-w-[100px]">
                                                            <div className={cn(
                                                                "text-sm font-bold flex items-center gap-1",
                                                                priceChanged
                                                                    ? (priceIncreased ? 'text-red-500' : 'text-green-600')
                                                                    : 'text-primary-800'
                                                            )}>
                                                                {priceData?.currency || 'LKR'} {item.currentPrice.toLocaleString()}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Price
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-end min-w-[80px]">
                                                        <span className="text-sm font-bold text-primary-900">{item.quantity}{item.unit || ''}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Financial Summary Overlay */}
            {priceData && (
                <div className="mt-4 p-5 rounded-3xl bg-white border-2 border-secondary-500 text-primary-900 shadow-xl shadow-secondary-500/5 transform hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total Weekly Investment</span>
                        {priceData.priceChanged && (
                            <div className={cn(
                                "p-1.5 rounded-lg bg-secondary-50 text-[10px] font-bold flex items-center gap-1 border border-secondary-100",
                                priceData.currentTotal > priceData.totalAtGeneration ? "text-red-500" : "text-green-600"
                            )}>
                                {priceData.currentTotal > priceData.totalAtGeneration ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                PRICE UPDATED
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-secondary-600">{priceData.currency} {priceData.currentTotal?.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm font-medium">for 7 days</span>
                    </div>
                </div>
            )}
        </div>
    );
}
