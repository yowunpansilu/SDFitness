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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';



const statusColors = {
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-100  ',
  pending: 'bg-amber-50 text-amber-600 border-amber-100  ',
  failed: 'bg-rose-50 text-rose-600 border-rose-100  ',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200  ',
};

export function PaymentsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<{
    _id?: string;
    id?: string;
    status: string;
    transactionId?: string;
    memberId?: { userId?: { firstName: string; lastName: string } };
    type?: string;
    amount: number;
    currency?: string;
    createdAt?: string;
    date?: string;
    bankSlipUrl?: string;
    referenceId?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getPayments(statusFilter);
        if (Array.isArray(response)) {
          setPayments(response);
        } else if (response && response.success) {
          setPayments(response.data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch payment records.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [statusFilter, toast]);

  const filteredPayments = payments.filter((payment) => {
    const memberName = payment.memberId?.userId?.firstName + ' ' + payment.memberId?.userId?.lastName;
    const matchesSearch =
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.referenceId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || payment.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + ((p.currency === 'USD' ? p.amount * 300 : p.amount) || 0), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + ((p.currency === 'USD' ? p.amount * 300 : p.amount) || 0), 0);

  const failedCount = payments.filter(p => p.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 dark:text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Payment Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment <span className="text-indigo-600 dark:text-indigo-400">Records</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
            Track revenue, pending transactions and billing history.
          </p>
        </div>
        <Button className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Gross Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-sm">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">LKR {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Total revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Pending Funds</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-sm">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">LKR {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Successful TX</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {payments.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Completed orders</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Failed TX</CardTitle>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-sm">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{failedCount}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="Search member, transaction or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-slate-50 dark:bg-navy-950 border-transparent focus:bg-white dark:focus:bg-navy-950 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-slate-50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none dark:text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-navy-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-slate-50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none dark:text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-white">
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
      <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden font-medium transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-navy-800 pb-6 bg-slate-50/30 dark:bg-navy-950/30">
          <CardTitle className="text-slate-900 dark:text-white font-bold text-xl">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-navy-800 hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4 pl-6">Transaction ID</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Member</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Type</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Amount</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment._id || payment.id}
                    onClick={() => navigate(`/payments/${payment._id || payment.id}`)}
                    className="border-b border-slate-50 dark:border-navy-800/50 hover:bg-slate-50/50 dark:hover:bg-navy-950/50 transition-all cursor-pointer group"
                  >
                    <TableCell className="p-4 pl-6">
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-navy-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded transition-colors">
                        {payment.transactionId || payment.referenceId || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[11px] tracking-tight">
                        {payment.memberId?.userId?.firstName} {payment.memberId?.userId?.lastName}
                      </p>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider rounded-lg border-indigo-100 dark:border-navy-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5 transition-colors">
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        LKR {((payment.currency === 'USD' ? payment.amount * 300 : payment.amount) || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge className={cn(statusColors[payment.status as keyof typeof statusColors], 'font-bold text-xs uppercase tracking-widest rounded-lg border shadow-none px-2 transition-colors')}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-xs font-bold text-slate-500 dark:text-navy-500">
                      {new Date(payment.createdAt || payment.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 rounded-lg transition-all",
                                payment.bankSlipUrl
                                  ? "text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-navy-800"
                                  : "text-slate-200 dark:text-navy-700 cursor-not-allowed opacity-50"
                              )}
                              disabled={!payment.bankSlipUrl}
                              title={payment.bankSlipUrl ? "View Bank Slip" : "No Slip Available"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {payment.bankSlipUrl && (
                            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-navy-900 border-none rounded-xl">
                              <DialogHeader>
                                <DialogTitle className="text-slate-900 dark:text-white text-xl">
                                  Bank Slip <span className="text-indigo-600 dark:text-indigo-400">#{payment.referenceId || payment.transactionId || 'N/A'}</span>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center mt-4 bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-100 dark:border-navy-800">
                                <img
                                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005'}${payment.bankSlipUrl}`}
                                  alt="Bank Slip"
                                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                                />
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-navy-800 rounded-lg transition-all"
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
            <div className="text-center py-20 bg-slate-50/20 dark:bg-navy-950/20 transition-colors">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-navy-950 mb-4 transition-transform hover:rotate-12">
                <DollarSign className="h-8 w-8 text-slate-400 dark:text-navy-800" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg uppercase tracking-tight">No transactions found</h3>
              <p className="text-slate-400 dark:text-navy-500 text-sm font-medium">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
