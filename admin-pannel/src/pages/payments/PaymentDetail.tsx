import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, User, CreditCard, DollarSign, Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const statusColors = {
  completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  failed: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  refunded: 'bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-navy-400 border-slate-200 dark:border-navy-700',
};

// Mock data removed in favor of service calls

export function PaymentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [payment, setPayment] = useState<{
    _id?: string;
    id?: string;
    status: string;
    bankSlipUrl?: string;
    transactionId?: string;
    invoiceNumber?: string;
    memberId?: { _id?: string, userId?: { firstName?: string, lastName?: string, email?: string }, phone?: string, address?: string };
    createdAt?: string;
    date?: string;
    paymentMethod?: string;
    cardLast4?: string;
    items?: { description: string, quantity: number, unitPrice: number, total: number }[];
    description?: string;
    type?: string;
    amount: number;
    currency?: string;
    referenceId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await paymentService.getPaymentDetails(id);
          if (response.success) {
            setPayment(response.payment || response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch payment details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    if (!payment) return;
    try {
      await paymentService.approvePayment(payment._id || payment.id!);
      setPayment({ ...payment, status: 'completed' });
      toast({ title: 'Success', description: 'Payment approved successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve payment.', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!payment) return;
    try {
      await paymentService.rejectPayment(payment._id || payment.id!, 'Rejected by admin');
      setPayment({ ...payment, status: 'failed' });
      toast({ title: 'Success', description: 'Payment rejected.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject payment.', variant: 'destructive' });
    }
  };

  const handleViewSlip = () => {
    if (!payment) return;
    if (payment.bankSlipUrl) {
      window.open(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005'}${payment.bankSlipUrl}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 dark:text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Transaction Details...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold">Transaction not found.</p>
        <Button onClick={() => navigate('/payments')} variant="link">Back to Payments</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header - Hidden on print */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="h-12 w-12 rounded-2xl text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-navy-800/50 transition-all p-0 flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-navy-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors uppercase">
              Transaction <span className="text-indigo-600 dark:text-indigo-400">Details</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mt-1">Ref ID: {payment.transactionId || 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {payment.status === 'pending' && (
            <>
              <Button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all shadow-lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all shadow-lg"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {payment.bankSlipUrl && (
            <Button
              onClick={handleViewSlip}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all shadow-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Slip
            </Button>
          )}
          <Button
            onClick={handlePrint}
            variant="ghost"
            className="h-11 px-6 bg-slate-50 dark:bg-navy-950 border-none text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-navy-800 rounded-xl font-bold uppercase text-xs tracking-widest transition-all"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Record
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm rounded-[3rem] overflow-hidden transition-colors font-medium print:bg-white print:border-slate-300 print:shadow-none print:rounded-none">
        <CardContent className="p-12 print:p-8">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 rotate-3">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h2 className="text-4xl font-bold tracking-normal text-slate-900 dark:text-white print:text-black uppercase">PAYMENT <span className="text-indigo-600 dark:text-indigo-400">RECEIPT</span></h2>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 print:text-slate-600">
                Invoice Number: {payment.invoiceNumber || payment.transactionId || 'N/A'}
              </p>
            </div>
          </div>

          <Separator className="my-10 bg-slate-50 dark:bg-navy-800 transition-colors" />

          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <User className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">
                  BILL TO
                </h4>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black mb-2 uppercase">
                  {payment.memberId?.userId ? `${payment.memberId.userId.firstName} ${payment.memberId.userId.lastName}` : 'N/A'}
                </p>
                <div className="space-y-1 text-sm font-bold text-slate-500 dark:text-navy-400">
                  <p>{payment.memberId?.userId?.email}</p>
                  <p>{payment.memberId?.phone}</p>
                  <p className="mt-4">{payment.memberId?.address || 'Colombo, Sri Lanka'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">
                  PAYMENT SUMMARY
                </h4>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 space-y-6 transition-colors font-bold uppercase text-xs tracking-widest text-slate-400 dark:text-navy-600">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-navy-800">
                  <span>Payment Date</span>
                  <span className="text-slate-900 dark:text-white">{new Date(payment.createdAt || payment.date || '').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-navy-800">
                  <span>Method</span>
                  <span className="text-slate-900 dark:text-white">{payment.paymentMethod?.replace('_', ' ') || 'Cash'} {payment.cardLast4 ? `• ${payment.cardLast4}` : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <Badge className={cn(statusColors[payment.status as keyof typeof statusColors], 'font-bold text-xs uppercase tracking-widest rounded-lg border shadow-none px-3 py-1 transition-colors')}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12 overflow-hidden rounded-[2rem] border border-slate-100 dark:border-navy-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950/50 border-b border-slate-100 dark:border-navy-800 transition-colors">
                  <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Description</th>
                  <th className="py-5 px-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Rate</th>
                  <th className="py-5 px-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Qty</th>
                  <th className="py-5 px-8 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Total (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-navy-950">
                {(payment.items || [{ description: payment.description || payment.type || '', quantity: 1, unitPrice: payment.amount, total: payment.amount }]).map((item: { description: string, quantity: number, unitPrice: number, total: number }, index: number) => {
                  const unitPriceLkr = payment.currency === 'USD' ? item.unitPrice * 300 : item.unitPrice;
                  const totalLkr = payment.currency === 'USD' ? item.total * 300 : item.total;
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30 transition-all">
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.description}</p>
                      </td>
                      <td className="py-6 px-8 text-center text-sm font-bold text-slate-600 dark:text-navy-400">LKR {unitPriceLkr?.toLocaleString()}</td>
                      <td className="py-6 px-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</td>
                      <td className="py-6 px-8 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">LKR {totalLkr?.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mb-4">Note</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-navy-400 leading-relaxed uppercase">
                Thank you for your business. For any billing inquiries, please contact our support team.
              </p>
            </div>
            <div className="w-full md:w-80 p-8 rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/20 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70">
                <span>Subtotal</span>
                <span>LKR {((payment.currency === 'USD' ? payment.amount * 300 : payment.amount) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70 pb-4 border-b border-white/10">
                <span>Tax</span>
                <span>LKR 0</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-bold tracking-normal">LKR {((payment.currency === 'USD' ? payment.amount * 300 : payment.amount) || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer - Only visible on print or at very bottom */}
          <div className="mt-16 pt-10 border-t border-slate-50 dark:border-navy-950 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-300 dark:text-navy-800 transition-colors">
              SD FITNESS OFFICIAL RECEIPT
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auxiliary Intel - Hidden on print */}
      <div className="grid gap-8 md:grid-cols-2 print:hidden">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
              <label className="text-[11px] font-bold text-slate-400 dark:text-navy-600 uppercase mb-1 block">Member ID</label>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase transition-colors">{payment.memberId?._id || 'N/A'}</p>
            </div>
            <Button
              onClick={() => navigate(`/members/${payment.memberId?._id}`)}
              className="w-full h-14 bg-white dark:bg-navy-950 border-2 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white hover:border-indigo-500 font-bold uppercase text-xs tracking-widest rounded-2xl transition-all shadow-sm"
            >
              View Member Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
              System Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4 font-bold uppercase text-[11px] tracking-widest">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 transition-colors">
                <span className="text-slate-400 dark:text-navy-600 block mb-1">TX REFERENCE</span>
                <span className="text-slate-900 dark:text-white truncate block">{payment.transactionId || 'N/A'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 transition-colors">
                <span className="text-slate-400 dark:text-navy-600 block mb-1">Process Node</span>
                <span className="text-slate-900 dark:text-white">SD-FIN-MAIN</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 text-center transition-colors">
              <span className="text-slate-400 dark:text-navy-600 text-[11px] font-bold uppercase tracking-widest text-xs">Recorded at</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 uppercase">{new Date(payment.createdAt || payment.date || '').toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
