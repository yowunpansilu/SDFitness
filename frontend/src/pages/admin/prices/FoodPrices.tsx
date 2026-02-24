import { useState } from 'react';
import { Search, Edit2, Plus, TrendingUp, TrendingDown, Clock, Store, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock food prices — in production fetched from /api/prices
const mockFoods = [
    { foodId: 'rice', name: 'White Rice', category: 'carbs', averagePrice: 220, lowestPrice: 190, unit: 'kg', lastUpdated: '2h ago', source: 'scraper_catalog', stores: ['Keells', 'Cargills'] },
    { foodId: 'chicken_breast', name: 'Chicken Breast', category: 'protein', averagePrice: 1450, lowestPrice: 1290, unit: 'kg', lastUpdated: '1h ago', source: 'scraper_catalog', stores: ['Keells', 'Arpico'] },
    { foodId: 'eggs', name: 'Eggs (10 pack)', category: 'protein', averagePrice: 520, lowestPrice: 480, unit: 'pack', lastUpdated: '3h ago', source: 'manual', stores: ['Cargills'] },
    { foodId: 'banana', name: 'Banana', category: 'fruit', averagePrice: 180, lowestPrice: 150, unit: 'kg', lastUpdated: '4h ago', source: 'scraper_catalog', stores: ['Keells', 'Sathosa'] },
    { foodId: 'brown_rice', name: 'Brown Rice', category: 'carbs', averagePrice: 380, lowestPrice: 350, unit: 'kg', lastUpdated: '2h ago', source: 'scraper_catalog', stores: ['Keells'] },
    { foodId: 'red_lentils', name: 'Red Lentils (Parippu)', category: 'protein', averagePrice: 550, lowestPrice: 490, unit: 'kg', lastUpdated: '6h ago', source: 'scraper_catalog', stores: ['Cargills', 'Sathosa'] },
    { foodId: 'spinach', name: 'Spinach', category: 'vegetable', averagePrice: 280, lowestPrice: 240, unit: 'kg', lastUpdated: '1h ago', source: 'scraper_catalog', stores: ['Keells'] },
    { foodId: 'coconut_oil', name: 'Coconut Oil', category: 'fats', averagePrice: 890, lowestPrice: 780, unit: 'L', lastUpdated: '5h ago', source: 'manual', stores: ['Arpico'] },
    { foodId: 'yogurt', name: 'Plain Yogurt', category: 'dairy', averagePrice: 440, lowestPrice: 380, unit: 'kg', lastUpdated: '2h ago', source: 'scraper_catalog', stores: ['Keells', 'Cargills'] },
    { foodId: 'sweet_potato', name: 'Sweet Potato', category: 'carbs', averagePrice: 320, lowestPrice: 260, unit: 'kg', lastUpdated: '3h ago', source: 'scraper_catalog', stores: ['Sathosa'] },
];

const scraperStatus = {
    lastRun: '2026-02-24T08:00:00Z',
    itemsScraped: 847,
    errors: 3,
    nextRun: '2026-02-24T20:00:00Z',
};

const categoryColors: Record<string, string> = {
    protein: 'bg-blue-500/20 text-blue-400',
    carbs: 'bg-orange-500/20 text-orange-400',
    vegetable: 'bg-green-500/20 text-green-400',
    fruit: 'bg-yellow-500/20 text-yellow-400',
    dairy: 'bg-cyan-500/20 text-cyan-400',
    fats: 'bg-pink-500/20 text-pink-400',
};

export function FoodPrices() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
                    <h1 className="text-3xl font-bold text-white">Food Prices</h1>
                    <p className="text-gray-400 mt-1">Manage food prices for the ML diet plan engine</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Trigger Scrape
                    </Button>
                    <Button variant="gym" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Food
                    </Button>
                </div>
            </div>

            {/* Scraper Status */}
            <Card className="border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Last scrape:</span>
                            <span className="text-white font-medium">{new Date(scraperStatus.lastRun).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">{scraperStatus.itemsScraped} items</span>
                        </div>
                        {scraperStatus.errors > 0 && (
                            <div className="text-yellow-400">
                                ⚠ {scraperStatus.errors} errors
                            </div>
                        )}
                        <div className="text-gray-500">
                            Next run: {new Date(scraperStatus.nextRun).toLocaleTimeString()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${selectedCategory === cat
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food Table */}
            <Card className="border-dark-700">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase p-4">Food</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase p-4">Category</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase p-4">Avg Price</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase p-4">Lowest</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase p-4">Stores</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase p-4">Source</th>
                                    <th className="text-left text-xs font-medium text-gray-400 uppercase p-4">Updated</th>
                                    <th className="text-right text-xs font-medium text-gray-400 uppercase p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFoods.map(food => (
                                    <tr key={food.foodId} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-white font-medium">{food.name}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[food.category] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {food.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-white font-medium">LKR {food.averagePrice}</span>
                                            <span className="text-gray-500 text-xs">/{food.unit}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-green-400 font-medium">LKR {food.lowestPrice}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {food.stores.map(s => (
                                                    <span key={s} className="px-1.5 py-0.5 text-xs bg-dark-700 text-gray-300 rounded">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs ${food.source === 'scraper_catalog' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                {food.source === 'scraper_catalog' ? '🤖 Auto' : '✏️ Manual'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-400">{food.lastUpdated}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-white">
                                                <Edit2 className="w-3 h-3" />
                                                Edit
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
