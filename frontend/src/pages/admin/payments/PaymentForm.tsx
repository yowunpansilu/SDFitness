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
import { ArrowLeft, Save, X, Search, DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api/axios';
import { recordAdminPayment } from '@/lib/api/billingService';

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

// Types
interface Member {
    _id: string;
    userId?: { firstName: string; lastName: string; email: string };
    firstName?: string;
    lastName?: string;
    email?: string;
    currentPlan?: string;
}

interface Plan {
    _id: string;
    name: string;
    price: number;
}

export function PaymentForm() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberList, setShowMemberList] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [membersRes, plansRes] = await Promise.all([
                    api.get('/members'),
                    api.get('/membership/plans')
                ]);
                setMembers(membersRes.data || []);
                setPlans(plansRes.data?.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                toast({
                    title: 'Error loading data',
                    description: 'Failed to load members or plans.',
                    variant: 'destructive',
                });
            }
        };
        fetchData();
    }, [toast]);

    const {
        register,
        handleSubmit,
        formState: { errors },
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

    const onSubmit = async (data: PaymentFormData) => {
        setIsSubmitting(true);
        try {
            await recordAdminPayment({
                memberId: data.memberId,
                amount: total,
                currency: data.currency || 'USD',
                method: data.paymentMethod,
                description: data.description,
                planId: data.planId,
                transactionId: data.transactionId
            });

            toast({
                title: 'Payment Processed',
                description: `Payment of $${total.toFixed(2)} has been processed successfully.`,
            });
            navigate('/admin/payments');
        } catch (err: any) {
            toast({
                title: 'Payment Failed',
                description: err.response?.data?.error || err.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectMember = (member: Member) => {
        setSelectedMember(member);
        setValue('memberId', member._id);
        setShowMemberList(false);
        setMemberSearch('');
    };

    const filteredMembers = members.filter((member) => {
        const name = member.userId ? `${member.userId.firstName} ${member.userId.lastName}` : `${member.firstName} ${member.lastName}`;
        const email = member.userId?.email || member.email || '';
        return name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            email.toLowerCase().includes(memberSearch.toLowerCase());
    });

    const handlePlanSelect = (planId: string) => {
        const plan = plans.find((p) => p._id === planId);
        if (plan) {
            setValue('planId', planId);
            setValue('amount', plan.price);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/payments')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Process Payment</h1>
                        <p className="text-muted-foreground">Record a new payment transaction</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/payments')}
                        disabled={isSubmitting}
                        className="bg-card border-border text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isSubmitting ? 'Processing...' : 'Process Payment'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Member Selection */}
                    <Card className="bg-background/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Member Selection</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Search and select the member
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Label className="text-muted-foreground">
                                    Search Member <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={memberSearch}
                                        onChange={(e) => {
                                            setMemberSearch(e.target.value);
                                            setShowMemberList(true);
                                        }}
                                        onFocus={() => setShowMemberList(true)}
                                        className="bg-card border-border text-foreground pl-10"
                                        placeholder="Search by name or email..."
                                    />
                                </div>

                                {showMemberList && memberSearch && (
                                    <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredMembers.map((member) => (
                                            <div
                                                key={member._id}
                                                onClick={() => selectMember(member)}
                                                className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
                                            >
                                                <p className="text-foreground font-medium">
                                                    {member.userId ? `${member.userId.firstName} ${member.userId.lastName}` : `${member.firstName} ${member.lastName}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.userId?.email || member.email}
                                                </p>
                                                {member.currentPlan && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {member.currentPlan}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {errors.memberId && (
                                    <p className="text-xs text-red-400 mt-1">{errors.memberId.message}</p>
                                )}
                            </div>

                            {selectedMember && (
                                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-foreground font-medium">
                                                {selectedMember.userId ? `${selectedMember.userId.firstName} ${selectedMember.userId.lastName}` : `${selectedMember.firstName} ${selectedMember.lastName}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedMember.userId?.email || selectedMember.email}
                                            </p>
                                            {selectedMember.currentPlan && (
                                                <p className="text-sm text-purple-400 mt-1">
                                                    Current: {selectedMember.currentPlan}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedMember(null);
                                                setValue('memberId', '');
                                            }}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card className="bg-background/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Payment Details</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                What is being paid for
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="paymentType" className="text-muted-foreground">
                                        Payment Type <span className="text-red-400">*</span>
                                    </Label>
                                    <Select onValueChange={(value) => setValue('paymentType', value as any)}>
                                        <SelectTrigger className="bg-card border-border text-foreground">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="membership">Membership</SelectItem>
                                            <SelectItem value="personal-training">Personal Training</SelectItem>
                                            <SelectItem value="day-pass">Day Pass</SelectItem>
                                            <SelectItem value="merchandise">Merchandise</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {paymentType === 'membership' && (
                                    <div>
                                        <Label className="text-muted-foreground">Select Plan</Label>
                                        <Select onValueChange={handlePlanSelect}>
                                            <SelectTrigger className="bg-card border-border text-foreground">
                                                <SelectValue placeholder="Select plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem key={plan._id} value={plan._id}>
                                                        {plan.name} - ${plan.price}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="amount" className="text-muted-foreground">
                                        Amount ($) <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        {...register('amount', { valueAsNumber: true })}
                                        className="bg-card border-border text-foreground"
                                        placeholder="0.00"
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="description" className="text-muted-foreground">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        className="bg-card border-border text-foreground"
                                        placeholder="Additional notes..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card className="bg-background/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Payment Method</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                How the payment was made
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">
                                    Method <span className="text-red-400">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
                                    <SelectTrigger className="bg-card border-border text-foreground">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="online">Online Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="cardBrand" className="text-muted-foreground">
                                            Card Brand
                                        </Label>
                                        <Select onValueChange={(value) => setValue('cardBrand', value)}>
                                            <SelectTrigger className="bg-card border-border text-foreground">
                                                <SelectValue placeholder="Select brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="visa">Visa</SelectItem>
                                                <SelectItem value="mastercard">Mastercard</SelectItem>
                                                <SelectItem value="amex">American Express</SelectItem>
                                                <SelectItem value="discover">Discover</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="lastFourDigits" className="text-muted-foreground">
                                            Last 4 Digits
                                        </Label>
                                        <Input
                                            id="lastFourDigits"
                                            {...register('lastFourDigits')}
                                            className="bg-card border-border text-foreground"
                                            placeholder="1234"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'bank-transfer' && (
                                <div>
                                    <Label htmlFor="referenceNumber" className="text-muted-foreground">
                                        Reference Number
                                    </Label>
                                    <Input
                                        id="referenceNumber"
                                        {...register('referenceNumber')}
                                        className="bg-card border-border text-foreground font-mono"
                                        placeholder="REF-123456789"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="transactionId" className="text-muted-foreground">
                                    Transaction ID
                                </Label>
                                <Input
                                    id="transactionId"
                                    {...register('transactionId')}
                                    className="bg-card border-border text-foreground font-mono"
                                    placeholder="Auto-generated or manual"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Options */}
                    <Card className="bg-background/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Additional Options</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Discounts and notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Discount Type</Label>
                                    <Select onValueChange={(value) => setValue('discountType', value as any)}>
                                        <SelectTrigger className="bg-card border-border text-foreground">
                                            <SelectValue placeholder="No discount" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Discount</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {discountType && discountType !== 'none' && (
                                    <div>
                                        <Label htmlFor="discountValue" className="text-muted-foreground">
                                            Discount Value {discountType === 'percentage' && '(%)'}
                                        </Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            step="0.01"
                                            {...register('discountValue', { valueAsNumber: true })}
                                            className="bg-card border-border text-foreground"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="sendReceipt"
                                        checked={sendReceipt}
                                        onCheckedChange={(checked) => setValue('sendReceipt', !!checked)}
                                    />
                                    <label htmlFor="sendReceipt" className="text-sm text-muted-foreground cursor-pointer">
                                        Send receipt via email
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="sendSMS"
                                        checked={sendSMS}
                                        onCheckedChange={(checked) => setValue('sendSMS', !!checked)}
                                    />
                                    <label htmlFor="sendSMS" className="text-sm text-muted-foreground cursor-pointer">
                                        Send SMS notification
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="bg-background/50 border-border sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-foreground">Payment Summary</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Review before processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">${amount.toFixed(2)}</span>
                                </div>

                                {discountType && discountType !== 'none' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount
                                            {discountType === 'percentage' && ` (${discountValue}%)`}
                                        </span>
                                        <span className="text-green-400">
                                            -${(amount - total).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Total</span>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-5 w-5 text-purple-400" />
                                            <span className="text-2xl font-bold text-foreground">
                                                {total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedMember && (
                                <div className="p-3 rounded-lg bg-card/50 border border-border">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Member</p>
                                    <p className="text-sm text-foreground font-medium">
                                        {selectedMember.userId ? `${selectedMember.userId.firstName} ${selectedMember.userId.lastName}` : `${selectedMember.firstName} ${selectedMember.lastName}`}
                                    </p>
                                </div>
                            )}

                            {paymentMethod && (
                                <div className="p-3 rounded-lg bg-card/50 border border-border">
                                    <p className="text-xs text-muted-foreground uppercase mb-1">Payment Method</p>
                                    <p className="text-sm text-foreground font-medium capitalize">
                                        {paymentMethod.replace('-', ' ')}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t border-border">
                                {sendReceipt && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Receipt will be emailed
                                    </div>
                                )}
                                {sendSMS && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        SMS notification will be sent
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
