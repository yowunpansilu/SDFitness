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
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchFeedback();
    }, [statusFilter, categoryFilter]);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const filters: any = {};
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
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
                        Feedback & <span className="text-indigo-400">Bug Reports</span>
                    </h1>
                    <p className="text-navy-400 text-sm font-bold uppercase tracking-widest">Review submissions</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-navy-900/50 border-navy-800 text-white hover:border-indigo-500/50 transition-all">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-900 border-navy-800 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px] bg-navy-900/50 border-navy-800 text-white hover:border-indigo-500/50 transition-all">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-900 border-navy-800 text-white">
                            <SelectItem value="all" className="font-bold">All Categories</SelectItem>
                            {CATEGORY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={fetchFeedback} variant="outline" size="icon" className="border-navy-800 hover:bg-navy-800 text-indigo-400">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className="bg-navy-900/50 border-navy-800 overflow-hidden shadow-2xl shadow-black/20">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-navy-950/50">
                            <TableRow className="border-navy-800 hover:bg-transparent">
                                <TableHead className="text-navy-500 font-black uppercase tracking-widest text-[10px]">Member</TableHead>
                                <TableHead className="text-navy-500 font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                <TableHead className="text-navy-500 font-black uppercase tracking-widest text-[10px]">Message</TableHead>
                                <TableHead className="text-navy-500 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                <TableHead className="text-navy-500 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                                <TableHead className="text-right text-navy-500 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-navy-800">
                                        <TableCell colSpan={6}><div className="h-12 bg-navy-800/20 animate-pulse rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : feedback.length > 0 ? (
                                feedback.map((item) => (
                                    <TableRow
                                        key={item._id}
                                        className="border-navy-800 hover:bg-indigo-500/5 transition-colors group cursor-pointer"
                                        onClick={() => handleViewDetail(item._id)}
                                    >
                                        <TableCell className="font-bold text-white">
                                            {item.userId?.firstName} {item.userId?.lastName}
                                            <p className="text-[10px] text-navy-500 font-medium">{item.userId?.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-white text-sm font-bold capitalize">
                                                {getCategoryIcon(item.category)}
                                                {item.category.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-navy-300 max-w-[200px] md:max-w-[400px] truncate font-medium">
                                            {item.message}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-navy-500 text-[10px] font-black uppercase tracking-tighter">
                                            {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16">
                                        <MessageSquare className="w-12 h-12 text-navy-800 mx-auto mb-4 opacity-50" />
                                        <p className="text-navy-500 font-black uppercase tracking-[0.2em] text-xs">No feedback entries found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="bg-navy-950 border-l border-navy-800 text-white sm:max-w-[600px] overflow-y-auto scrollbar-thin">
                    <SheetHeader className="border-b border-navy-800 pb-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            {selectedItem && getCategoryIcon(selectedItem.category)}
                            <Badge variant="outline" className="border-navy-700 text-navy-400 font-black uppercase tracking-widest text-[9px]">
                                {selectedItem?.category}
                            </Badge>
                        </div>
                        <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-1">
                            Feedback <span className="text-indigo-400">Analysis</span>
                        </SheetTitle>
                        <SheetDescription className="text-navy-500 font-bold uppercase tracking-widest text-[10px]">
                            ID: {selectedItem?._id?.slice(-8)} • {selectedItem && format(new Date(selectedItem.createdAt), 'PPPP p')}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedItem && (
                        <div className="space-y-10">
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">Member Info</h4>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-navy-900/30 border border-navy-800">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg">
                                        {selectedItem.userId?.firstName[0]}{selectedItem.userId?.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-white uppercase tracking-tight">{selectedItem.userId?.firstName} {selectedItem.userId?.lastName}</p>
                                        <p className="text-xs text-navy-500 font-bold">{selectedItem.userId?.email}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">Submission</h4>
                                <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 text-navy-100 font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
                                    {selectedItem.message}
                                </div>
                            </section>

                            {selectedItem.category === 'bug' && (
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">Debug Metadata</h4>
                                        <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-none">Bug Report</Badge>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="p-4 rounded-2xl bg-navy-900/50 border border-navy-800/50 group">
                                            <p className="text-[9px] uppercase font-black text-navy-700 mb-2">URL Origin</p>
                                            <p className="text-xs font-bold text-indigo-400 break-all flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                                                {selectedItem.errorUrl}
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-navy-900/50 border border-navy-800/50">
                                            <p className="text-[9px] uppercase font-black text-navy-700 mb-2">User Environment</p>
                                            <p className="text-xs font-medium text-navy-400 italic leading-relaxed">{selectedItem.userAgent}</p>
                                        </div>
                                        {selectedItem.stackTrace && (
                                            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 shadow-xl overflow-hidden">
                                                <p className="text-[9px] uppercase font-black text-rose-500/70 mb-3 flex items-center gap-2">
                                                    <Bug className="w-3 h-3" /> Stack Trace
                                                </p>
                                                <pre className="text-[10px] text-rose-400/80 font-mono overflow-auto max-h-[300px] p-4 bg-black/40 rounded-xl scrollbar-thin">
                                                    {selectedItem.stackTrace}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className="space-y-4 pt-6 border-t border-navy-800">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">Lifecycle Management</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {STATUS_OPTIONS.map((s) => (
                                        <Button
                                            key={s.value}
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "rounded-xl font-black uppercase tracking-widest text-[9px] h-10 border-navy-800 hover:bg-navy-800",
                                                selectedItem.status === s.value && cn("bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-lg shadow-indigo-900/40")
                                            )}
                                            onClick={() => handleUpdateStatus(s.value)}
                                            disabled={updating}
                                        >
                                            {s.label}
                                        </Button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">Internal Audit Notes</h4>
                                <Textarea
                                    className="bg-navy-900 border-navy-800 text-white min-h-[140px] rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none p-4"
                                    placeholder="Log investigation findings or follow-up actions..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                                <Button
                                    className="w-full bg-white text-navy-950 hover:bg-indigo-50 hover:text-indigo-600 font-black uppercase tracking-widest text-xs h-14 rounded-2xl transition-all shadow-xl shadow-black/20 group"
                                    onClick={handleSaveNotes}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                                    )}
                                    {updating ? 'Processing...' : 'Commit Internal Notes'}
                                </Button>
                            </section>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}


