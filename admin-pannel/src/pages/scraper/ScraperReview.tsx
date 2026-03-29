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
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border border-slate-300 hover:border-slate-400"
            >
                <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === item._id && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-20 max-h-56 overflow-y-auto">
                    {foodList.map(f => (
                        <button key={f.foodId} onClick={() => handleMatch(item._id, f.foodId)}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-100 last:border-0 truncate">
                            {f.foodId.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Accessing Queue Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-white border-2 border-rose-200 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Error Loading Data</h3>
                    <p className="text-slate-600 text-sm font-medium">{error}</p>
                    <Button onClick={fetchData} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-8 tracking-widest uppercase text-xs font-bold">Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Scraper <span className="text-indigo-600 italic font-medium">Review Queue</span>
                </h1>
                <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                    Review unmatched scraped products and link to food database
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Review', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'Matched', value: matched, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Ignored', value: ignored, color: 'text-slate-600', bg: 'bg-slate-200' },
                ].map(({ label, value, color, bg }) => (
                    <Card key={label} className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-400/50">
                        <CardContent className="p-6 text-center">
                            <div className={`text-4xl font-black ${color} tracking-tight`}>{value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 mt-2">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Food Items with Suggested Matches */}
            {foodItems.length > 0 && (
                <Card className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-200 pb-6 pt-6">
                        <CardTitle className="text-slate-900 font-black text-xl flex items-center gap-3">
                            <PackageSearch className="w-5 h-5 text-indigo-600" />
                            Food Items — AI Suggested Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200">
                            {foodItems.map(item => (
                                <div key={item._id} className="p-5 flex flex-col xl:flex-row xl:items-center gap-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-slate-900 font-black text-lg truncate group-hover:text-indigo-600 transition-colors tracking-tight">{item.rawName}</div>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                            <span className="text-slate-800 bg-slate-200 px-2 py-1 rounded-md">LKR {item.price}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.store}</span>
                                            <span>•</span>
                                            <span>{formatTime(item.scrapedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 xl:mt-0">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border-2 border-indigo-100 rounded-xl">
                                            <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                                            <span className="text-xs font-black text-indigo-700 tracking-wide">{item.suggestedMatch}</span>
                                            <Badge className="bg-indigo-600 text-white border-0 text-[9px] h-5 px-1.5 font-black ml-1 uppercase rounded-lg shadow-sm">
                                                {Math.round((item.matchConfidence || 0) * 100)}%
                                            </Badge>
                                        </div>
                                        <DropdownMenu item={item} />
                                        <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
                                        <Button size="sm" variant="ghost" onClick={() => handleMatch(item._id, item.suggestedMatch!)}
                                            className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors font-black uppercase tracking-widest text-[10px] h-9">
                                            <Check className="w-4 h-4" /> Accept
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
                                            className="gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors font-black uppercase tracking-widest text-[10px] h-9">
                                            <X className="w-4 h-4" />
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
                <Card className="bg-white border-2 border-slate-300 shadow-sm rounded-3xl overflow-hidden mt-8">
                    <CardHeader className="bg-slate-50 border-b border-slate-200 pb-6 pt-6">
                        <CardTitle className="text-slate-900 font-black text-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Likely Non-Food Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200">
                            {nonFoodItems.map(item => (
                                <div key={item._id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-slate-900 font-black text-lg truncate tracking-tight">{item.rawName}</div>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                            <span className="text-slate-800 bg-slate-200 px-2 py-1 rounded-md">LKR {item.price}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.store}</span>
                                            <span>•</span>
                                            <span>{formatTime(item.scrapedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
                                            className="gap-2 text-rose-500 hover:bg-rose-50 transition-colors font-black uppercase tracking-widest text-[10px] h-9">
                                            <X className="w-4 h-4" /> Dismiss
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {pending.length === 0 && !loading && (
                <Card className="bg-white border-2 border-dashed border-slate-300 shadow-sm rounded-3xl">
                    <CardContent className="p-16 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Queue Cleared</h3>
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">All scraped items have been processed.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
