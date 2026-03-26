import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Mail, User, FileText, Hash, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const statusColors = {
  completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  failed: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  refunded: 'bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-navy-400 border-slate-200 dark:border-navy-700',
};

// Mock data
const mockPayment = {
  id: '1',
  transactionId: 'TXN-2024-001234',
  invoiceNumber: 'INV-2024-001234',
  date: '2024-02-03T10:30:00',
  member: {
    id: '1',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Apt 4B, New York, NY 10001',
  },
  amount: 99.00,
  tax: 8.91,
  total: 107.91,
  type: 'membership',
  status: 'completed' as const,
  paymentMethod: 'credit_card',
  cardLast4: '4242',
  description: 'Monthly Premium Membership',
  billingPeriod: {
    start: '2024-02-01',
    end: '2024-02-29',
  },
  items: [
    {
      description: 'Premium Membership - Monthly',
      quantity: 1,
      unitPrice: 99.00,
      total: 99.00,
    },
  ],
};

export function PaymentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log('Downloading invoice...');
  };

  const handleSendEmail = () => {
    console.log('Sending invoice via email...');
  };

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
            <h1 className="text-4xl font-black italic tracking-tight text-slate-900 dark:text-white transition-colors">
              TRANSACTION <span className="text-indigo-600 dark:text-indigo-400 italic">INTEL</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-navy-600 mt-1">Ref ID: {mockPayment.transactionId}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSendEmail}
            variant="ghost"
            className="h-11 px-6 bg-slate-50 dark:bg-navy-950 border-none text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-navy-800 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <Mail className="h-4 w-4 mr-2" />
            Dispatch Comms
          </Button>
          <Button
            onClick={handlePrint}
            variant="ghost"
            className="h-11 px-6 bg-slate-50 dark:bg-navy-950 border-none text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-navy-800 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <Printer className="h-4 w-4 mr-2" />
            Physical Log
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20 h-11 px-8 font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Archive
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
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white print:text-black">FINANCIAL <span className="italic text-indigo-600 dark:text-indigo-400">LEDGER</span></h2>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 print:text-slate-600">
                Authentication Code: {mockPayment.invoiceNumber}
              </p>
            </div>
            <div className="text-right space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white print:text-black italic tracking-tight">SD FITNESS GLOBAL</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-navy-400 print:text-slate-600 leading-relaxed uppercase">
                Sector 456 Fitness Avenue<br />
                Node: Los Angeles, CA 90001<br />
                Comms: contact@sdfitness.com<br />
                Vox: +1 (555) 987-6543
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
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-navy-600 italic">
                  TARGET ENTITY
                </h4>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black mb-2 uppercase">{mockPayment.member.name}</p>
                <div className="space-y-1 text-sm font-bold text-slate-500 dark:text-navy-400">
                  <p>{mockPayment.member.email}</p>
                  <p>{mockPayment.member.phone}</p>
                  <p className="mt-4 italic">{mockPayment.member.address}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-navy-600 italic">
                  PROTOCOL METRICS
                </h4>
              </div>
              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 space-y-6 transition-colors font-bold uppercase text-[10px] tracking-widest text-slate-400 dark:text-navy-600">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-navy-800">
                  <span>Activation Date</span>
                  <span className="text-slate-900 dark:text-white">{new Date(mockPayment.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-navy-800">
                  <span>Payment Method</span>
                  <span className="text-slate-900 dark:text-white">{mockPayment.paymentMethod.replace('_', ' ')} •• {mockPayment.cardLast4}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Status</span>
                  <Badge className={cn(statusColors[mockPayment.status], 'font-black text-[10px] uppercase tracking-widest rounded-lg border shadow-none px-3 py-1 transition-colors')}>
                    {mockPayment.status}
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
                  <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 italic">Description</th>
                  <th className="py-5 px-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 italic">Rate</th>
                  <th className="py-5 px-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 italic">Qty</th>
                  <th className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 italic">Metric Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-navy-950">
                {mockPayment.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/30 transition-all">
                    <td className="py-6 px-8">
                      <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{item.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-navy-500 uppercase mt-1">Service ID: 00456-{index}</p>
                    </td>
                    <td className="py-6 px-8 text-center text-sm font-bold text-slate-600 dark:text-navy-400">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-6 px-8 text-center text-sm font-black text-slate-900 dark:text-white">{item.quantity}</td>
                    <td className="py-6 px-8 text-right text-sm font-black text-indigo-600 dark:text-indigo-400">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="max-w-md">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-navy-600 italic mb-4">Operational Addendum</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-navy-400 leading-relaxed">
                This transaction represents an authorized deployment of fitness resources for the specified duration. 
                Values are confirmed via encrypted financial channels. Thank you for maintaining operational excellence.
              </p>
            </div>
            <div className="w-full md:w-80 p-8 rounded-[2rem] bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/20 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                <span>Core Subtotal</span>
                <span>${mockPayment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70 pb-4 border-b border-white/10">
                <span>Regulatory Tax (9%)</span>
                <span>${mockPayment.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-widest">Total Valuation</span>
                <span className="text-3xl font-black tracking-tighter">${mockPayment.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer - Only visible on print or at very bottom */}
          <div className="mt-16 pt-10 border-t border-slate-50 dark:border-navy-950 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-navy-800 transition-colors">
              CONFIDENTIAL TRANSCRIPT // SD FITNESS GLOBAL NETWORKS
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auxiliary Intel - Hidden on print */}
      <div className="grid gap-8 md:grid-cols-2 print:hidden">
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-navy-600 italic flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-500" />
              Entity Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
              <label className="text-[9px] font-black text-slate-400 dark:text-navy-600 uppercase mb-1 block">Entity ID</label>
              <p className="text-sm font-mono font-black text-slate-900 dark:text-white uppercase">US-MB-00000{mockPayment.member.id}</p>
            </div>
            <Button
              onClick={() => navigate(`/members/${mockPayment.member.id}`)}
              className="w-full h-14 bg-white dark:bg-navy-950 border-2 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white hover:border-indigo-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-sm"
            >
              Access Entity Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-navy-600 italic flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-500" />
              Node Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4 font-bold uppercase text-[9px] tracking-widest">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 transition-colors">
                <span className="text-slate-400 dark:text-navy-600 block mb-1">TX Hash</span>
                <span className="text-slate-900 dark:text-white truncate block">{mockPayment.transactionId}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 transition-colors">
                <span className="text-slate-400 dark:text-navy-600 block mb-1">Process Node</span>
                <span className="text-slate-900 dark:text-white">SD-FIN-US-01</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 text-center transition-colors">
              <span className="text-slate-400 dark:text-navy-600 text-[9px] font-black uppercase tracking-widest">System Synchronized at</span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{new Date(mockPayment.date).toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
