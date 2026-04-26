import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    angle: number;
    speed: number;
    rotation: number;
    shape: 'circle' | 'rect' | 'star';
}

interface GoalCelebrationProps {
    goalType: 'weight_loss' | 'weight_gain' | 'maintenance';
    targetWeight: number;
    currentWeight: number;
    onClose: () => void;
}

// ─── Confetti Canvas ──────────────────────────────────────────────────────────

const COLORS = [
    '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981',
    '#f43f5e', '#fb923c', '#a3e635', '#60a5fa',
    '#e879f9', '#34d399'
];

function ConfettiCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Spawn 200 particles from center
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.45;

        particles.current = Array.from({ length: 200 }, (_, i) => ({
            id: i,
            x: cx + (Math.random() - 0.5) * 60,
            y: cy + (Math.random() - 0.5) * 60,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 10 + 5,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 12 + 4,
            rotation: Math.random() * 360,
            shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
        }));

        let gravity = 0.3;
        let elapsed = 0;

        const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? size : size / 2;
                ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            elapsed++;

            particles.current = particles.current.filter(p => p.y < canvas.height + 50);

            for (const p of particles.current) {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed + gravity * (elapsed / 20);
                p.speed *= 0.97;
                p.rotation += 6;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - elapsed / 180);

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

            if (elapsed < 200 && particles.current.length > 0) {
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GoalCelebration({
    goalType,
    targetWeight,
    currentWeight,
    onClose,
}: GoalCelebrationProps) {
    const [visible, setVisible] = useState(true);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 400);
    };

    const messages = {
        weight_loss: {
            title: '🎉 Goal Achieved!',
            subtitle: 'You reached your target weight!',
            body: `Amazing work! You've successfully dropped down to ${currentWeight} kg — exactly at your ${targetWeight} kg goal. Your dedication and consistency have paid off!`,
            badge: 'Weight Loss Champion',
        },
        weight_gain: {
            title: '🏆 Goal Achieved!',
            subtitle: 'You hit your target weight!',
            body: `Outstanding! You've successfully reached ${currentWeight} kg — right at your ${targetWeight} kg goal. Your hard training and nutrition plan worked perfectly!`,
            badge: 'Strength Builder',
        },
        maintenance: {
            title: '⭐ Goal Maintained!',
            subtitle: 'You are at your target weight!',
            body: `Impressive! You are maintaining ${currentWeight} kg, right at your ${targetWeight} kg goal. Consistency is the hardest part — and you've mastered it!`,
            badge: 'Consistency King',
        },
    };

    const msg = messages[goalType];

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Confetti blast */}
                    <ConfettiCanvas />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        {/* Modal card */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Animated gradient top bar */}
                            <div className="h-2 bg-gradient-to-r from-amber-400 via-violet-500 to-cyan-400 animate-pulse" />

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-8 text-center">
                                {/* Animated trophy icon */}
                                <motion.div
                                    animate={{ rotate: [-10, 10, -8, 8, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="mx-auto mb-4 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                                >
                                    <Trophy className="h-12 w-12 text-white" />
                                </motion.div>

                                {/* Floating stars */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            top: `${20 + Math.sin(i * 60) * 15}%`,
                                            left: `${15 + (i * 14)}%`,
                                        }}
                                        animate={{
                                            y: [-8, 8, -8],
                                            opacity: [0.4, 1, 0.4],
                                            scale: [0.8, 1.2, 0.8],
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.2,
                                            repeat: Infinity,
                                        }}
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
                                    {msg.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg font-semibold text-violet-600 mb-3"
                                >
                                    {msg.subtitle}
                                </motion.p>

                                {/* Badge */}
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold rounded-full border border-amber-200 mb-4"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {msg.badge}
                                </motion.span>

                                {/* Message */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-muted-foreground text-sm leading-relaxed mb-6"
                                >
                                    {msg.body}
                                </motion.p>

                                {/* Weight display */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="flex justify-center gap-8 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                                >
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Current</p>
                                        <p className="text-2xl font-bold text-emerald-600">{currentWeight} kg</p>
                                    </div>
                                    <div className="w-px bg-border" />
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Target</p>
                                        <p className="text-2xl font-bold text-violet-600">{targetWeight} kg</p>
                                    </div>
                                </motion.div>

                                {/* Action button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <Button
                                        onClick={handleClose}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl"
                                    >
                                        Continue My Journey 🚀
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
