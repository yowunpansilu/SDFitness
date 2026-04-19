import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-20">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-2 border-slate-100"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-50 p-4 rounded-full mb-6">
                        <XCircle className="h-16 w-16 text-[#DC2626]" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                        Payment Cancelled
                    </h1>
                    <p className="text-slate-500 mb-8 font-medium">
                        The transaction was not completed. No funds were deducted from your account.
                    </p>

                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-800 text-sm mb-8 text-left">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="font-medium">
                            If this was a mistake, you can try again. If you faced an issue with the payment gateway, please contact our support.
                        </p>
                    </div>

                    <div className="w-full space-y-3">
                        <Button
                            onClick={() => navigate('/dashboard/membership')}
                            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white py-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="h-5 w-5" />
                            Retry Payment
                        </Button>
                        
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-6 rounded-xl font-bold text-slate-500 flex items-center justify-center gap-2"
                        >
                            <Home className="h-5 w-5" />
                            Return Home
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentCancel;
