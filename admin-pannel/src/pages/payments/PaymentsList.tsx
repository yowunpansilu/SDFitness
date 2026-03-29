import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, MoreVertical, Loader2, DollarSign, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  _id: string;
  member: {
      userId: {
          firstName: string;
          lastName: string;
          email: string;
      };
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: string;
  transactionId: string;
}

const statusConfig = {
  completed: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2, label: 'COMPLETED' },
  pending: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock, label: 'PENDING' },
  failed: { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle, label: 'FAILED' },
  refunded: { color: 'bg-slate-100 text-slate-600 border-slate-300', icon: AlertCircle, label: 'REFUNDED' },
};

export function PaymentsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (error) {
       console.error('Error fetching payments:', error);
       toast({
         title: 'Protocol Fault',
         description: 'Failed to access financial matrix nodes.',
         variant: 'destructive',
       });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(`Irreversibly purge transaction record ${id}?`)) return;
    try {
      await paymentService.deletePayment(id);
      toast({ title: 'Record Purged', description: 'Transaction removed from financial records.' });
      setPayments(prev => prev.filter(p => p._id !== id));
    } catch (error) {
       toast({ title: 'Execution Failed', description: 'Could not delete transaction.', variant: 'destructive' });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const memberName = `${payment.member?.userId?.firstName || ''} ${payment.member?.userId?.lastName || ''}`.toLowerCase();
    const matchesSearch = memberName.includes(searchQuery.toLowerCase()) || 
                         payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Parsing Ledger Matrices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Revenue <span className="text-indigo-600 italic font-medium">Ledger</span>
          </h1>
          <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Financial node oversight and transaction tracking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-300 bg-white text-slate-600 rounded-xl h-11 px-6 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border-2">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button
            onClick={() => navigate('/payments/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-[10px] tracking-widest transition-all hover:scale-105 border border-slate-300"
          >
            <Plus className="h-4 w-4 mr-2" /> Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">LKR {totalRevenue.toLocaleString()}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Total confirmed intake</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Total TXNs</CardTitle>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{payments.length}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Financial nodes recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{payments.filter(p => p.status === 'pending').length}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Validation in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-500">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{payments.filter(p => p.status === 'failed').length}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Transmission failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Card */}
      <Card className="bg-white border-slate-300 rounded-3xl overflow-hidden border-2 shadow-2xl">
        <CardHeader className="border-b border-slate-300 p-6 flex flex-row items-center justify-between bg-slate-50/30">
          <div className="flex flex-col gap-1">
             <CardTitle className="text-slate-900 font-black text-xl uppercase tracking-tight">Active Transactions</CardTitle>
             <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic font-medium">Real-time ledger entries</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-800 group-focus-within:text-indigo-600" />
                <input 
                  type="text" 
                  placeholder="Find TransID or Member..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border-none rounded-xl h-10 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-900 outline-none w-64 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold"
                />
             </div>
             <Button variant="ghost" size="icon" className="rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-300 bg-slate-50/20 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 py-6 px-8">Member Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 p-4">Transmission ID</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 p-4">Quantum Amount</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 p-4">Protocol Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 p-4">Time Entry</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-800 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => {
                const config = statusConfig[p.status];
                const StatusIcon = config.icon;
                return (
                  <TableRow key={p._id} className="border-b border-slate-300/40 hover:bg-slate-100/20 transition-all group">
                    <TableCell className="px-8 py-6">
                       <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                            {p.member?.userId?.firstName} {p.member?.userId?.lastName}
                          </p>
                          <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{p.member?.userId?.email}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{p.transactionId}</TableCell>
                    <TableCell>
                       <span className="text-sm font-black text-slate-900 tracking-tighter">LKR {p.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-none", config.color)}>
                         <StatusIcon className="h-2.5 w-2.5 mr-1.5" />
                         {config.label}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                       {new Date(p.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-slate-50 border-slate-300 text-slate-900 rounded-xl shadow-2xl p-2 w-48">
                           <DropdownMenuItem onClick={() => navigate(`/payments/${p._id}`)} className="p-3 rounded-lg focus:bg-slate-100 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                             <FileText className="h-3 w-3 mr-2" /> View Details
                           </DropdownMenuItem>
                           <DropdownMenuItem className="p-3 rounded-lg focus:bg-slate-100 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                             <Download className="h-3 w-3 mr-2" /> Download Report
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className="bg-slate-100" />
                           <DropdownMenuItem onClick={() => handleDelete(p._id)} className="p-3 rounded-lg focus:bg-rose-500/10 text-rose-500 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                             <Trash2 className="h-3 w-3 mr-2" /> Purge Record
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredPayments.length === 0 && (
             <div className="py-24 text-center">
                <FileText className="h-10 w-10 text-slate-900 mx-auto mb-4" />
                <p className="text-slate-700 font-black text-[10px] uppercase tracking-[0.3em]">Ledger matrix returned void</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
