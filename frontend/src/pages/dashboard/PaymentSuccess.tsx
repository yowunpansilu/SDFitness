import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Home, Loader2, ShieldCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getPaymentById } from '@/lib/api/billingService';

const confettiColors = ['#DC2626', '#16A34A', '#2563EB', '#D97706', '#7C3AED'];

const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                    backgroundColor: confettiColors[i % confettiColors.length],
                    left: `${Math.random() * 100}%`,
                    top: '-20px',
                    opacity: 0,
                    rotate: Math.random() * 360,
                }}
                animate={{
                    top: ['0%', '110%'],
                    opacity: [0, 1, 1, 0],
                    rotate: [0, Math.random() * 720 - 360],
                }}
                transition={{
                    duration: 2.5 + Math.random() * 2,
                    delay: Math.random() * 1.5,
                    ease: 'easeIn',
                }}
            />
        ))}
    </div>
);

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Support both payment_id (our internal ID) and session_id (from Stripe redirect)
    const paymentId = searchParams.get('payment_id') || searchParams.get('session_id');
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                if (paymentId) {
                    const data = await getPaymentById(paymentId);
                    setPayment(data.payment);
                }
            } catch (err) {
                console.error('Error fetching payment:', err);
            } finally {
                setLoading(false);
                setTimeout(() => setShowConfetti(true), 200);
                setTimeout(() => setShowConfetti(false), 4000);
            }
        };
        fetchStatus();
    }, [paymentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center p-6">
                <Loader2 className="h-12 w-12 text-[#DC2626] animate-spin mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm animate-pulse">
                    Confirming payment...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
            <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
                {/* Green top bar */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2, damping: 10 }}
                        className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                    >
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Payment Successful!</h1>
                    <p className="text-green-100 text-sm font-medium mt-1">
                        Your membership is now active
                    </p>
                </div>

                <div className="p-6 space-y-5">
                    {/* Order details */}
                    <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
                        {paymentId && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-semibold">Payment ID</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">{payment?._id || paymentId}</span>
                            </div>
                        )}
                        {payment?.amount && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-semibold text-sm">Amount Paid</span>
                                <span className="font-black text-[#DC2626] text-xl">
                                    {payment.currency || 'LKR'} {payment.amount?.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-semibold">Date</span>
                            <span className="font-bold text-slate-800">
                                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        {payment?.description && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-semibold">Plan</span>
                                <span className="font-bold text-slate-800">{payment.description}</span>
                            </div>
                        )}
                    </div>

                    {/* Info badge */}
                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-blue-700">
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="font-medium">
                            Your subscription has been activated. Check your membership tab for details.
                        </span>
                    </div>

                    <Separator />

                    {/* CTA buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/dashboard/membership')}
                            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 group"
                        >
                            <Calendar className="h-5 w-5" />
                            View My Membership
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-5 rounded-xl font-bold text-slate-500 flex items-center justify-center gap-2"
                        >
                            <Home className="h-5 w-5" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </motion.div>

            <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Powered by PayHere · SDFitness
            </p>
        </div>
    );
};

export default PaymentSuccess;
