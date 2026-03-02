import { useState } from 'react';
import { Link2, X, Check, ChevronDown, AlertCircle, PackageSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReviewItem {
    id: string;
    scrapedName: string;
    scrapedPrice: number;
    store: string;
    scrapedAt: string;
    status: 'pending' | 'matched' | 'ignored';
    suggestedMatch?: string;
    confidence?: number;
}

const initialItems: ReviewItem[] = [
    { id: '1', scrapedName: 'KEELLS Chicken Drumstick 500g', scrapedPrice: 890, store: 'Keells', scrapedAt: '2h ago', status: 'pending', suggestedMatch: 'chicken_breast', confidence: 0.72 },
    { id: '2', scrapedName: 'Anchor Butter Unsalted 200g', scrapedPrice: 680, store: 'Keells', scrapedAt: '2h ago', status: 'pending', suggestedMatch: 'butter', confidence: 0.91 },
    { id: '3', scrapedName: 'Cargills Magic Basmati Rice 1kg', scrapedPrice: 490, store: 'Cargills', scrapedAt: '3h ago', status: 'pending', suggestedMatch: 'rice', confidence: 0.85 },
    { id: '4', scrapedName: 'Vim Dishwash Liquid 500ml', scrapedPrice: 350, store: 'Keells', scrapedAt: '2h ago', status: 'pending' },
    { id: '5', scrapedName: 'Ambewela Fresh Milk 1L', scrapedPrice: 310, store: 'Cargills', scrapedAt: '3h ago', status: 'pending', suggestedMatch: 'milk', confidence: 0.94 },
    { id: '6', scrapedName: 'Signal Toothpaste 120g', scrapedPrice: 280, store: 'Arpico', scrapedAt: '4h ago', status: 'pending' },
    { id: '7', scrapedName: 'Lanka Soy Meat 90g', scrapedPrice: 95, store: 'Sathosa', scrapedAt: '5h ago', status: 'pending', suggestedMatch: 'soy_meat', confidence: 0.88 },
];

const existingFoods = [
    'rice', 'brown_rice', 'chicken_breast', 'eggs', 'banana', 'red_lentils', 'spinach',
    'coconut_oil', 'yogurt', 'sweet_potato', 'oats', 'tuna', 'milk', 'butter', 'soy_meat',
    'bread', 'dhal', 'coconut_milk', 'tofu', 'papaya',
];

export function ScraperReview() {
    const [items, setItems] = useState(initialItems);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const pending = items.filter(i => i.status === 'pending');
    const foodItems = pending.filter(i => i.suggestedMatch);
    const nonFoodItems = pending.filter(i => !i.suggestedMatch);
    const matched = items.filter(i => i.status === 'matched').length;
    const ignored = items.filter(i => i.status === 'ignored').length;

    const handleMatch = (id: string, foodId: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'matched' as const, suggestedMatch: foodId } : item));
        setOpenDropdown(null);
    };

    const handleIgnore = (id: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'ignored' as const } : item));
    };

    const DropdownMenu = ({ item }: { item: ReviewItem }) => (
        <div className="relative">
            <button
                onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 transition-colors"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === item.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {existingFoods.map(f => (
                        <button key={f} onClick={() => handleMatch(item.id, f)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
                            {f.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Scraper Review Queue
                </h1>
                <p className="text-gray-400 mt-2">Review unmatched scraped products and link to food database</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Pending Review', value: pending.length, color: 'text-yellow-400' },
                    { label: 'Matched', value: matched, color: 'text-green-400' },
                    { label: 'Ignored', value: ignored, color: 'text-gray-500' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardContent className="p-5 text-center">
                            <div className={`text-3xl font-bold ${color}`}>{value}</div>
                            <div className="text-sm text-gray-400 mt-1">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Food Items with Suggested Matches */}
            {foodItems.length > 0 && (
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <PackageSearch className="w-5 h-5 text-purple-400" />
                            Food Items — AI Suggested Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-dark-700">
                            {foodItems.map(item => (
                                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-dark-800/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{item.scrapedName}</div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            <span>LKR {item.scrapedPrice}</span>
                                            <span>•</span>
                                            <span>{item.store}</span>
                                            <span>•</span>
                                            <span>{item.scrapedAt}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                            <Link2 className="w-3 h-3 text-purple-400" />
                                            <span className="text-sm text-purple-300">{item.suggestedMatch}</span>
                                            <Badge className="bg-purple-500/30 text-purple-300 border-0 text-xs">
                                                {Math.round((item.confidence || 0) * 100)}%
                                            </Badge>
                                        </div>
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleMatch(item.id, item.suggestedMatch!)}
                                            className="gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10">
                                            <Check className="w-3 h-3" /> Accept
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item.id)}
                                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Non-Food Items */}
            {nonFoodItems.length > 0 && (
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            Likely Non-Food Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-dark-700">
                            {nonFoodItems.map(item => (
                                <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-dark-800/30 transition-colors">
                                    <div className="flex-1">
                                        <div className="text-gray-300">{item.scrapedName}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">LKR {item.scrapedPrice} • {item.store} • {item.scrapedAt}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item.id)}
                                            className="gap-1 text-red-400 hover:bg-red-500/10">
                                            <X className="w-3 h-3" /> Dismiss
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {pending.length === 0 && (
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-white mb-1">All caught up!</h3>
                        <p className="text-gray-400">No items pending review.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
