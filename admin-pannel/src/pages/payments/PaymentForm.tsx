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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, X, Search, DollarSign, User, CreditCard, Percent, Bell, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { memberService } from '@/services/memberService';
import { membershipService } from '@/services/membershipService';
import { paymentService } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';

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

export function PaymentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [members, setMembers] = useState<{ _id?: string; id?: string; userId?: { firstName: string; lastName: string; email: string }; currentMembership?: { planId?: { name: string } }; firstName?: string; lastName?: string; email?: string }[]>([]);
  const [plans, setPlans] = useState<{ _id?: string; id?: string; name: string; price: number }[]>([]);
  const [selectedMember, setSelectedMember] = useState<{ _id?: string; id?: string; userId?: { firstName: string; lastName: string; email: string }; currentMembership?: { planId?: { name: string } }; firstName?: string; lastName?: string; email?: string } | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersRes, plansRes] = await Promise.all([
          memberService.getMembers(),
          membershipService.getPlans()
        ]);

        if (membersRes.success) setMembers(membersRes.data);
        if (plansRes.success) setPlans(plansRes.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load members or plans.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
      currency: 'LKR',
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

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const response = await paymentService.createPayment(data);
      if (response.success) {
        toast({
          title: 'Payment Processed',
          description: `Transaction for LKR ${total.toLocaleString()} has been recorded.`,
        });
        navigate('/payments');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || 'Failed to process payment.',
        variant: 'destructive',
      });
    }
  };

  const selectMember = (member: { _id?: string; id?: string; userId?: { firstName: string; lastName: string; email: string }; currentMembership?: { planId?: { name: string } }; firstName?: string; lastName?: string; email?: string }) => {
    setSelectedMember(member);
    setValue('memberId', member._id || member.id || '');
    setShowMemberList(false);
    setMemberSearch('');
  };

  const filteredMembers = members.filter(
    (member) => {
      const name = `${member.userId?.firstName} ${member.userId?.lastName}`;
      return name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.userId?.email.toLowerCase().includes(memberSearch.toLowerCase());
    }
  );

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find((p) => (p._id || p.id) === planId);
    if (plan) {
      setValue('planId', planId);
      setValue('amount', plan.price);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 dark:text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Form Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="h-12 w-12 rounded-2xl text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-navy-800/50 transition-all p-0 flex items-center justify-center border border-transparent hover:border-slate-100 dark:hover:border-navy-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
              Process <span className="text-indigo-600 dark:text-indigo-400">Payment</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 mt-1">Record a new transaction</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="h-12 px-8 rounded-2xl font-bold uppercase text-xs tracking-widest text-slate-400 dark:text-navy-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
          >
            <X className="h-4 w-4 mr-2" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-12 px-10 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Process Payment
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-10">
          {/* Member Selection */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden group">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-500" />
                Member Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="relative">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500 mb-3 block">
                  Search Member <span className="text-rose-500">*</span>
                </Label>
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 dark:text-navy-800 transition-colors group-focus-within/search:text-indigo-500" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberList(true);
                    }}
                    onFocus={() => setShowMemberList(true)}
                    className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 pl-12"
                    placeholder="Search by name or email..."
                  />
                </div>

                {showMemberList && memberSearch && (
                  <div className="absolute z-50 w-full mt-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-2xl shadow-indigo-500/10 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <div
                          key={member._id || member.id}
                          onClick={() => selectMember(member)}
                          className="p-6 hover:bg-slate-50 dark:hover:bg-navy-950 transition-all cursor-pointer border-b border-slate-50 dark:border-navy-950 last:border-0 group/item"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{member.userId?.firstName} {member.userId?.lastName}</p>
                              <p className="text-xs font-bold text-slate-400 dark:text-navy-500 uppercase tracking-widest mt-0.5">{member.userId?.email}</p>
                            </div>
                            <Badge variant="outline" className="font-bold text-[11px] uppercase tracking-widest border-indigo-100 dark:border-navy-800 text-indigo-500">
                              {member.currentMembership?.planId?.name || 'No Plan'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 dark:text-navy-700 font-bold uppercase text-xs tracking-widest">No matching nodes found</div>
                    )}
                  </div>
                )}

                {errors.memberId && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.memberId.message}</p>
                )}
              </div>

              {selectedMember && (
                <div className="p-8 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 relative animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl rotate-3">
                        {(selectedMember.userId?.firstName || selectedMember.firstName || 'M')[0]}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{selectedMember.userId?.firstName || selectedMember.firstName} {selectedMember.userId?.lastName || selectedMember.lastName}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-navy-400 uppercase tracking-widest">{selectedMember.userId?.email || selectedMember.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-normal">Current Deployment: {selectedMember.currentMembership?.planId?.name || 'No Active Plan'}</span>
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
                      className="h-10 w-10 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="paymentType" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                    Payment Type <span className="text-rose-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue('paymentType', value as "membership" | "personal-training" | "day-pass" | "merchandise" | "other")}>
                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                      <SelectItem value="membership" className="py-3 font-bold">Membership</SelectItem>
                      <SelectItem value="personal-training" className="py-3 font-bold">Personal Training</SelectItem>
                      <SelectItem value="day-pass" className="py-3 font-bold">Day Pass</SelectItem>
                      <SelectItem value="merchandise" className="py-3 font-bold">Merchandise</SelectItem>
                      <SelectItem value="other" className="py-3 font-bold">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === 'membership' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Target Plan</Label>
                    <Select onValueChange={handlePlanSelect}>
                      <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold uppercase">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                        {plans.map((plan) => (
                          <SelectItem key={plan._id || plan.id || ''} value={plan._id || plan.id || ''} className="py-3 font-bold">
                            {plan.name} — LKR {plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                    Amount (LKR) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group/amount">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 dark:text-navy-800 transition-colors group-focus-within/amount:text-indigo-500" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { valueAsNumber: true })}
                      className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-xl pl-12"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.amount.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    className="bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium py-4 text-base min-h-[100px]"
                    placeholder="Record additional transaction context..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Select Method <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card' },
                    { value: 'bank-transfer', label: 'Bank Transfer' },
                    { value: 'online', label: 'Online' }
                  ].map((method) => (
                    <div
                      key={method.value}
                      onClick={() => setValue('paymentMethod', method.value as "cash" | "card" | "bank-transfer" | "online")}
                      className={cn(
                        "h-16 flex items-center justify-center rounded-2xl border-2 transition-all cursor-pointer font-bold text-xs uppercase tracking-widest text-center px-4",
                        paymentMethod === method.value
                          ? "bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-400 dark:text-navy-700 hover:border-indigo-500/30"
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
                      <Label htmlFor="cardBrand" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Card Fleet</Label>
                      <Select onValueChange={(value) => setValue('cardBrand', value)}>
                        <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold uppercase font-bold">
                          <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                          <SelectItem value="visa" className="font-bold text-xs uppercase">VISA COMMAND</SelectItem>
                          <SelectItem value="mastercard" className="font-bold text-xs uppercase">MASTERCARD CORE</SelectItem>
                          <SelectItem value="amex" className="font-bold text-xs uppercase">AMEX PLATINUM</SelectItem>
                          <SelectItem value="discover" className="font-bold text-xs uppercase">DISCOVER MESH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                      <Label htmlFor="lastFourDigits" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Terminal Suffix</Label>
                      <Input
                        id="lastFourDigits"
                        {...register('lastFourDigits')}
                        className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-center tracking-[0.5em]"
                        placeholder="••••"
                        maxLength={4}
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'bank-transfer' && (
                  <div className="md:col-span-2 space-y-3 animate-in zoom-in-95 duration-500">
                    <Label htmlFor="referenceNumber" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Operational Reference</Label>
                    <Input
                      id="referenceNumber"
                      {...register('referenceNumber')}
                      className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-bold"
                      placeholder="REF-IDENT-XXXXX"
                    />
                  </div>
                )}

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="transactionId" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Transaction Identifier</Label>
                  <Input
                    id="transactionId"
                    {...register('transactionId')}
                    className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-bold placeholder:opacity-30"
                    placeholder="[AUTO-GENERATE ENCRYPTED ID]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 sticky top-10 overflow-hidden ring-1 ring-slate-100 dark:ring-navy-800">
            <CardHeader className="bg-slate-50/50 dark:bg-navy-950/50 p-8 pb-4 border-b border-slate-50 dark:border-navy-800">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-normal">LEDGER PREVIEW</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 dark:text-navy-600 uppercase tracking-widest mt-1">Audit before final commitment</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8 font-medium">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                  <span className="text-slate-400 dark:text-navy-600">Base Amount</span>
                  <span className="text-slate-900 dark:text-white">LKR {amount.toLocaleString()}</span>
                </div>

                {discountType && discountType !== 'none' && (
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Percent className="h-3 w-3" />
                      <span>Discount Adjustment</span>
                    </div>
                    <span>-LKR {(amount - total).toLocaleString()}</span>
                  </div>
                )}

                <Separator className="bg-slate-50 dark:bg-navy-850" />

                <div className="pt-2">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Total Net Amount</span>
                    <div className="flex items-baseline gap-1 text-indigo-600 dark:text-indigo-400">
                      <span className="text-sm font-bold">LKR</span>
                      <span className="text-4xl font-bold tracking-normal">
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-700 border-b border-slate-50 dark:border-navy-800 pb-2">Notification Options</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setValue('sendReceipt', !sendReceipt)}>
                    <div className={cn(
                      "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      sendReceipt ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-navy-800"
                    )}>
                      {sendReceipt && <Bell className="h-3 w-3" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500 group-hover:text-indigo-600 transition-colors">Send Email Receipt</span>
                  </div>
                  <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setValue('sendSMS', !sendSMS)}>
                    <div className={cn(
                      "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      sendSMS ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-navy-800"
                    )}>
                      {sendSMS && <Bell className="h-3 w-3" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500 group-hover:text-indigo-600 transition-colors">Send SMS Notification</span>
                  </div>
                </div>
              </div>

              {selectedMember && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/50 border border-slate-50 dark:border-navy-800 transition-all hover:bg-white dark:hover:bg-navy-800 ring-1 ring-transparent hover:ring-indigo-500/20">
                  <p className="text-[8px] font-bold text-slate-400 dark:text-navy-700 uppercase mb-2 tracking-widest">Authorized For</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate">{selectedMember.userId?.firstName} {selectedMember.userId?.lastName}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full h-14 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold uppercase text-[11px] tracking-wider rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                Confirm and Process
              </Button>
            </CardContent>
          </Card>
          <div className="text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-300 dark:text-navy-800">Authorized Personnel Only</p>
          </div>
        </div>
      </form>
    </div>
  );
}
