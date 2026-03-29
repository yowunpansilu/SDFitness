import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X, Search, DollarSign, User, CreditCard, Percent, Bell, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form validation schema
const paymentSchema = z.object({
  // Member Selection
  memberId: z.string().min(1, 'Member is required'),

  // Payment Details
  paymentType: z.enum(['membership', 'personal-training', 'day-pass', 'merchandise', 'other']),
  planId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1),
  description: z.string().optional(),

  // Payment Method
  paymentMethod: z.enum(['cash', 'card', 'bank-transfer', 'online']),
  cardBrand: z.string().optional(),
  lastFourDigits: z.string().optional(),
  referenceNumber: z.string().optional(),
  transactionId: z.string().optional(),

  // Additional Options
  discountType: z.enum(['none', 'percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  sendReceipt: z.boolean().optional(),
  sendSMS: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Mock data
const MEMBERS = [
  { id: '1', name: 'Michael Brown', email: 'michael@email.com', plan: 'Premium Monthly', status: 'Active' },
  { id: '2', name: 'Emily Davis', email: 'emily@email.com', plan: 'Basic Yearly', status: 'Active' },
  { id: '3', name: 'James Wilson', email: 'james@email.com', plan: 'Standard Monthly', status: 'Expired' },
];

const PLANS = [
  { id: 'basic', name: 'Basic Monthly', price: 29.99 },
  { id: 'standard', name: 'Standard Monthly', price: 49.99 },
  { id: 'premium', name: 'Premium Monthly', price: 79.99 },
  { id: 'basic-yearly', name: 'Basic Yearly', price: 299.99 },
];

export function PaymentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedMember, setSelectedMember] = useState<typeof MEMBERS[0] | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      currency: 'USD',
      paymentMethod: 'cash',
      discountType: 'none',
      discountValue: 0,
      sendReceipt: true,
      sendSMS: false,
    },
  });

  const paymentType = watch('paymentType');
  const paymentMethod = watch('paymentMethod');
  const amount = watch('amount') || 0;
  const discountType = watch('discountType');
  const discountValue = watch('discountValue') || 0;
  const sendReceipt = watch('sendReceipt') ?? true;
  const sendSMS = watch('sendSMS') ?? false;

  const calculateTotal = () => {
    if (discountType === 'percentage') {
      return amount - (amount * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return Math.max(0, amount - discountValue);
    }
    return amount;
  };

  const total = calculateTotal();

  const onSubmit = (data: PaymentFormData) => {
    console.log('Payment submitted:', data);
    
    toast({
      title: 'Financial Synchronization Complete',
      description: `Transaction for $${total.toFixed(2)} has been committed to the ledger.`,
    });

    navigate('/payments');
  };

  const selectMember = (member: typeof MEMBERS[0]) => {
    setSelectedMember(member);
    setValue('memberId', member.id);
    setShowMemberList(false);
    setMemberSearch('');
  };

  const filteredMembers = MEMBERS.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handlePlanSelect = (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (plan) {
      setValue('planId', planId);
      setValue('amount', plan.price);
    }
  };

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-300">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="h-12 w-12 rounded-2xl text-slate-700 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-100/50 transition-all p-0 flex items-center justify-center border border-slate-300 hover:border-slate-100 dark:hover:border-slate-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black italic tracking-tight text-slate-900 dark:text-slate-900 transition-colors">
              FINANCIAL <span className="text-indigo-600 dark:text-indigo-600 italic">INITIALIZATION</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-800 mt-1">Deploy New Transaction Layer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-700 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
          >
            <X className="h-4 w-4 mr-2" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-12 px-10 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Save className="h-4 w-4 mr-2" />
            Process Protocol
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-10">
          {/* Member Selection */}
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-600" />
                Target Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="relative">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic mb-3 block">
                  Search Entity <span className="text-rose-500">*</span>
                </Label>
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 dark:text-slate-900 transition-colors group-focus-within/search:text-indigo-600" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberList(true);
                    }}
                    onFocus={() => setShowMemberList(true)}
                    className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-600 dark:placeholder:text-slate-900 pl-12 uppercase italic tracking-tight"
                    placeholder="Search by identity or node..."
                  />
                </div>

                {showMemberList && memberSearch && (
                  <div className="absolute z-50 w-full mt-4 bg-white dark:bg-white border border-slate-300 dark:border-slate-300 rounded-3xl shadow-2xl shadow-indigo-500/10 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => selectMember(member)}
                          className="p-6 hover:bg-slate-50 dark:hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-400 last:border-0 group/item"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-black text-slate-900 dark:text-slate-900 uppercase italic group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-600 transition-colors">{member.name}</p>
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-700 uppercase tracking-widest mt-0.5">{member.email}</p>
                            </div>
                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-indigo-100 dark:border-slate-300 text-indigo-600">
                              {member.plan}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-700 dark:text-slate-900 italic font-bold uppercase text-[10px] tracking-widest">No matching nodes found</div>
                    )}
                  </div>
                )}

                {errors.memberId && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.memberId.message}</p>
                )}
              </div>

              {selectedMember && (
                <div className="p-8 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 relative animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl rotate-3">
                        {selectedMember.name[0]}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-900 uppercase italic">{selectedMember.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">{selectedMember.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Current Deployment: {selectedMember.plan}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMember(null);
                        setValue('memberId', '');
                      }}
                      className="h-10 w-10 text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Valuation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="paymentType" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                    Protocol Category <span className="text-rose-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue('paymentType', value as any)}>
                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold uppercase italic">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                      <SelectItem value="membership" className="py-3 uppercase text-[10px] font-black">Membership Deployment</SelectItem>
                      <SelectItem value="personal-training" className="py-3 uppercase text-[10px] font-black">Faculty Training</SelectItem>
                      <SelectItem value="day-pass" className="py-3 uppercase text-[10px] font-black">Temporal Access (Day)</SelectItem>
                      <SelectItem value="merchandise" className="py-3 uppercase text-[10px] font-black">Physical Assets</SelectItem>
                      <SelectItem value="other" className="py-3 uppercase text-[10px] font-black">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === 'membership' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Target Plan</Label>
                    <Select onValueChange={handlePlanSelect}>
                      <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold uppercase italic">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                        {PLANS.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="py-3 uppercase text-[10px] font-black">
                            {plan.name} — ${plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                    Transaction Value ($) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group/amount">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 dark:text-slate-900 transition-colors group-focus-within/amount:text-indigo-600" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { valueAsNumber: true })}
                      className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-xl italic pl-12"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.amount.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                    Administrative Notes
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    className="bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium py-4 text-base min-h-[100px]"
                    placeholder="Record additional transaction context..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-slate-700 dark:text-slate-800 italic flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Transmission Channel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">
                  Primary Routing <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'cash', label: 'Cash Flow' },
                    { value: 'card', label: 'Card Intel' },
                    { value: 'bank-transfer', label: 'Bank Sync' },
                    { value: 'online', label: 'Online Ops' }
                  ].map((method) => (
                    <div
                      key={method.value}
                      onClick={() => setValue('paymentMethod', method.value as any)}
                      className={cn(
                        "h-16 flex items-center justify-center rounded-2xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest text-center px-4",
                        paymentMethod === method.value
                          ? "bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-700 dark:text-white hover:border-indigo-500/30"
                      )}
                    >
                      {method.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {paymentMethod === 'card' && (
                  <>
                    <div className="space-y-3 animate-in slide-in-from-left-4 duration-500">
                      <Label htmlFor="cardBrand" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Card Fleet</Label>
                      <Select onValueChange={(value) => setValue('cardBrand', value)}>
                        <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold uppercase italic font-black">
                          <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-white border-slate-300 dark:border-slate-300">
                          <SelectItem value="visa" className="font-black text-[10px] uppercase">VISA COMMAND</SelectItem>
                          <SelectItem value="mastercard" className="font-black text-[10px] uppercase">MASTERCARD CORE</SelectItem>
                          <SelectItem value="amex" className="font-black text-[10px] uppercase">AMEX PLATINUM</SelectItem>
                          <SelectItem value="discover" className="font-black text-[10px] uppercase">DISCOVER MESH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                      <Label htmlFor="lastFourDigits" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Terminal Suffix</Label>
                      <Input
                        id="lastFourDigits"
                        {...register('lastFourDigits')}
                        className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-center tracking-[0.5em]"
                        placeholder="••••"
                        maxLength={4}
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'bank-transfer' && (
                  <div className="md:col-span-2 space-y-3 animate-in zoom-in-95 duration-500">
                    <Label htmlFor="referenceNumber" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Operational Reference</Label>
                    <Input
                      id="referenceNumber"
                      {...register('referenceNumber')}
                      className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-black"
                      placeholder="REF-IDENT-XXXXX"
                    />
                  </div>
                )}

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="transactionId" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 italic">Transaction Identifier</Label>
                  <Input
                    id="transactionId"
                    {...register('transactionId')}
                    className="h-14 bg-slate-50 dark:bg-slate-50/50 border-slate-100 dark:border-slate-300 text-slate-900 dark:text-slate-900 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-black placeholder:opacity-30"
                    placeholder="[AUTO-GENERATE ENCRYPTED ID]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <Card className="bg-white dark:bg-white border-slate-300 dark:border-slate-300 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 sticky top-10 overflow-hidden ring-1 ring-slate-200 dark:ring-navy-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-50/50 p-8 pb-4 border-b border-slate-50 dark:border-slate-300">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-slate-900 uppercase tracking-tighter italic">LEDGER PREVIEW</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-700 dark:text-slate-800 uppercase tracking-widest mt-1">Audit before final commitment</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8 font-medium">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                  <span className="text-slate-700 dark:text-slate-800">Base Metric</span>
                  <span className="text-slate-900 dark:text-slate-900">${amount.toFixed(2)}</span>
                </div>

                {discountType && discountType !== 'none' && (
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center gap-2">
                       <Percent className="h-3 w-3" />
                       <span>Discount Adjustment</span>
                    </div>
                    <span>-${(amount - total).toFixed(2)}</span>
                  </div>
                )}

                <Separator className="bg-slate-50 dark:bg-navy-850" />
                
                <div className="pt-2">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-800">Total Net Value</span>
                    <div className="flex items-baseline gap-1 text-indigo-600 dark:text-indigo-600">
                      <span className="text-sm font-black">$</span>
                      <span className="text-4xl font-black tracking-tighter">
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 dark:text-slate-900 text-right uppercase tracking-widest italic font-black">Values synced with global matrix</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-900 italic border-b border-slate-50 dark:border-slate-300 pb-2">Transmission Protocols</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setValue('sendReceipt', !sendReceipt)}>
                    <div className={cn(
                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        sendReceipt ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-300"
                    )}>
                      {sendReceipt && <Bell className="h-3 w-3" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 group-hover:text-indigo-600 transition-colors">Electronic Receipt Pulse</span>
                  </div>
                  <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setValue('sendSMS', !sendSMS)}>
                    <div className={cn(
                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        sendSMS ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-300"
                    )}>
                      {sendSMS && <Bell className="h-3 w-3" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-700 group-hover:text-indigo-600 transition-colors">Tactical SMS Alert</span>
                  </div>
                </div>
              </div>

              {selectedMember && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-50/50 border border-slate-50 dark:border-slate-300 transition-all hover:bg-white dark:hover:bg-slate-100 ring-1 ring-transparent hover:ring-indigo-500/20">
                  <p className="text-[8px] font-black text-slate-700 dark:text-slate-900 uppercase mb-2 tracking-widest italic">Authorized For</p>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-900 uppercase truncate italic">{selectedMember.name}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full h-14 bg-white dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                COMMIT TO LEDGER
              </Button>
            </CardContent>
          </Card>
          <div className="text-center">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-900 italic">Authorized System Personnel Only</p>
          </div>
        </div>
      </form>
    </div>
  );
}
