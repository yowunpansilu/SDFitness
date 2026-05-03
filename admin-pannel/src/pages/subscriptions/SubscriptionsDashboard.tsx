import { useState, useEffect } from 'react';
import {
    CreditCard,
    RefreshCw,
    AlertCircle,
    Search,
    User,
    ArrowUpRight,
    Ban,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { membershipService } from '@/services/membershipService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function SubscriptionsDashboard() {
    const { toast } = useToast();
    const [renewals, setRenewals] = useState<{ memberName: string; email: string; plan?: { name?: string }; nextChargeAmount?: number; hasToken?: boolean; endDate: string; memberId: string; paymentMethod?: { brand?: string; last4?: string } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchRenewals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRenewals = async () => {
        try {
            setLoading(true);
            const response = await membershipService.getUpcomingRenewals();
            if (response.success) {
                setRenewals(response.data);
            }
        } catch (error) {
            console.error('Error fetching renewals:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch subscription renewals.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (memberId: string) => {
        setCancellingId(memberId);
        setIsDialogOpen(true);
    };

    const confirmCancel = async () => {
        if (!cancellingId) return;

        try {
            const response = await membershipService.cancelAutoRenewal(cancellingId);
            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Auto-renewal has been disabled for this member.',
                });
                fetchRenewals(); // Refresh list
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to cancel auto-renewal.',
                variant: 'destructive',
            });
        } finally {
            setIsDialogOpen(false);
            setCancellingId(null);
        }
    };

    const filteredRenewals = renewals.filter(r =>
        r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const totalActive = renewals.length;
    const projectedRevenue = renewals.reduce((sum, r) => sum + (r.nextChargeAmount || 0), 0);
    const missingMethods = renewals.filter(r => !r.hasToken).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Subscriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Subscriptions & <span className="text-indigo-600 dark:text-indigo-400">Renewals</span>
                    </h1>
                    <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
                        Monitor automated charges and manage upcoming renewals.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchRenewals}
                        className="rounded-xl border-slate-200 dark:border-navy-800"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Auto-Renewals</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <RefreshCw className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalActive}</div>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Subscribers on auto-pay</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Projected Revenue</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">LKR {projectedRevenue.toLocaleString()}</div>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Estimated from next cycle</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500">Attention Required</CardTitle>
                        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{missingMethods}</div>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Missing payment methods</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Search member, email or plan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 h-11 bg-slate-50 dark:bg-navy-950 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Renewals Table */}
            <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden font-medium">
                <CardHeader className="border-b border-slate-100 dark:border-navy-800 pb-6 bg-slate-50/30 dark:bg-navy-950/30">
                    <CardTitle className="text-slate-900 dark:text-white font-bold text-xl">Upcoming Renewals</CardTitle>
                    <CardDescription>Members whose subscriptions will be automatically charged soon.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 dark:border-navy-800 hover:bg-transparent">
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4 pl-6">Member</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4">Plan</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4">Expiry Date</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4">Payment Method</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4">Charge Amount</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 p-4 pr-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRenewals.map((renewal) => (
                                    <TableRow
                                        key={renewal.memberId}
                                        className="border-b border-slate-50 dark:border-navy-800/50 hover:bg-slate-50/50 dark:hover:bg-navy-950/50 transition-all group"
                                    >
                                        <TableCell className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-tight">
                                                        {renewal.memberName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{renewal.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider rounded-lg border-indigo-100 text-indigo-600 bg-indigo-50/30">
                                                {renewal.plan?.name || 'Unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {format(new Date(renewal.endDate), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black">
                                                    Next Charge Date
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            {renewal.hasToken ? (
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-indigo-500" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-navy-300">
                                                        {renewal.paymentMethod?.brand} •••• {renewal.paymentMethod?.last4}
                                                    </span>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-xs font-bold uppercase">No Token</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                LKR {renewal.nextChargeAmount?.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4 pr-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancelClick(renewal.memberId)}
                                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-bold text-xs uppercase"
                                            >
                                                <Ban className="h-3.5 w-3.5 mr-1.5" />
                                                Cancel Renewal
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredRenewals.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/20 dark:bg-navy-950/20">
                            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-navy-950 mb-4 transition-transform hover:rotate-12">
                                <RefreshCw className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg uppercase tracking-tight">No upcoming renewals</h3>
                            <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or checking back later.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                            Cancel <span className="text-rose-500">Auto-Renewal?</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium">
                            This will disable automatic charging for this member. They will need to manually pay to renew their subscription when it expires.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold">Stay Active</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancel}
                            className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200"
                        >
                            Disable Auto-Pay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
