import { useState, useRef } from 'react';
import { useBillingStore } from "@/lib/stores/billingStore";
import { useMembershipStore } from "@/lib/stores/membershipStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Loader2, DollarSign, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PaymentMethods() {
    const { submitPayment, isLoading } = useBillingStore();
    const { currentMembership, plans } = useMembershipStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentPlan = plans.find(p => p.id === currentMembership?.planId);
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceId: '',
        notes: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Maximum file size is 5MB",
                    variant: "destructive"
                });
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Only JPG, PNG and PDF are allowed",
                    variant: "destructive"
                });
                return;
            }

            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null); // No preview for PDF
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast({
                title: "Bank slip required",
                description: "Please upload your bank slip image or PDF",
                variant: "destructive"
            });
            return;
        }

        const data = new FormData();
        data.append('amount', formData.amount);
        data.append('paymentDate', formData.paymentDate);
        data.append('referenceId', formData.referenceId);
        data.append('notes', formData.notes);
        data.append('bankSlip', selectedFile);

        try {
            await submitPayment(data);
            toast({
                title: "Payment submitted",
                description: "Your bank slip has been uploaded and is pending review.",
            });
            // Reset form
            setFormData({
                amount: '',
                paymentDate: new Date().toISOString().split('T')[0],
                referenceId: '',
                notes: ''
            });
            clearFile();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to submit payment",
                variant: "destructive"
            });
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">Submit Bank Slip Payment</CardTitle>
                        <CardDescription>
                            Upload your bank slip to confirm your membership payment.
                        </CardDescription>
                    </div>
                    {currentPlan && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-full text-primary">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">Current Plan</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentPlan.name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-slate-500" />
                                Amount (LKR) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (parseFloat(val) < 0) return;
                                    setFormData({ ...formData, amount: val });
                                }}
                                required
                                className="focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                Payment Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                max={today}
                                value={formData.paymentDate}
                                onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-slate-500" />
                            Upload Bank Slip <span className="text-red-500">*</span>
                        </Label>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {!selectedFile ? (
                                <div className="space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                                        <Upload className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">Drag & drop or click to upload</p>
                                        <p className="text-sm text-slate-500">JPG, PNG or PDF (max. 5MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {previewUrl ? (
                                        <div className="relative w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div className="text-left">
                                                <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                                                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="referenceId">Reference / Transaction ID (optional)</Label>
                            <Input
                                id="referenceId"
                                placeholder="Enter bank reference number"
                                value={formData.referenceId}
                                onChange={e => setFormData({ ...formData, referenceId: e.target.value })}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any extra information..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="focus-visible:ring-primary resize-none"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl shadow-lg border-b-4 border-[#991B1B] active:border-b-0 active:mt-1 transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Submit Payment for Review"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
