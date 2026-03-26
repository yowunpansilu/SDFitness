import { useState, useEffect } from 'react';
import { Link2, X, Check, ChevronDown, AlertCircle, PackageSearch, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api/axios';

interface ReviewItem {
    _id: string;
    rawName: string;
    price: number;
    store: string;
    scrapedAt: string;
    status: 'pending' | 'matched' | 'ignored';
    suggestedMatch?: string;
    matchConfidence?: number;
}

export function ScraperReview() {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [foodList, setFoodList] = useState<{ foodId: string; category: string }[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [queueRes, pricesRes] = await Promise.all([
                api.get('/scraper/review-queue?status=pending'),
                api.get('/prices')
            ]);
            setItems(queueRes.data.data || []);
            const foods = (pricesRes.data.data || []).map((f: any) => ({
                foodId: f.foodId,
                category: f.category || 'other',
            }));
            setFoodList(foods);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const pending = items.filter(i => i.status === 'pending');
    const foodItems = pending.filter(i => i.suggestedMatch);
    const nonFoodItems = pending.filter(i => !i.suggestedMatch);
    const matched = items.filter(i => i.status === 'matched').length;
    const ignored = items.filter(i => i.status === 'ignored').length;

    const handleMatch = async (id: string, foodId: string) => {
        try {
            const food = foodList.find(f => f.foodId === foodId);
            await api.patch(`/scraper/review-queue/${id}/approve`, {
                foodId,
                category: food?.category || 'other',
            });
            setItems(prev => prev.map(item =>
                item._id === id ? { ...item, status: 'matched' as const, suggestedMatch: foodId } : item
            ));
        } catch (err) {
            console.error('Failed to approve item:', err);
        }
        setOpenDropdown(null);
    };

    const handleIgnore = async (id: string) => {
        try {
            await api.patch(`/scraper/review-queue/${id}/dismiss`);
            setItems(prev => prev.map(item =>
                item._id === id ? { ...item, status: 'ignored' as const } : item
            ));
        } catch (err) {
            console.error('Failed to dismiss item:', err);
        }
    };

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const DropdownMenu = ({ item }: { item: ReviewItem }) => (
        <div className="relative">
            <button
                onClick={() => setOpenDropdown(openDropdown === item._id ? null : item._id)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-dark-600"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === item._id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                    {foodList.map(f => (
                        <button key={f.foodId} onClick={() => handleMatch(item._id, f.foodId)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-dark-700 hover:text-purple-700 dark:hover:text-white transition-colors">
                            {f.foodId.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Error Loading Data</h3>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <Button onClick={fetchData} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Scraper Review Queue
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Review unmatched scraped products and link to food database</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Pending Review', value: pending.length, color: 'text-yellow-600 dark:text-yellow-400' },
                    { label: 'Matched', value: matched, color: 'text-green-600 dark:text-green-400' },
                    { label: 'Ignored', value: ignored, color: 'text-gray-600 dark:text-gray-500' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                        <CardContent className="p-5 text-center">
                            <div className={`text-3xl font-bold ${color}`}>{value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Food Items with Suggested Matches */}
            {foodItems.length > 0 && (
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-dark-800/50 border-b border-gray-100 dark:border-dark-700">
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                            <PackageSearch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Food Items — AI Suggested Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {foodItems.map(item => (
                                <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-dark-800/30 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-900 dark:text-white font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.rawName}</div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">LKR {item.price}</span>
                                            <span>•</span>
                                            <span className="capitalize">{item.store}</span>
                                            <span>•</span>
                                            <span>{formatTime(item.scrapedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-lg">
                                            <Link2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{item.suggestedMatch}</span>
                                            <Badge className="bg-purple-600/10 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 border-0 text-[10px] h-4">
                                                {Math.round((item.matchConfidence || 0) * 100)}%
                                            </Badge>
                                        </div>
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleMatch(item._id, item.suggestedMatch!)}
                                            className="gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors font-medium">
                                            <Check className="w-3 h-3" /> Accept
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
                                            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-dark-800/50 border-b border-gray-100 dark:border-dark-700">
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            Likely Non-Food Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                            {nonFoodItems.map(item => (
                                <div key={item._id} className="p-4 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-dark-800/30 transition-colors group">
                                    <div className="flex-1">
                                        <div className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.rawName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">LKR {item.price} • <span className="capitalize">{item.store}</span> • {formatTime(item.scrapedAt)}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
                                            className="gap-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
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
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">All caught up!</h3>
                        <p className="text-gray-500 dark:text-gray-400">No items pending review.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
