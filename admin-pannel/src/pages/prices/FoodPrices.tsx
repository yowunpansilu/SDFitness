import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, RefreshCw, Clock, Store, Loader2, AlertCircle, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';
import { useToast } from '@/hooks/use-toast';

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
    protein: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    carbs: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    vegetable: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    fruit: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    dairy: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    fats: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export function FoodPrices() {
    const { toast } = useToast();
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
        const interval = setInterval(fetchScraperStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const res = await api.get('/prices');
            setFoods(res.data.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to sync with price matrix');
        } finally {
            setLoading(false);
        }
    };

    const fetchScraperStatus = async () => {
        try {
            const res = await api.get('/prices/scrape-status');
            setScraperStatus(res.data);
        } catch {
            // Ignore if service down
        }
    };

    const triggerScrape = async () => {
        setTriggeringScrape(true);
        try {
            await api.post('/prices/trigger-scrape', { stores: ['keells', 'cargills'], dry_run: false });
            setScraperStatus(prev => ({ ...prev, running: true }));
            toast({ title: 'Scraper Transmitting', description: 'ML-led price discovery protocols initiated.' });
        } catch (err: any) {
             toast({ 
               title: 'Protocol Failed', 
               description: 'ML service unavailable. Ensure backend processes are active.', 
               variant: 'destructive' 
             });
        } finally {
            setTriggeringScrape(false);
        }
    };

    const categories = ['all', 'protein', 'carbs', 'vegetable', 'fruit', 'dairy', 'fats'];
    const filteredFoods = foods.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || food.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Synchronizing Market Matrices...</p>
            </div>
          </div>
        );
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Market <span className="text-indigo-600 italic font-medium">Equilibrium</span>
                    </h1>
                    <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Automated food price discovery and ML-ready catalog
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="bg-slate-50 border-slate-300 text-indigo-600 rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 border-2"
                        onClick={triggerScrape}
                        disabled={triggeringScrape || scraperStatus.running}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", triggeringScrape || scraperStatus.running ? 'animate-spin' : '')} />
                        {scraperStatus.running ? 'Processing...' : 'Run Discovery'}
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg h-11 px-6 font-black text-[10px] uppercase tracking-widest border border-slate-300">
                        <Plus className="mr-2 h-4 w-4" /> Inject Asset
                    </Button>
                </div>
            </div>

            {/* Scraper Intelligence Bar */}
            <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden">
                <CardContent className="p-4 bg-slate-50/20">
                    <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-slate-800" />
                            <span className="text-slate-700">Last Snapshot:</span>
                            <span className="text-slate-900">
                                {scraperStatus.lastRun ? new Date(scraperStatus.lastRun).toLocaleTimeString() : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-500">{scraperStatus.itemsScraped} items discovered</span>
                        </div>
                        {scraperStatus.running && (
                            <div className="flex items-center gap-3 animate-pulse text-indigo-600">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>discovery in progress…</span>
                            </div>
                        )}
                        {scraperStatus.errors > 0 && (
                             <div className="flex items-center gap-3 text-rose-500">
                                <AlertCircle className="w-4 h-4" />
                                <span>{scraperStatus.errors} failures flagged</span>
                             </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 bg-white border-slate-300 rounded-2xl overflow-hidden p-1">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                          type="text"
                          placeholder="Query food database..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-xl text-slate-900 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-900 outline-none"
                      />
                   </div>
                </Card>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                selectedCategory === cat 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Grid */}
            <Card className="bg-white border-slate-300 rounded-[2.5rem] overflow-hidden border-2 shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto font-black uppercase text-[10px] tracking-widest">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-300 bg-slate-50/40">
                                    {['Identifier', 'Tier', 'Mean Price', 'Delta Low', 'Network Nodes', 'Protocol', ''].map(h => (
                                        <th key={h} className="text-left text-slate-700 p-6 font-black uppercase tracking-[0.2em]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFoods.map(food => {
                                    const avg = food.prices?.length ? Math.round(food.prices.reduce((s, p) => s + p.pricePerUnit, 0) / food.prices.length) : 0;
                                    const lowest = food.prices?.length ? Math.min(...food.prices.map(p => p.pricePerUnit)) : 0;
                                    const unit = food.prices?.[0]?.unit || 'g';
                                    const source = food.prices?.some(p => p.source === 'scraper_catalog') ? 'auto' : 'manual';

                                    return (
                                        <tr key={food._id} className="border-b border-slate-300/40 hover:bg-slate-100/20 transition-all group">
                                            <td className="p-6 text-slate-900 font-black tracking-tight text-xs uppercase">{food.name}</td>
                                            <td className="p-6">
                                                <Badge className={cn("border-none px-3 py-1 rounded-lg text-xs font-black", categoryVariants[food.category.toLowerCase()] || 'bg-slate-100 text-slate-600')}>
                                                    {food.category}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-slate-900">
                                                LKR {avg.toLocaleString()}<span className="text-slate-800 ml-1">/{unit}</span>
                                            </td>
                                            <td className="p-6 text-emerald-600">LKR {lowest.toLocaleString()}</td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    {Array.from(new Set(food.prices?.map(p => p.store))).map(s => (
                                                        <span key={s} className="px-2 py-1 bg-slate-50 border border-slate-300 text-slate-700 rounded text-[8px] font-black uppercase">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={cn("px-3 py-1 rounded-lg", source === 'auto' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600')}>
                                                    {source === 'auto' ? 'MATRIX_SCAN' : 'MANUAL_INJECT'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                    <Edit2 className="w-4 h-4" />
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
