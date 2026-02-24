import { useState } from 'react';
import { Search, Edit2, Plus, RefreshCw, Clock, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockFoods = [
    { foodId: 'rice', name: 'White Rice', category: 'carbs', averagePrice: 220, lowestPrice: 190, unit: 'kg', lastUpdated: '2h ago', source: 'auto', stores: ['Keells', 'Cargills'] },
    { foodId: 'chicken_breast', name: 'Chicken Breast', category: 'protein', averagePrice: 1450, lowestPrice: 1290, unit: 'kg', lastUpdated: '1h ago', source: 'auto', stores: ['Keells', 'Arpico'] },
    { foodId: 'eggs', name: 'Eggs (10 pack)', category: 'protein', averagePrice: 520, lowestPrice: 480, unit: 'pack', lastUpdated: '3h ago', source: 'manual', stores: ['Cargills'] },
    { foodId: 'banana', name: 'Banana', category: 'fruit', averagePrice: 180, lowestPrice: 150, unit: 'kg', lastUpdated: '4h ago', source: 'auto', stores: ['Keells', 'Sathosa'] },
    { foodId: 'brown_rice', name: 'Brown Rice', category: 'carbs', averagePrice: 380, lowestPrice: 350, unit: 'kg', lastUpdated: '2h ago', source: 'auto', stores: ['Keells'] },
    { foodId: 'red_lentils', name: 'Red Lentils (Parippu)', category: 'protein', averagePrice: 550, lowestPrice: 490, unit: 'kg', lastUpdated: '6h ago', source: 'auto', stores: ['Cargills', 'Sathosa'] },
    { foodId: 'spinach', name: 'Spinach', category: 'vegetable', averagePrice: 280, lowestPrice: 240, unit: 'kg', lastUpdated: '1h ago', source: 'auto', stores: ['Keells'] },
    { foodId: 'coconut_oil', name: 'Coconut Oil', category: 'fats', averagePrice: 890, lowestPrice: 780, unit: 'L', lastUpdated: '5h ago', source: 'manual', stores: ['Arpico'] },
    { foodId: 'yogurt', name: 'Plain Yogurt', category: 'dairy', averagePrice: 440, lowestPrice: 380, unit: 'kg', lastUpdated: '2h ago', source: 'auto', stores: ['Keells', 'Cargills'] },
    { foodId: 'sweet_potato', name: 'Sweet Potato', category: 'carbs', averagePrice: 320, lowestPrice: 260, unit: 'kg', lastUpdated: '3h ago', source: 'auto', stores: ['Sathosa'] },
];

const scraperStatus = { lastRun: '2026-02-24T08:00:00Z', itemsScraped: 847, errors: 3, nextRun: '2026-02-24T20:00:00Z' };

const categoryVariants: Record<string, string> = {
    protein: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    carbs: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    vegetable: 'bg-green-500/20 text-green-400 border-green-500/30',
    fruit: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dairy: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    fats: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export function FoodPrices() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', ...new Set(mockFoods.map(f => f.category))];
    const filteredFoods = mockFoods.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Food Prices
                    </h1>
                    <p className="text-gray-400 mt-2">Manage food prices for the ML diet plan engine</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-dark-800/50 border-dark-700 text-white hover:bg-dark-700">
                        <RefreshCw className="w-4 h-4" />
                        Trigger Scrape
                    </Button>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="w-4 h-4" />
                        Add Food
                    </Button>
                </div>
            </div>

            {/* Scraper Status */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Last scrape:</span>
                            <span className="text-white font-medium">{new Date(scraperStatus.lastRun).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">{scraperStatus.itemsScraped} items scraped</span>
                        </div>
                        {scraperStatus.errors > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                ⚠ {scraperStatus.errors} errors
                            </Badge>
                        )}
                        <span className="text-gray-500">Next: {new Date(scraperStatus.nextRun).toLocaleTimeString()}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-dark-800/50 border border-dark-700 text-gray-400 hover:bg-dark-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food Table */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    {['Food', 'Category', 'Avg Price', 'Lowest', 'Stores', 'Source', 'Updated', ''].map(h => (
                                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFoods.map(food => (
                                    <tr key={food.foodId} className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors">
                                        <td className="p-4 text-white font-medium">{food.name}</td>
                                        <td className="p-4">
                                            <Badge className={categoryVariants[food.category] || 'bg-gray-500/20 text-gray-400'}>
                                                {food.category}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-white font-medium">
                                            LKR {food.averagePrice}<span className="text-gray-500 text-xs">/{food.unit}</span>
                                        </td>
                                        <td className="p-4 text-green-400 font-medium">LKR {food.lowestPrice}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {food.stores.map(s => (
                                                    <span key={s} className="px-1.5 py-0.5 text-xs bg-dark-700 border border-dark-600 text-gray-300 rounded">{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs ${food.source === 'auto' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                {food.source === 'auto' ? '🤖 Auto' : '✏️ Manual'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{food.lastUpdated}</td>
                                        <td className="p-4">
                                            <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-white hover:bg-dark-700">
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
