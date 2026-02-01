import { useState } from 'react';
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

    // Form state
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        name: ''
    });

    const handleAddMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate card processing
        try {
            await addNewPaymentMethod({
                brand: 'visa', // Mock detection
                last4: formData.cardNumber.slice(-4),
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
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="number">Card Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="number"
                                            className="pl-9"
                                            placeholder="0000 0000 0000 0000"
                                            value={formData.cardNumber}
                                            onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
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
                                            placeholder="MM/YY"
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input
                                            id="cvc"
                                            placeholder="123"
                                            value={formData.cvc}
                                            onChange={e => setFormData({ ...formData, cvc: e.target.value })}
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
