import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Mail, User, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function PaymentDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                // Try billing transaction first
                try {
                    const res = await api.get(`/billing/transactions/${id}`);
                    setPayment(res.data);
                } catch {
                    // Fall back to subscription lookup
                    try {
                        const res = await api.get(`/membership/subscriptions/${id}`);
                        const sub = res.data;
                        // Also try to fetch member data
                        let member: any = {};
                        if (sub.member) {
                            try {
                                const memberRes = await api.get(`/members/${typeof sub.member === 'string' ? sub.member : sub.member._id}`);
                                member = memberRes.data;
                            } catch { /* ok */ }
                        }
                        const user = member.user || {};
                        setPayment({
                            _id: sub._id,
                            transactionId: `SUB-${sub._id?.slice(-6)}`,
                            invoiceNumber: `INV-${sub._id?.slice(-6)}`,
                            date: sub.startDate || sub.createdAt,
                            member: {
                                id: member._id || sub.member,
                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                                email: user.email || '—',
                                phone: user.phone || '—',
                            },
                            amount: sub.amount || sub.plan?.price || 0,
                            tax: 0,
                            total: sub.amount || sub.plan?.price || 0,
                            type: 'membership',
                            status: sub.status || 'active',
                            paymentMethod: sub.paymentMethod || 'card',
                            description: sub.plan?.name || 'Membership',
                            billingPeriod: sub.startDate ? {
                                start: sub.startDate,
                                end: sub.endDate,
                            } : null,
                            items: [{
                                description: sub.plan?.name || 'Membership Subscription',
                                quantity: 1,
                                unitPrice: sub.amount || sub.plan?.price || 0,
                                total: sub.amount || sub.plan?.price || 0,
                            }],
                        });
                    } catch {
                        setPayment(null);
                    }
                }
            } catch { setPayment(null); }
            setLoading(false);
        };
        fetchPayment();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
    if (!payment) return <div className="text-center py-12"><p className="text-gray-400">Payment not found</p><Button onClick={() => navigate('/payments')} className="mt-4">Back</Button></div>;

    const memberInfo = payment.member || {};
    const items = payment.items || [{ description: payment.description || 'Payment', quantity: 1, unitPrice: payment.amount, total: payment.amount }];
    const amount = payment.amount || 0;
    const tax = payment.tax || 0;
    const total = payment.total || amount;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/payments')} className="text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Payment Details</h1>
                        <p className="text-gray-400 mt-2">Transaction #{payment.transactionId || payment._id?.slice(-8)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-dark-700 text-gray-300 hover:bg-dark-800"><Mail className="h-4 w-4 mr-2" /> Email Invoice</Button>
                    <Button onClick={() => window.print()} variant="outline" className="border-dark-700 text-gray-300 hover:bg-dark-800"><Printer className="h-4 w-4 mr-2" /> Print</Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                </div>
            </div>

            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm print:bg-white print:border-gray-300">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div><h2 className="text-3xl font-bold text-white print:text-black">INVOICE</h2><p className="text-gray-400 mt-1 print:text-gray-600">#{payment.invoiceNumber || payment._id?.slice(-8)}</p></div>
                        <div className="text-right"><h3 className="text-xl font-bold text-white print:text-black">SD Fitness</h3><p className="text-gray-400 text-sm mt-1 print:text-gray-600">456 Fitness Avenue<br />Los Angeles, CA 90001<br />contact@sdfitness.com</p></div>
                    </div>
                    <Separator className="my-6 print:bg-gray-300" />
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 print:text-gray-600">BILL TO</h4>
                            <div className="text-white print:text-black">
                                <p className="font-semibold">{memberInfo.name || '—'}</p>
                                <p className="text-sm text-gray-400 print:text-gray-600 mt-1">{memberInfo.email || ''}</p>
                                <p className="text-sm text-gray-400 print:text-gray-600">{memberInfo.phone || ''}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="space-y-2">
                                <div><span className="text-sm text-gray-400">Invoice Date:</span><p className="text-white font-semibold print:text-black">{payment.date ? new Date(payment.date).toLocaleDateString() : '—'}</p></div>
                                <div><span className="text-sm text-gray-400">Payment Method:</span><p className="text-white font-semibold print:text-black capitalize">{(payment.paymentMethod || '—').replace('_', ' ')}</p></div>
                                <div><span className="text-sm text-gray-400">Status:</span><div className="mt-1"><Badge className={cn(statusColors[payment.status] || statusColors.pending)}>{payment.status}</Badge></div></div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-6 print:bg-gray-300" />
                    {payment.billingPeriod && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2 print:text-gray-600">BILLING PERIOD</h4>
                            <p className="text-white print:text-black">{new Date(payment.billingPeriod.start).toLocaleDateString()} - {payment.billingPeriod.end ? new Date(payment.billingPeriod.end).toLocaleDateString() : 'Ongoing'}</p>
                        </div>
                    )}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead><tr className="border-b border-dark-700 print:border-gray-300"><th className="text-left py-3 text-sm font-semibold text-gray-400">DESCRIPTION</th><th className="text-center py-3 text-sm font-semibold text-gray-400">QTY</th><th className="text-right py-3 text-sm font-semibold text-gray-400">UNIT PRICE</th><th className="text-right py-3 text-sm font-semibold text-gray-400">TOTAL</th></tr></thead>
                            <tbody>
                                {items.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-dark-800 print:border-gray-200">
                                        <td className="py-4 text-white print:text-black">{item.description}</td>
                                        <td className="py-4 text-center text-white print:text-black">{item.quantity}</td>
                                        <td className="py-4 text-right text-white print:text-black">LKR {(item.unitPrice || 0).toLocaleString()}</td>
                                        <td className="py-4 text-right text-white font-semibold print:text-black">LKR {(item.total || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-400"><span>Subtotal:</span><span className="text-white print:text-black">LKR {amount.toLocaleString()}</span></div>
                            {tax > 0 && <div className="flex justify-between text-gray-400"><span>Tax:</span><span className="text-white print:text-black">LKR {tax.toLocaleString()}</span></div>}
                            <Separator className="print:bg-gray-300" />
                            <div className="flex justify-between text-xl font-bold"><span className="text-white print:text-black">Total:</span><span className="text-white print:text-black">LKR {total.toLocaleString()}</span></div>
                        </div>
                    </div>
                    <div className="mt-12 pt-6 border-t border-dark-800 print:border-gray-300"><p className="text-sm text-gray-400 text-center print:text-gray-600">Thank you for your business! For any questions, contact us at support@sdfitness.com</p></div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 print:hidden">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5" /> Member Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div><label className="text-sm text-gray-400">Name</label><p className="text-white">{memberInfo.name || '—'}</p></div>
                        {memberInfo.id && <Button onClick={() => navigate(`/members/${memberInfo.id}`)} variant="outline" className="w-full border-dark-700 text-gray-300 hover:bg-dark-800">View Member Profile</Button>}
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><FileText className="h-5 w-5" /> Transaction Details</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div><label className="text-sm text-gray-400">Transaction ID</label><p className="text-white font-mono text-sm">{payment.transactionId || payment._id}</p></div>
                        <div><label className="text-sm text-gray-400">Payment Type</label><p className="text-white capitalize">{(payment.type || '—').replace('_', ' ')}</p></div>
                        <div><label className="text-sm text-gray-400">Processed At</label><p className="text-white">{payment.date ? new Date(payment.date).toLocaleString() : '—'}</p></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
