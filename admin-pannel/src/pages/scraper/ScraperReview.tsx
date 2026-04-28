import { useState, useEffect } from 'react';
import { Link2, X, Check, ChevronDown, AlertCircle, PackageSearch, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
            const foods = (pricesRes.data.data || []).map((f: { foodId: string; category?: string }) => ({
                foodId: f.foodId,
                category: f.category || 'other',
            }));
            setFoodList(foods);
        } catch (err) {
            const e = err as Error;
            setError(e.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const pending = items.filter((i: ReviewItem) => i.status === 'pending');
    const foodItems = pending.filter((i: ReviewItem) => !!i.suggestedMatch);
    const nonFoodItems = pending.filter((i: ReviewItem) => !i.suggestedMatch);
    const matched = items.filter((i: ReviewItem) => i.status === 'matched').length;
    const ignored = items.filter((i: ReviewItem) => i.status === 'ignored').length;

    const handleMatch = async (id: string, foodId: string) => {
        try {
            const food = foodList.find((f: { foodId: string }) => f.foodId === foodId);
            await api.patch(`/scraper/review-queue/${id}/approve`, {
                foodId,
                category: food?.category || 'other',
            });
            setItems((prev: ReviewItem[]) => prev.map((item: ReviewItem) =>
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
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenDropdown(openDropdown === item._id ? null : item._id)}
                className="h-9 px-3 border-dashed hover:border-primary/50 transition-colors"
            >
                <ChevronDown className="w-4 h-4 mr-1 text-muted-foreground" />
                Change Link
            </Button>
            {openDropdown === item._id && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border bg-muted/30">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Select Target Product</div>
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin">
                        {foodList.map((f: { foodId: string }) => (
                            <button
                                key={f.foodId}
                                onClick={() => handleMatch(item._id, f.foodId)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted text-foreground transition-colors border-b border-border/50 last:border-0"
                            >
                                {f.foodId.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Synchronizing with Atlas Catalog...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/20 shadow-lg shadow-destructive/5">
                <CardContent className="p-12 text-center text-card-foreground">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Service Undiscoverable</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">{error}</p>
                    <Button onClick={fetchData} variant="outline" className="rounded-xl px-8 border-destructive/20 hover:bg-destructive/5 text-destructive">Retry Connection</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Scraper <span className="text-primary">Review</span>
                    </h1>
                    <p className="text-muted-foreground text-[13px] mt-1.5 opacity-80">
                        Validate and verify automated price mappings from keelsPriceDB.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary rounded-full font-semibold text-[11px] tracking-tight">
                        Queue Instance: v2.4
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Pending Decisions', value: pending.length, color: 'text-amber-500', bg: 'bg-amber-500/5', icon: AlertCircle },
                    { label: 'Automated Links', value: matched, color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: Check },
                    { label: 'Cleaned Records', value: ignored, color: 'text-muted-foreground', bg: 'bg-muted/30', icon: X },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                    <Card key={label} className={cn("border-border/50 shadow-sm", bg)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <div className={cn("text-3xl font-bold", color)}>{value}</div>
                                <div className="text-[11px] font-semibold text-muted-foreground leading-tight mt-1">{label}</div>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg, "border border-border/50")}>
                                <Icon className={cn("w-6 h-6", color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Priority Review Section */}
            {foodItems.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <PackageSearch className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">AI Priority Matches</h2>
                        <div className="h-px flex-1 bg-border/50 ml-4" />
                    </div>

                    <div className="grid gap-4">
                        {foodItems.map(item => (
                            <Card key={item._id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md bg-card">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6">
                                        <div className="flex-1 space-y-2">
                                            <div className="inline-flex items-center text-[11px] font-semibold text-primary mb-1">
                                                <Info className="w-3 h-3 mr-1" /> Scraped Asset
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.rawName}</h3>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                                                <span className="text-emerald-500">LKR {item.price.toLocaleString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{item.store}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{formatTime(item.scrapedAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border lg:border-none lg:bg-transparent lg:p-0">
                                            <div className="flex flex-col">
                                                <div className="text-xs font-bold text-muted-foreground mb-1">Proposed Match</div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                                                    <Link2 className="w-3 h-3 text-primary" />
                                                    <span className="text-xs font-semibold text-primary">{item.suggestedMatch?.replace(/_/g, ' ')}</span>
                                                    <div className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                                                        {Math.round((item.matchConfidence || 0) * 100)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                <DropdownMenu item={item} />
                                                <Button size="sm" onClick={() => handleMatch(item._id, item.suggestedMatch!)}
                                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all">
                                                    <Check className="w-4 h-4 mr-1.5" /> Approve
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleIgnore(item._id)}
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border border-border/50">
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Unclassified Assets */}
            {nonFoodItems.length > 0 && (
                <Card className="border-border/50 bg-background shadow-none">
                    <CardHeader className="border-b border-border/50 px-6 py-4 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                Unclassified Assets
                            </CardTitle>
                            <span className="text-xs font-bold text-muted-foreground">{nonFoodItems.length} items</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {nonFoodItems.map(item => (
                                <div key={item._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/20 transition-all opacity-80 hover:opacity-100">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-foreground">{item.rawName}</div>
                                        <div className="flex items-center gap-2 mt-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>LKR {item.price}</span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <span>{item.store}</span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <span>{formatTime(item.scrapedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu item={item} />
                                        <Button size="sm" variant="ghost" onClick={() => handleIgnore(item._id)}
                                            className="h-9 px-4 text-destructive hover:bg-destructive/10 rounded-lg font-semibold text-xs transition-all">
                                            <X className="w-3 h-3 mr-1.5" /> Ignore
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {pending.length === 0 && (
                <Card className="border-border/50 border-dashed bg-muted/20 shadow-none">
                    <CardContent className="p-20 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <Check className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Queue Synchronized</h3>
                        <p className="text-muted-foreground font-medium text-sm mt-1">No items requiring manual validation at this time.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
