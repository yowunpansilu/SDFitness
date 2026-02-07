import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Download,
    RefreshCw,
    CreditCard,
    User,
    Calendar,
    DollarSign,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
    id: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: {
        type: 'card' | 'cash' | 'bank_transfer';
        cardBrand?: string;
        last4?: string;
    };
    member: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        membershipTier: string;
    };
    plan: {
        name: string;
        duration: string;
    };
    createdAt: string;
    processedAt?: string;
    refundedAt?: string;
    notes?: string;
    invoice?: string;
}

// Mock data
const MOCK_PAYMENT: PaymentData = {
    id: '1',
    transactionId: 'TXN-2026-001234',
    amount: 99.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: {
        type: 'card',
        cardBrand: 'Visa',
        last4: '4242',
    },
    member: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        membershipTier: 'Premium',
    },
    plan: {
        name: 'Premium Monthly',
        duration: '1 Month',
    },
    createdAt: '2026-02-01T10:30:00Z',
    processedAt: '2026-02-01T10:30:15Z',
    notes: 'Payment for February 2026 membership renewal',
    invoice: 'INV-2026-001234',
};

const STATUS_CONFIG = {
    completed: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle2,
        label: 'Completed',
    },
    pending: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock,
        label: 'Pending',
    },
    failed: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: XCircle,
        label: 'Failed',
    },
    refunded: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: RefreshCw,
        label: 'Refunded',
    },
};

export function PaymentDetail() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [paymentData] = useState<PaymentData>(MOCK_PAYMENT);

    const handleDownloadInvoice = () => {
        toast({
            title: 'Invoice Downloaded',
            description: 'The invoice PDF has been downloaded',
        });
    };

    const handleRefund = () => {
        toast({
            title: 'Refund Initiated',
            description: 'The refund request has been submitted',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const StatusIcon = STATUS_CONFIG[paymentData.status].icon;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/payments')}
                        className="text-gray-400 hover:text-white hover:bg-dark-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment #{paymentData.id}</h1>
                        <p className="text-gray-400">{paymentData.transactionId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownloadInvoice}
                        className="bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                    </Button>
                    {paymentData.status === 'completed' && (
                        <Button
                            variant="outline"
                            onClick={handleRefund}
                            className="bg-dark-800 border-dark-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Issue Refund
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-green-500/20">
                                    <DollarSign className="h-8 w-8 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        {formatCurrency(paymentData.amount, paymentData.currency)}
                                    </div>
                                    <div className="text-gray-400">Payment Amount</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={STATUS_CONFIG[paymentData.status].color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {STATUS_CONFIG[paymentData.status].label}
                                </Badge>
                                <Badge variant="outline" className="bg-dark-800 text-gray-300 border-dark-700">
                                    {paymentData.paymentMethod.type === 'card' && (
                                        <>
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            {paymentData.paymentMethod.cardBrand} •••• {paymentData.paymentMethod.last4}
                                        </>
                                    )}
                                    {paymentData.paymentMethod.type === 'cash' && 'Cash Payment'}
                                    {paymentData.paymentMethod.type === 'bank_transfer' && 'Bank Transfer'}
                                </Badge>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-gray-400">Invoice Number</div>
                            <div className="text-xl font-semibold text-white">{paymentData.invoice}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Information */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-400" />
                            Member Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={paymentData.member.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg">
                                    {getInitials(paymentData.member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-white">{paymentData.member.name}</div>
                                <div className="text-sm text-gray-400">{paymentData.member.email}</div>
                                <Badge
                                    variant="outline"
                                    className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30"
                                >
                                    {paymentData.member.membershipTier}
                                </Badge>
                            </div>
                        </div>
                        <Separator className="bg-dark-700" />
                        <Button
                            variant="outline"
                            className="w-full bg-dark-800 border-dark-700 text-gray-300 hover:bg-dark-700"
                            onClick={() => navigate(`/admin/members/${paymentData.member.id}`)}
                        >
                            View Member Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Plan Information */}
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-400" />
                            Plan Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-gray-400">Plan Name</div>
                            <div className="text-white font-medium">{paymentData.plan.name}</div>
                        </div>
                        <Separator className="bg-dark-700" />
                        <div>
                            <div className="text-sm text-gray-400">Duration</div>
                            <div className="text-white font-medium">{paymentData.plan.duration}</div>
                        </div>
                        <Separator className="bg-dark-700" />
                        <div>
                            <div className="text-sm text-gray-400">Price</div>
                            <div className="text-white font-medium">
                                {formatCurrency(paymentData.amount, paymentData.currency)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Timeline */}
            <Card className="bg-dark-900/50 border-dark-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        Transaction Timeline
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Track the payment processing history
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-white">Payment Created</div>
                                <div className="text-sm text-gray-400">{formatDate(paymentData.createdAt)}</div>
                            </div>
                        </div>

                        {paymentData.processedAt && (
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">Payment Processed</div>
                                    <div className="text-sm text-gray-400">{formatDate(paymentData.processedAt)}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Payment successfully processed via {paymentData.paymentMethod.cardBrand}
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentData.refundedAt && (
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-gray-500/20">
                                    <RefreshCw className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">Payment Refunded</div>
                                    <div className="text-sm text-gray-400">{formatDate(paymentData.refundedAt)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Notes */}
            {paymentData.notes && (
                <Card className="bg-dark-900/50 border-dark-800">
                    <CardHeader>
                        <CardTitle className="text-white">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">{paymentData.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
