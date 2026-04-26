import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Dumbbell, Apple, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Confetti Canvas ──────────────────────────────────────────────────────────

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#a3e635', '#60a5fa', '#fb923c'];

function ConfettiCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const cx = canvas.width / 2;
        const cy = canvas.height * 0.42;

        const particles = Array.from({ length: 220 }, (_, i) => ({
            id: i,
            x: cx + (Math.random() - 0.5) * 80,
            y: cy + (Math.random() - 0.5) * 40,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 12 + 4,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 14 + 5,
            rotation: Math.random() * 360,
            shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
        }));

        let elapsed = 0;
        const gravity = 0.28;

        const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            c.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? size : size / 2;
                c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
            }
            c.closePath();
            c.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            elapsed++;

            for (const p of particles) {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed + gravity * (elapsed / 18);
                p.speed *= 0.97;
                p.rotation += 7;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - elapsed / 160);

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    drawStar(ctx, 0, 0, p.size / 2);
                }
                ctx.restore();
            }

            if (elapsed < 180) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9998]"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}

// ─── Main Celebration Component ───────────────────────────────────────────────

interface DailyGoalCelebrationProps {
    onClose: () => void;
}

export default function DailyGoalCelebration({ onClose }: DailyGoalCelebrationProps) {
    const [visible, setVisible] = useState(true);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 400);
    };

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    return (
        <AnimatePresence>
            {visible && (
                <>
                    <ConfettiCanvas />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Rainbow top bar */}
                            <div className="h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-violet-500" />

                            {/* Close */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-8 text-center">
                                {/* Two animated icons */}
                                <div className="flex justify-center gap-4 mb-5">
                                    <motion.div
                                        animate={{ rotate: [-15, 15, -10, 10, 0], scale: [1, 1.25, 1] }}
                                        transition={{ duration: 0.9, delay: 0.2 }}
                                        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg"
                                    >
                                        <Dumbbell className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: [15, -15, 10, -10, 0], scale: [1, 1.25, 1] }}
                                        transition={{ duration: 0.9, delay: 0.35 }}
                                        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                                    >
                                        <Apple className="h-8 w-8 text-white" />
                                    </motion.div>
                                </div>

                                {/* Floating stars */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        style={{ top: `${22 + Math.sin(i * 72) * 12}%`, left: `${12 + i * 18}%` }}
                                        animate={{ y: [-6, 6, -6], opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
                                    >
                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                    </motion.div>
                                ))}

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl font-bold mb-1"
                                >
                                    🎉 Daily Goal Crushed!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-base text-muted-foreground mb-4"
                                >
                                    {today}
                                </motion.p>

                                {/* Achievement badge */}
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200 mb-5"
                                >
                                    <Zap className="h-3.5 w-3.5 fill-emerald-600" />
                                    Perfect Day — Workout + Diet ✓
                                </motion.span>

                                {/* Checklist recap */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex gap-4 justify-center mb-5"
                                >
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200">
                                        <Dumbbell className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700">Workout Done</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200">
                                        <Apple className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-700">Diet Logged</span>
                                    </div>
                                </motion.div>

                                {/* Motivational message */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-sm text-muted-foreground leading-relaxed mb-6"
                                >
                                    You completed <strong>both</strong> your workout and diet goals today. 
                                    Every perfect day brings you one step closer to your ultimate goal. 
                                    Keep this streak alive! 🔥
                                </motion.p>

                                {/* Calories/flame decoration */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.85 }}
                                    className="flex justify-center gap-6 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                                >
                                    <div className="text-center">
                                        <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                                        <p className="text-xs text-muted-foreground">Calories tracked</p>
                                        <p className="font-bold text-orange-500">✓</p>
                                    </div>
                                    <div className="w-px bg-border" />
                                    <div className="text-center">
                                        <Dumbbell className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                                        <p className="text-xs text-muted-foreground">Exercise done</p>
                                        <p className="font-bold text-emerald-500">✓</p>
                                    </div>
                                    <div className="w-px bg-border" />
                                    <div className="text-center">
                                        <Star className="h-5 w-5 text-amber-400 mx-auto mb-1 fill-amber-400" />
                                        <p className="text-xs text-muted-foreground">Perfect day</p>
                                        <p className="font-bold text-amber-500">✓</p>
                                    </div>
                                </motion.div>

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.95 }}
                                >
                                    <Button
                                        onClick={handleClose}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl text-base"
                                    >
                                        Keep It Up! 💪
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
