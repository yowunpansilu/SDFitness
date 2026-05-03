import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Bug,
    Clock,
    Search,
    ChevronRight,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAllFeedback, getFeedbackById, updateFeedbackStatus, addAdminNotes } from '@/services/feedbackService';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Search },
    { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
];

const CATEGORY_OPTIONS = [
    { value: 'bug', label: 'Bug Reports', icon: Bug, color: 'text-rose-500' },
    { value: 'suggestion', label: 'Suggestions', icon: MessageSquare, color: 'text-amber-500' },
    { value: 'complaint', label: 'Complaints', icon: AlertCircle, color: 'text-orange-500' },
    { value: 'feature_request', label: 'Feature Requests', icon: MessageSquare, color: 'text-indigo-500' },
];

export function FeedbackList() {
    const [feedback, setFeedback] = useState<{ _id: string; status: string; category: string; message: string; createdAt: string; adminNotes?: string; errorUrl?: string; userAgent?: string; stackTrace?: string; userId?: { firstName: string; lastName: string; email: string } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<{ _id: string; status: string; category: string; message: string; createdAt: string; adminNotes?: string; errorUrl?: string; userAgent?: string; stackTrace?: string; userId?: { firstName: string; lastName: string; email: string } } | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchFeedback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, categoryFilter]);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const filters: Record<string, string> = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (categoryFilter !== 'all') filters.category = categoryFilter;

            const res = await getAllFeedback(filters);
            setFeedback(res.data);
        } catch (err) {
            console.error('Error fetching feedback:', err);
            toast({ title: "Fetch Failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id: string) => {
        try {
            const res = await getFeedbackById(id);
            setSelectedItem(res.data);
            setAdminNotes(res.data.adminNotes || '');
            setDetailOpen(true);
        } catch {
            toast({
                title: "Error",
                description: "Failed to load feedback details",
                variant: "destructive"
            });
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedItem) return;
        setUpdating(true);
        try {
            await updateFeedbackStatus(selectedItem._id, status);
            toast({ title: "Status Updated", description: `Feedback marked as ${status}` });
            setSelectedItem({ ...selectedItem, status });
            fetchFeedback();
        } catch {
            toast({ title: "Update Failed", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedItem) return;
        setUpdating(true);
        try {
            await addAdminNotes(selectedItem._id, adminNotes);
            toast({ title: "Notes Saved" });
            fetchFeedback();
        } catch {
            toast({ title: "Failed to save notes", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        if (!option) return <Badge variant="outline" className="border-navy-700 text-navy-400 capitalize">{status}</Badge>;

        const Icon = option.icon;
        return (
            <Badge variant="outline" className={cn("font-bold", option.color)}>
                <Icon className="w-3 h-3 mr-1" /> {option.label}
            </Badge>
        );
    };

    const getCategoryIcon = (category: string) => {
        const option = CATEGORY_OPTIONS.find(o => o.value === category);
        const Icon = option?.icon || MessageSquare;
        return <Icon className={cn("w-4 h-4", option?.color || "text-indigo-500")} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">
                        Feedback & <span className="text-primary-500">Insights</span>
                    </h1>
                    <p className="text-slate-500 dark:text-navy-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Member Submissions Analysis</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white hover:border-primary-500/50 transition-all rounded-xl h-11 shadow-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl">
                            <SelectItem value="all" className="font-bold">All Status</SelectItem>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[170px] bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white hover:border-primary-500/50 transition-all rounded-xl h-11 shadow-sm">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl">
                            <SelectItem value="all" className="font-bold">All Categories</SelectItem>
                            {CATEGORY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={fetchFeedback} variant="outline" size="icon" className="border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-primary-500 h-11 w-11 rounded-xl shadow-sm">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-navy-950/50 border-b border-slate-200 dark:border-navy-800">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5 px-6">Member</TableHead>
                                <TableHead className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5">Category</TableHead>
                                <TableHead className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5">Message</TableHead>
                                <TableHead className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5">Status</TableHead>
                                <TableHead className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5">Date</TableHead>
                                <TableHead className="text-right text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[9px] py-5 px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-100 dark:border-navy-800">
                                        <TableCell colSpan={6}><div className="h-16 bg-slate-100 dark:bg-navy-800/20 animate-pulse rounded-xl mx-4 my-2" /></TableCell>
                                    </TableRow>
                                ))
                            ) : feedback.length > 0 ? (
                                feedback.map((item) => (
                                    <TableRow
                                        key={item._id}
                                        className="border-slate-100 dark:border-navy-800/50 hover:bg-primary-500/[0.02] dark:hover:bg-primary-500/[0.03] transition-colors group cursor-pointer"
                                        onClick={() => handleViewDetail(item._id)}
                                    >
                                        <TableCell className="font-bold text-slate-900 dark:text-white px-6 py-4">
                                            {item.userId?.firstName} {item.userId?.lastName}
                                            <p className="text-[10px] text-slate-400 dark:text-navy-500 font-medium tracking-tight uppercase">{item.userId?.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-white text-xs font-bold capitalize">
                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                                {item.category.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-navy-300 max-w-[200px] md:max-w-[400px] truncate font-medium text-xs">
                                            {item.message}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-slate-400 dark:text-navy-500 text-[10px] font-black uppercase tracking-tight">
                                            {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button variant="ghost" size="sm" className="text-primary-500 group-hover:bg-primary-500/10 transition-all rounded-lg h-8 w-8 p-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <MessageSquare className="w-12 h-12 text-slate-200 dark:text-navy-800 mx-auto mb-4 opacity-50" />
                                        <p className="text-slate-400 dark:text-navy-500 font-black uppercase tracking-[0.2em] text-[10px]">No feedback entries discovered</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="bg-white dark:bg-navy-950 border-l border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white sm:max-w-[600px] p-0 overflow-hidden flex flex-col">
                    <SheetHeader className="p-8 border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/20">
                                {selectedItem && getCategoryIcon(selectedItem.category)}
                            </div>
                            <Badge variant="outline" className="border-slate-200 dark:border-navy-700 text-slate-500 dark:text-navy-400 font-black uppercase tracking-[0.2em] text-[8px] h-6">
                                {selectedItem?.category}
                            </Badge>
                        </div>
                        <SheetTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-slate-900 dark:text-white">
                            Feedback <span className="text-primary-500">Analysis</span>
                        </SheetTitle>
                        <SheetDescription className="text-slate-400 dark:text-navy-500 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-2">
                            REF: {selectedItem?._id?.slice(-8)} <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-navy-800" /> {selectedItem && format(new Date(selectedItem.createdAt), 'PPPP p')}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                        {selectedItem && (
                            <div className="space-y-12">
                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 flex items-center gap-2">
                                        <div className="w-8 h-px bg-slate-100 dark:bg-navy-800" /> Member Authentication
                                    </h4>
                                    <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/30 border border-slate-100 dark:border-navy-800 shadow-sm">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20">
                                            {selectedItem.userId?.firstName[0]}{selectedItem.userId?.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{selectedItem.userId?.firstName} {selectedItem.userId?.lastName}</p>
                                            <p className="text-xs text-slate-400 dark:text-navy-500 font-bold tracking-widest mt-1 uppercase">{selectedItem.userId?.email}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 flex items-center gap-2">
                                        <div className="w-8 h-px bg-slate-100 dark:bg-navy-800" /> Submitted Insight
                                    </h4>
                                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-navy-100 font-medium whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-100 dark:border-navy-800 relative">
                                        <MessageSquare className="absolute top-4 right-4 w-12 h-12 text-slate-200 dark:text-navy-800/20 -z-0" />
                                        <span className="relative z-10">{selectedItem.message}</span>
                                    </div>
                                </section>

                                {selectedItem.category === 'bug' && (
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-2">
                                                <div className="w-8 h-px bg-rose-100 dark:bg-rose-900/30" /> Incident Metadata
                                            </h4>
                                            <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-none px-3 font-black text-[9px] uppercase italic">Priority: Critical</Badge>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900/50 border border-slate-100 dark:border-navy-800/50 group transition-all hover:border-rose-500/30">
                                                <p className="text-[9px] uppercase font-black text-slate-400 dark:text-navy-700 mb-3 tracking-[0.2em]">Source Endpoint</p>
                                                <p className="text-xs font-bold text-primary-500 break-all flex items-center gap-2 group-hover:text-primary-400 transition-colors italic underline decoration-primary-500/30">
                                                    {selectedItem.errorUrl}
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900/50 border border-slate-100 dark:border-navy-800/50">
                                                <p className="text-[9px] uppercase font-black text-slate-400 dark:text-navy-700 mb-3 tracking-[0.2em]">Environment Context</p>
                                                <p className="text-xs font-medium text-slate-600 dark:text-navy-400 italic leading-relaxed">{selectedItem.userAgent}</p>
                                            </div>
                                            {selectedItem.stackTrace && (
                                                <div className="p-6 rounded-2xl dark:bg-black/40 border border-slate-100 dark:border-navy-800 shadow-xl overflow-hidden relative group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.02] to-transparent pointer-events-none" />
                                                    <p className="text-[9px] uppercase font-black text-rose-500/70 mb-4 flex items-center gap-2 tracking-[0.2em]">
                                                        <Bug className="w-3 h-3" /> Execution Stack Trace
                                                    </p>
                                                    <pre className="text-[10px] text-rose-600 dark:text-rose-400/80 font-mono overflow-auto max-h-[400px] pr-4 custom-scrollbar leading-relaxed">
                                                        {selectedItem.stackTrace}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-6 pt-8 border-t border-slate-100 dark:border-navy-800">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 flex items-center gap-2">
                                        <div className="w-8 h-px bg-slate-100 dark:bg-navy-800" /> Resolution Workflow
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {STATUS_OPTIONS.map((s) => (
                                            <Button
                                                key={s.value}
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    "rounded-xl font-black uppercase tracking-widest text-[9px] h-12 border-slate-200 dark:border-navy-800 text-slate-400 dark:text-navy-500 hover:text-primary-500 dark:hover:text-white transition-all",
                                                    selectedItem.status === s.value && cn("bg-primary-500 text-white border-transparent hover:bg-primary-600 shadow-xl shadow-primary-500/30 hover:text-white")
                                                )}
                                                onClick={() => handleUpdateStatus(s.value)}
                                                disabled={updating}
                                            >
                                                {s.label}
                                            </Button>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6 pb-12">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 flex items-center gap-2">
                                        <div className="w-8 h-px bg-slate-100 dark:bg-navy-800" /> Internal Investigation Ledger
                                    </h4>
                                    <Textarea
                                        className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white min-h-[160px] rounded-[1.5rem] focus:ring-primary-500/20 focus:border-primary-500/50 transition-all resize-none p-6 shadow-sm font-medium"
                                        placeholder="Record forensic findings or strategic follow-up plans..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                    <Button
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-primary-500 dark:hover:text-white font-black uppercase tracking-[0.2em] text-xs h-16 rounded-2xl transition-all shadow-2xl group"
                                        onClick={handleSaveNotes}
                                        disabled={updating}
                                    >
                                        {updating ? (
                                            <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 mr-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                        )}
                                        {updating ? 'Synchronizing...' : 'Finalize Investigation Notes'}
                                    </Button>
                                </section>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}


