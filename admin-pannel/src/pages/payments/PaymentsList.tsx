import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Filter, DollarSign, CreditCard, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface Payment {
    _id: string;
    transactionId?: string;
    memberName?: string;
    memberId?: string;
    amount: number;
    type: string;
    status: string;
    paymentMethod?: string;
    date?: string;
    createdAt?: string;
    description?: string;
    user?: any;
    plan?: any;
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const paymentTypeLabels: Record<string, string> = {
    membership: 'Membership',
    personal_training: 'Personal Training',
    class_package: 'Class Package',
    merchandise: 'Merchandise',
    subscription: 'Subscription',
    other: 'Other',
};

export function PaymentsList() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // Try /billing/transactions first, fall back to /subscriptions
                let data: Payment[] = [];
                try {
                    const res = await api.get('/billing/transactions');
                    data = res.data || [];
                } catch {
                    // If billing module isn't available, build payment list from subscriptions + members
                    try {
                        const [subsRes, membersRes] = await Promise.all([
                            api.get('/membership/subscriptions'),
                            api.get('/members'),
                        ]);
                        const subs = subsRes.data || [];
                        const membersMap = new Map((membersRes.data || []).map((m: any) => [m._id, m]));

                        data = subs.map((sub: any, i: number) => {
                            const member = membersMap.get(sub.member) as any;
                            const user = member?.user || {};
                            return {
                                _id: sub._id || `sub-${i}`,
                                transactionId: `SUB-${sub._id?.slice(-6) || i}`,
                                memberName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                                memberId: sub.member,
                                amount: sub.amount || sub.plan?.price || 0,
                                type: 'membership',
                                status: sub.status || 'active',
                                paymentMethod: sub.paymentMethod || 'card',
                                date: sub.startDate || sub.createdAt,
                                description: sub.plan?.name || 'Membership',
                            };
                        });
                    } catch {
                        data = [];
                    }
                }
                setPayments(data);
            } catch { setPayments([]); }
            setLoading(false);
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter((payment) => {
        const name = payment.memberName || '';
        const txnId = payment.transactionId || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || txnId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesType = typeFilter === 'all' || payment.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalRevenue = payments.filter(p => ['completed', 'paid', 'active'].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failedCount = payments.filter(p => p.status === 'failed').length;
    const completedCount = payments.filter(p => ['completed', 'paid', 'active'].includes(p.status)).length;

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Payments</h1>
                    <p className="text-gray-400 mt-2">Manage transactions and payment records</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"><Download className="h-4 w-4 mr-2" /> Export Report</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-green-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">LKR {totalRevenue.toLocaleString()}</div><p className="text-xs text-gray-500 mt-1">{completedCount} completed</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle><CreditCard className="h-4 w-4 text-yellow-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">LKR {pendingAmount.toLocaleString()}</div><p className="text-xs text-gray-500 mt-1">{payments.filter(p => p.status === 'pending').length} transactions</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle><TrendingUp className="h-4 w-4 text-blue-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{completedCount}</div><p className="text-xs text-gray-500 mt-1">Transactions</p></CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-gray-400">Failed</CardTitle><AlertCircle className="h-4 w-4 text-red-400" /></div></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-white">{failedCount}</div><p className="text-xs text-gray-500 mt-1">Requires attention</p></CardContent>
                </Card>
            </div>

            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Search by member or transaction ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white"><div className="flex items-center gap-2"><Filter className="h-4 w-4" /><SelectValue placeholder="Status" /></div></SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="membership">Membership</SelectItem>
                                <SelectItem value="personal_training">Personal Training</SelectItem>
                                <SelectItem value="class_package">Class Package</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-white">Recent Transactions</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-dark-700 hover:bg-transparent">
                                <TableHead className="text-gray-400">Transaction ID</TableHead>
                                <TableHead className="text-gray-400">Member</TableHead>
                                <TableHead className="text-gray-400">Type</TableHead>
                                <TableHead className="text-gray-400">Amount</TableHead>
                                <TableHead className="text-gray-400">Method</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Date</TableHead>
                                <TableHead className="text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment) => (
                                <TableRow key={payment._id} onClick={() => navigate(`/payments/${payment._id}`)} className="border-dark-700 hover:bg-dark-800/50 cursor-pointer">
                                    <TableCell className="font-mono text-sm text-gray-400">{payment.transactionId || payment._id?.slice(-8)}</TableCell>
                                    <TableCell className="text-white">{payment.memberName || '—'}</TableCell>
                                    <TableCell><Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{paymentTypeLabels[payment.type] || payment.type}</Badge></TableCell>
                                    <TableCell className="text-white font-semibold">LKR {payment.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-gray-400 capitalize">{(payment.paymentMethod || '—').replace('_', ' ')}</TableCell>
                                    <TableCell><Badge className={cn(statusColors[payment.status] || statusColors.pending)}>{payment.status}</Badge></TableCell>
                                    <TableCell className="text-gray-400">{payment.date ? new Date(payment.date).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-dark-800"><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-dark-800"><Download className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredPayments.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No payments found matching your criteria</p></div>}
                </CardContent>
            </Card>
        </div>
    );
}
