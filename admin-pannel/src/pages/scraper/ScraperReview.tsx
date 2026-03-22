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
                className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 transition-colors"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === item._id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {foodList.map(f => (
                        <button key={f.foodId} onClick={() => handleMatch(item._id, f.foodId)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors">
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
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-1">Error Loading Data</h3>
                    <p className="text-gray-400">{error}</p>
                    <Button onClick={fetchData} className="mt-4 bg-purple-600 hover:bg-purple-700">Retry</Button>
                </CardContent>
            </Card>
        );
    }

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
                                <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-dark-800/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{item.rawName}</div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            <span>LKR {item.price}</span>
                                            <span>•</span>
                                            <span>{item.store}</span>
                                            <span>•</span>
                                            <span>{formatTime(item.scrapedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                            <Link2 className="w-3 h-3 text-purple-400" />
                                            <span className="text-sm text-purple-300">{item.suggestedMatch}</span>
                                            <Badge className="bg-purple-500/30 text-purple-300 border-0 text-xs">
                                                {Math.round((item.matchConfidence || 0) * 100)}%
                                            </Badge>
                                        </div>
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleMatch(item._id, item.suggestedMatch!)}
                                            className="gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10">
                                            <Check className="w-3 h-3" /> Accept
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
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
                                <div key={item._id} className="p-4 flex items-center gap-3 hover:bg-dark-800/30 transition-colors">
                                    <div className="flex-1">
                                        <div className="text-gray-300">{item.rawName}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">LKR {item.price} • {item.store} • {formatTime(item.scrapedAt)}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
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
