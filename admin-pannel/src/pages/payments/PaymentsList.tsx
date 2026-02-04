import { useState } from 'react';
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
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const paymentTypeLabels = {
    membership: 'Membership',
    personal_training: 'Personal Training',
    class_package: 'Class Package',
    merchandise: 'Merchandise',
    other: 'Other',
};

export function PaymentsList() {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Payments
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage transactions and payment records
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
                            <CreditCard className="h-4 w-4 text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">${pendingAmount.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 mt-1">{mockPayments.filter(p => p.status === 'pending').length} transactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {mockPayments.filter(p => p.status === 'completed').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Transactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Failed</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{failedCount}</div>
                        <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by member or transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="membership">Membership</SelectItem>
                                <SelectItem value="personal_training">Personal Training</SelectItem>
                                <SelectItem value="class_package">Class Package</SelectItem>
                                <SelectItem value="merchandise">Merchandise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
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
                                <TableRow
                                    key={payment.id}
                                    className="border-dark-700 hover:bg-dark-800/50"
                                >
                                    <TableCell className="font-mono text-sm text-gray-400">
                                        {payment.transactionId}
                                    </TableCell>
                                    <TableCell className="text-white">{payment.memberName}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            {paymentTypeLabels[payment.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white font-semibold">
                                        ${payment.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-gray-400 capitalize">
                                        {payment.paymentMethod.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(statusColors[payment.status])}>
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-white hover:bg-dark-800"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-white hover:bg-dark-800"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredPayments.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No payments found matching your criteria</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
