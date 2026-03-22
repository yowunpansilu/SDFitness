import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Filter, DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Payment {
    id: string;
    transactionId: string;
    memberName: string;
    memberId: string;
    amount: number;
    type: 'membership' | 'personal_training' | 'class_package' | 'merchandise' | 'other';
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'upi';
    date: string;
    description: string;
}

// Mock data
const mockPayments: Payment[] = [
    {
        id: '1',
        transactionId: 'TXN-2024-001234',
        memberName: 'Michael Brown',
        memberId: '1',
        amount: 99.00,
        type: 'membership',
        status: 'completed',
        paymentMethod: 'credit_card',
        date: '2024-02-03',
        description: 'Monthly Premium Membership',
    },
    {
        id: '2',
        transactionId: 'TXN-2024-001235',
        memberName: 'Emily Davis',
        memberId: '2',
        amount: 149.00,
        type: 'membership',
        status: 'completed',
        paymentMethod: 'debit_card',
        date: '2024-02-03',
        description: 'Monthly VIP Membership',
    },
    {
        id: '3',
        transactionId: 'TXN-2024-001236',
        memberName: 'James Wilson',
        memberId: '3',
        amount: 200.00,
        type: 'personal_training',
        status: 'completed',
        paymentMethod: 'upi',
        date: '2024-02-02',
        description: 'Personal Training Package (8 sessions)',
    },
    {
        id: '4',
        transactionId: 'TXN-2024-001237',
        memberName: 'Sarah Parker',
        memberId: '4',
        amount: 49.00,
        type: 'membership',
        status: 'pending',
        paymentMethod: 'bank_transfer',
        date: '2024-02-02',
        description: 'Monthly Basic Membership',
    },
    {
        id: '5',
        transactionId: 'TXN-2024-001238',
        memberName: 'David Kim',
        memberId: '5',
        amount: 99.00,
        type: 'membership',
        status: 'failed',
        paymentMethod: 'credit_card',
        date: '2024-02-01',
        description: 'Monthly Premium Membership',
    },
    {
        id: '6',
        transactionId: 'TXN-2024-001239',
        memberName: 'Lisa Anderson',
        memberId: '6',
        amount: 150.00,
        type: 'class_package',
        status: 'completed',
        paymentMethod: 'cash',
        date: '2024-02-01',
        description: 'Yoga Class Package (10 sessions)',
    },
    {
        id: '7',
        transactionId: 'TXN-2024-001240',
        memberName: 'Tom Martinez',
        memberId: '7',
        amount: 99.00,
        type: 'membership',
        status: 'refunded',
        paymentMethod: 'credit_card',
        date: '2024-01-31',
        description: 'Monthly Premium Membership (Refunded)',
    },
];

const statusColors = {
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    failed: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    refunded: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const paymentTypeLabels = {
    membership: 'Membership',
    personal_training: 'Personal Training',
    class_package: 'Class Package',
    merchandise: 'Merchandise',
    other: 'Other',
};

export function PaymentsList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredPayments = mockPayments.filter((payment) => {
        const matchesSearch =
            payment.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesType = typeFilter === 'all' || payment.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const totalRevenue = mockPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = mockPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const failedCount = mockPayments.filter(p => p.status === 'failed').length;

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Financial <span className="text-indigo-600 italic">Ledger</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Track revenue, pending transactions and billing history.
                    </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
                    <Download className="h-4 w-4 mr-2" />
                    Export Ledger
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Revenue</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Total this period</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Funds</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                            <CreditCard className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">${pendingAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Awaiting clearance</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-500">Successful TX</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {mockPayments.filter(p => p.status === 'completed').length}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Completed orders</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500">Failed TX</CardTitle>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 transition-transform group-hover:scale-110">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{failedCount}</div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Action required</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Search member, transaction or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px] h-11 bg-slate-50 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px] h-11 bg-slate-50 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="membership">Membership</SelectItem>
                                    <SelectItem value="personal_training">Personal Training</SelectItem>
                                    <SelectItem value="class_package">Class Package</SelectItem>
                                    <SelectItem value="merchandise">Merchandise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden font-medium">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6 bg-slate-50/30 dark:bg-slate-900/30">
                    <CardTitle className="text-slate-900 dark:text-white font-black text-xl">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4 pl-6">Transaction ID</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Member</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Type</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Amount</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Method</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Status</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Date</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4 pr-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow
                                        key={payment.id}
                                        onClick={() => navigate(`/payments/${payment.id}`)}
                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                                    >
                                        <TableCell className="p-4 pl-6">
                                            <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                {payment.transactionId}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase text-[11px] tracking-tight">{payment.memberName}</p>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider rounded-lg border-indigo-100 text-indigo-600 bg-indigo-50/30">
                                                {paymentTypeLabels[payment.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                ${payment.amount.toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    {payment.paymentMethod.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge className={cn(statusColors[payment.status], 'font-black text-[10px] uppercase tracking-widest rounded-lg border shadow-none px-2')}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4 text-xs font-bold text-slate-500">
                                            {new Date(payment.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                        </TableCell>
                                        <TableCell className="p-4 pr-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredPayments.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/20">
                            <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4 transition-transform hover:rotate-12">
                                <DollarSign className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-black text-lg">No transactions found</h3>
                            <p className="text-slate-400 text-sm font-medium">Try adjusting your search or filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
