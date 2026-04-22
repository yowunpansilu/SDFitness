import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Declare payhere for TypeScript
declare global {
    interface Window {
        payhere: any;
    }
}

interface PayhereCheckoutProps {
    formData: any;
    checkoutUrl: string;
    isLoading?: boolean;
    buttonText?: string;
    onInitiate?: () => void;
}

const PayhereCheckout: React.FC<PayhereCheckoutProps> = ({
    formData,
    checkoutUrl,
    isLoading = false,
    buttonText = "Pay with PayHere",
    onInitiate
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (formData && checkoutUrl && isProcessing) {
            console.log('[PAYHERE DEBUG] Initiation Data:', { checkoutUrl, orderId: formData.order_id });

            try {
                // Use standard POST Form Redirect to bypass CSP/eval issues with the SDK
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = checkoutUrl;
                form.target = '_top'; // Ensure it breaks out of any iframes/containers

                Object.entries(formData).forEach(([key, value]) => {
                    // Only append strings and numbers to prevent [object Object] issues
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = String(value);
                        form.appendChild(input);
                    }
                });

                document.body.appendChild(form);
                console.log('[PAYHERE DEBUG] Form appended, submitting now...');
                form.submit();

                // Set a timeout to clear the processing state if the page hasn't navigated
                const timer = setTimeout(() => {
                    if (isProcessing) {
                        console.warn('[PAYHERE DEBUG] Redirect may have been blocked or delayed');
                        setIsProcessing(false);
                    }
                }, 5000);

                return () => clearTimeout(timer);
            } catch (err) {
                console.error('[PAYHERE DEBUG] Form submission failed:', err);
                setIsProcessing(false);
            }
        }
    }, [formData, checkoutUrl, isProcessing]);

    const handleInitiate = async () => {
        if (onInitiate) {
            setIsProcessing(true);
            await onInitiate();
            // The useEffect will catch the formData update and submit the form
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
            >
                <Button
                    onClick={handleInitiate}
                    disabled={isLoading || isProcessing}
                    className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-6 rounded-xl shadow-lg border-b-4 border-[#991B1B] active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                >
                    {isLoading || isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            <CreditCard className="h-6 w-6" />
                            {buttonText}
                        </>
                    )}
                </Button>
            </motion.div>

            <div className="mt-4 flex items-center gap-2 grayscale opacity-60">
                <img src="https://www.payhere.lk/downloads/images/payhere_short_banner.png" alt="PayHere" className="h-8" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Secure Payment
                </span>
            </div>
        </div>
    );
};

export default PayhereCheckout;
