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
        switch (status) {
            case 'pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'reviewed': return <Badge variant="secondary"><Search className="w-3 h-3 mr-1" /> Reviewed</Badge>;
            case 'resolved': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bug': return <Bug className="w-4 h-4 text-rose-500" />;
            case 'suggestion': return <MessageSquare className="w-4 h-4 text-amber-500" />;
            case 'complaint': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            default: return <MessageSquare className="w-4 h-4 text-indigo-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
                        Feedback & <span className="text-indigo-400">Bug Reports</span>
                    </h1>
                    <p className="text-navy-400 text-sm font-bold uppercase tracking-widest">Review and manage member submissions</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] bg-navy-900/50 border-navy-800 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-900 border-navy-800 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px] bg-navy-900/50 border-navy-800 text-white">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-navy-900 border-navy-800 text-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="bug">Bug Reports</SelectItem>
                            <SelectItem value="suggestion">Suggestions</SelectItem>
                            <SelectItem value="complaint">Complaints</SelectItem>
                            <SelectItem value="feature_request">Feature Requests</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={fetchFeedback} variant="outline" size="icon" className="border-navy-800 hover:bg-navy-800 text-white">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className="bg-navy-900/50 border-navy-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-navy-950/50">
                        <TableRow className="border-navy-800">
                            <TableHead className="text-navy-400 font-black uppercase tracking-widest text-[10px]">Member</TableHead>
                            <TableHead className="text-navy-400 font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                            <TableHead className="text-navy-400 font-black uppercase tracking-widest text-[10px]">Message</TableHead>
                            <TableHead className="text-navy-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="text-navy-400 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                            <TableHead className="text-right text-navy-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-navy-800">
                                    <TableCell colSpan={6}><div className="h-12 bg-navy-800/20 animate-pulse rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : feedback.length > 0 ? (
                            feedback.map((item) => (
                                <TableRow key={item._id} className="border-navy-800 hover:bg-navy-800/30 transition-colors group cursor-pointer" onClick={() => handleViewDetail(item._id)}>
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
                                    <TableCell className="text-navy-300 max-w-[300px] truncate font-medium">
                                        {item.message}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                    <TableCell className="text-navy-400 text-xs font-bold">
                                        {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:bg-indigo-500/10">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-navy-500 font-bold uppercase tracking-widest text-sm">
                                    No feedback entries found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="bg-navy-950 border-l border-navy-800 text-white sm:max-w-[600px] overflow-y-auto">
                    <SheetHeader className="border-b border-navy-800 pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            {selectedItem && getCategoryIcon(selectedItem.category)}
                            <Badge variant="outline" className="border-navy-700 text-navy-400 uppercase tracking-widest text-[10px]">
                                {selectedItem?.category}
                            </Badge>
                        </div>
                        <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">
                            Feedback <span className="text-indigo-400">Details</span>
                        </SheetTitle>
                        <SheetDescription className="text-navy-500">
                            Submitted by {selectedItem?.userId?.firstName} on {selectedItem && format(new Date(selectedItem.createdAt), 'PPPP p')}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedItem && (
                        <div className="space-y-8">
                            <section className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-500">Message</h4>
                                <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 text-navy-100 font-medium whitespace-pre-wrap leading-relaxed">
                                    {selectedItem.message}
                                </div>
                            </section>

                            {selectedItem.category === 'bug' && (
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-500">Debug Metadata</h4>
                                    <div className="grid gap-4">
                                        <div className="p-3 rounded-xl bg-navy-900/50 border border-navy-800/50">
                                            <p className="text-[9px] uppercase font-black text-navy-600 mb-1">URL</p>
                                            <p className="text-xs font-bold text-indigo-400 break-all flex items-center gap-2">
                                                {selectedItem.errorUrl}
                                                <ExternalLink className="w-3 h-3" />
                                            </p>
                                        </div>
                                        {(import.meta as any).env?.DEV && (
                                            <div className="mt-8 p-4 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                            </div>
                                        )}
                                        <div className="p-3 rounded-xl bg-navy-900/50 border border-navy-800/50">
                                            <p className="text-[9px] uppercase font-black text-navy-600 mb-1">User Agent</p>
                                            <p className="text-xs font-medium text-navy-300 italic">{selectedItem.userAgent}</p>
                                        </div>
                                        {selectedItem.stackTrace && (
                                            <div className="p-3 rounded-xl bg-navy-900/50 border border-navy-800/50">
                                                <p className="text-[9px] uppercase font-black text-navy-600 mb-1">Stack Trace</p>
                                                <pre className="text-[10px] text-rose-400/80 font-mono overflow-auto max-h-[300px] p-2 bg-black/30 rounded">
                                                    {selectedItem.stackTrace}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className="space-y-4 pt-4 border-t border-navy-800">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-500">Status Management</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'reviewed', 'resolved'].map((s) => (
                                        <Button
                                            key={s}
                                            variant={selectedItem.status === s ? 'default' : 'outline'}
                                            size="sm"
                                            className={cn(
                                                "rounded-xl font-bold uppercase tracking-widest text-[10px] h-9 px-4",
                                                selectedItem.status === s && "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/40"
                                            )}
                                            onClick={() => handleUpdateStatus(s)}
                                            disabled={updating}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-500">Admin Internal Notes</h4>
                                <Textarea
                                    className="bg-navy-900 border-navy-800 text-white min-h-[120px] rounded-2xl"
                                    placeholder="Add notes about investigation, fix, or follow-up..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                                <Button
                                    className="w-full bg-navy-100 text-navy-950 hover:bg-white font-black uppercase tracking-widest text-xs h-12 rounded-2xl"
                                    onClick={handleSaveNotes}
                                    disabled={updating}
                                >
                                    {updating ? 'Saving...' : 'Save Internal Notes'}
                                </Button>
                            </section>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
