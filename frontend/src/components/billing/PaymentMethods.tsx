import { useState, useRef } from 'react';
import { useBillingStore } from "@/lib/stores/billingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PaymentMethods() {
    const { paymentMethods, addNewPaymentMethod, removePaymentMethod, setAsDefault, isLoading } = useBillingStore();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        name: ''
    });

    // Input Refs for native validation
    const cardRef = useRef<HTMLInputElement>(null);
    const expiryRef = useRef<HTMLInputElement>(null);
    const cvcRef = useRef<HTMLInputElement>(null);

    // Formatting helpers
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];

        for (let i = 0, len = v.length; i < len; i += 4) {
            parts.push(v.substring(i, i + 4));
        }

        if (parts.length > 0) {
            return parts.join(' ').trim();
        } else {
            return v;
        }
    };

    const formatName = (value: string) => {
        return value.replace(/[^a-zA-Z\s]/g, '');
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
        }
        return v;
    };

    const formatCVC = (value: string) => {
        return value.replace(/[^0-9]/gi, '').substring(0, 4);
    };

    const handleAddMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset validities
        cardRef.current?.setCustomValidity('');
        expiryRef.current?.setCustomValidity('');
        cvcRef.current?.setCustomValidity('');

        // Card validation
        const cleanCard = formData.cardNumber.replace(/\s/g, '');
        if (cleanCard.length < 16) {
            cardRef.current?.setCustomValidity('Please enter a valid 16-digit card number');
            cardRef.current?.reportValidity();
            return;
        }

        // MM/YY Validation
        const parts = formData.expiryDate.split('/');
        const monthStr = parts[0] || '';
        const yearStr = parts[1] || '';
        
        const month = monthStr ? parseInt(monthStr, 10) : 0;
        const year = yearStr ? parseInt(yearStr, 10) : 0;

        if (month < 1 || month > 12) {
            expiryRef.current?.setCustomValidity('Please enter a valid month (01-12)');
            expiryRef.current?.reportValidity();
            return;
        }
        if (yearStr.length < 2 || year < 0) {
            expiryRef.current?.setCustomValidity('Please enter a valid year (YY)');
            expiryRef.current?.reportValidity();
            return;
        }

        if (formData.cvc.length < 3) {
            cvcRef.current?.setCustomValidity('Please enter a valid CVC');
            cvcRef.current?.reportValidity();
            return;
        }

        setIsSubmitting(true);

        // Simulate card processing
        try {
            const brand: 'visa' | 'mastercard' | 'amex' | 'paypal' = 
                cleanCard.startsWith('4') ? 'visa' : 
                cleanCard.startsWith('5') ? 'mastercard' : 
                cleanCard.startsWith('3') ? 'amex' : 'visa';

            await addNewPaymentMethod({
                brand,
                last4: cleanCard.slice(-4),
                expiryMonth: parseInt(formData.expiryDate.split('/')[0]),
                expiryYear: 2000 + parseInt(formData.expiryDate.split('/')[1]),
                isDefault: paymentMethods.length === 0
            });
            setIsAddOpen(false);
            setFormData({ cardNumber: '', expiryDate: '', cvc: '', name: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your payment cards and billing details.</CardDescription>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Method
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Payment Method</DialogTitle>
                                <DialogDescription>
                                    Enter your card details securely. We do not store your full card number.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddMethod} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Cardholder Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Sara Jasmine"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: formatName(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="number">Card Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="number"
                                            ref={cardRef}
                                            className="pl-9"
                                            placeholder="0000 0000 0000 0000"
                                            value={formData.cardNumber}
                                            onChange={e => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                                            maxLength={19}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input
                                            id="expiry"
                                            ref={expiryRef}
                                            placeholder="MM/YY"
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input
                                            id="cvc"
                                            ref={cvcRef}
                                            placeholder="123"
                                            value={formData.cvc}
                                            onChange={e => setFormData({ ...formData, cvc: formatCVC(e.target.value) })}
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Add Card
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium capitalize">{method.brand} ending in {method.last4}</span>
                                    {method.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">Expires {method.expiryMonth}/{method.expiryYear}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!method.isDefault && (
                                <Button variant="ghost" size="sm" onClick={() => setAsDefault(method.id)} disabled={isLoading}>
                                    Make Default
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                onClick={() => removePaymentMethod(method.id)}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
