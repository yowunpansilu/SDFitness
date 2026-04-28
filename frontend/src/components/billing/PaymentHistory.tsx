import { useBillingStore } from "@/lib/stores/billingStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function PaymentHistory() {
    const { transactions, downloadInvoice } = useBillingStore();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleDownload = async (id: string) => {
        setDownloadingId(id);
        try {
            await downloadInvoice(id);
            toast({
                title: "Invoice Downloaded",
                description: "Your invoice has been successfully downloaded.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: "There was a problem downloading your invoice.",
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            case 'failed': return <Badge variant="destructive">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past transactions and download invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell>Rs. {tx.amount.toLocaleString()}</TableCell>
                                        <TableCell>{getStatusLabel(tx.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "h-8 w-8 p-0 rounded-lg transition-all",
                                                                (tx as any).bankSlipUrl
                                                                    ? "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                                                                    : "text-slate-200 cursor-not-allowed opacity-50"
                                                            )}
                                                            disabled={!(tx as any).bankSlipUrl}
                                                            title={(tx as any).bankSlipUrl ? "View Bank Slip" : "No Slip Available"}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    {(tx as any).bankSlipUrl && (
                                                        <DialogContent className="sm:max-w-[600px] border-none rounded-xl">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl">
                                                                    Bank Slip File
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="flex justify-center mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                <img
                                                                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005'}${(tx as any).bankSlipUrl}`}
                                                                    alt="Bank Slip"
                                                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    )}
                                                </Dialog>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDownload(tx.id)}
                                                    disabled={downloadingId === tx.id}
                                                >
                                                    {downloadingId === tx.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4 text-muted-foreground hover:text-slate-900" />
                                                    )}
                                                    <span className="sr-only">Download Invoice</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
