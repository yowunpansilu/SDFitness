import { useEffect } from 'react';
import { useBillingStore } from "@/lib/stores/billingStore";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BillingOverview() {
    const { fetchBillingData, isLoading, error } = useBillingStore();

    useEffect(() => {
        fetchBillingData();
    }, [fetchBillingData]);

    if (isLoading && useBillingStore.getState().paymentMethods.length === 0) {
        // Only show full page loader on initial load
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                <p className="text-muted-foreground mt-1">Manage your payment methods and view transaction history.</p>
            </div>

            <div className="grid gap-8">
                <PaymentMethods />
                <PaymentHistory />
            </div>
        </div>
    );
}
