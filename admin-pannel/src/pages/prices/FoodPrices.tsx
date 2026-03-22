import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, RefreshCw, Clock, Store, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api/axios';

interface FoodItem {
    _id: string;
    foodId: string;
    name: string;
    category: string;
    averagePricePerGram: number;
    lowestPricePerGram: number;
    prices: { store: string; pricePerUnit: number; unit: string; source: string }[];
    isVerified: boolean;
    updatedAt: string;
}

interface ScraperStatus {
    lastRun: string | null;
    itemsScraped: number;
    errors: number;
    running: boolean;
}

const categoryVariants: Record<string, string> = {
    protein: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    carbs: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    vegetable: 'bg-green-500/20 text-green-400 border-green-500/30',
    fruit: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dairy: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    fats: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function FoodPrices() {
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [scraperStatus, setScraperStatus] = useState<ScraperStatus>({
        lastRun: null, itemsScraped: 0, errors: 0, running: false
    });
    const [triggeringScrape, setTriggeringScrape] = useState(false);

    useEffect(() => {
        fetchFoods();
        fetchScraperStatus();
    }, []);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const res = await api.get('/prices');
            setFoods(res.data.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load food prices');
        } finally {
            setLoading(false);
        }
    };

    const fetchScraperStatus = async () => {
        try {
            const res = await api.get('/prices/scrape-status');
            setScraperStatus(res.data);
        } catch {
            // ML service may not be running — that's OK
        }
    };

    const triggerScrape = async () => {
        setTriggeringScrape(true);
        try {
            await api.post('/prices/trigger-scrape', { stores: ['keells', 'cargills'], dry_run: false });
            setScraperStatus(prev => ({ ...prev, running: true }));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to trigger scrape — is the ML service running?');
        } finally {
            setTriggeringScrape(false);
        }
    };

    const categories = ['all', ...new Set(foods.map(f => f.category))];
    const filteredFoods = foods.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getStoresFromItem = (item: FoodItem): string[] => {
        return item.prices?.map(p => p.store) || [];
    };

    const getAvgPricePerUnit = (item: FoodItem): { price: number; unit: string } => {
        if (!item.prices || item.prices.length === 0) return { price: 0, unit: 'kg' };
        const avg = item.prices.reduce((s, p) => s + p.pricePerUnit, 0) / item.prices.length;
        return { price: Math.round(avg), unit: item.prices[0]?.unit || 'kg' };
    };

    const getLowestPrice = (item: FoodItem): number => {
        if (!item.prices || item.prices.length === 0) return 0;
        return Math.min(...item.prices.map(p => p.pricePerUnit));
    };

    const getSource = (item: FoodItem): string => {
        const sources = item.prices?.map(p => p.source) || [];
        return sources.includes('scraper_catalog') || sources.includes('api') ? 'auto' : 'manual';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-1">Error</h3>
                    <p className="text-gray-400">{error}</p>
                    <Button onClick={fetchFoods} className="mt-4 bg-purple-600 hover:bg-purple-700">Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Food Prices
                    </h1>
                    <p className="text-gray-400 mt-2">Manage food prices for the ML diet plan engine • {foods.length} items</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 bg-dark-800/50 border-dark-700 text-white hover:bg-dark-700"
                        onClick={triggerScrape}
                        disabled={triggeringScrape}
                    >
                        <RefreshCw className={`w-4 h-4 ${triggeringScrape ? 'animate-spin' : ''}`} />
                        {triggeringScrape ? 'Triggering...' : 'Trigger Scrape'}
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
                            <span className="text-white font-medium">
                                {scraperStatus.lastRun ? new Date(scraperStatus.lastRun).toLocaleTimeString() : 'Never'}
                            </span>
                        </div>
                        {scraperStatus.itemsScraped > 0 && (
                            <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-medium">{scraperStatus.itemsScraped} items scraped</span>
                            </div>
                        )}
                        {scraperStatus.errors > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                ⚠ {scraperStatus.errors} errors
                            </Badge>
                        )}
                        {scraperStatus.running && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
                                🔄 Scraping in progress…
                            </Badge>
                        )}
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
                                {filteredFoods.map(food => {
                                    const { price: avgPrice, unit } = getAvgPricePerUnit(food);
                                    const lowestPrice = getLowestPrice(food);
                                    const stores = getStoresFromItem(food);
                                    const source = getSource(food);

                                    return (
                                        <tr key={food.foodId} className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors">
                                            <td className="p-4 text-white font-medium">{food.name}</td>
                                            <td className="p-4">
                                                <Badge className={categoryVariants[food.category] || 'bg-gray-500/20 text-gray-400'}>
                                                    {food.category}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-white font-medium">
                                                LKR {avgPrice}<span className="text-gray-500 text-xs">/{unit}</span>
                                            </td>
                                            <td className="p-4 text-green-400 font-medium">LKR {lowestPrice}</td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {stores.map(s => (
                                                        <span key={s} className="px-1.5 py-0.5 text-xs bg-dark-700 border border-dark-600 text-gray-300 rounded">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs ${source === 'auto' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                    {source === 'auto' ? '🤖 Auto' : '✏️ Manual'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">{formatTime(food.updatedAt)}</td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-white hover:bg-dark-700">
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
