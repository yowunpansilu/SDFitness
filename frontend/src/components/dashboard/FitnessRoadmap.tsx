import { motion } from 'framer-motion';
import { Target, Flag, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface WeightLog {
    _id: string;
    weight: number;
    unit: string;
    weightKg: number;
    date: string;
}

interface WeightGoal {
    startWeight: number;
    targetWeight: number;
    type: 'lose' | 'gain';
    startDate: string;
}

interface FitnessRoadmapProps {
    logs: WeightLog[];
    goal?: WeightGoal;
}

export function FitnessRoadmap({ logs, goal }: FitnessRoadmapProps) {
    if (!logs || logs.length === 0) return null;

    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Limit to last 5 logs for the roadmap view to keep it clean
    const recentLogs = sortedLogs.slice(-5);

    return (
        <div className="relative py-8 px-4">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

            <div className="flex justify-between items-center relative z-10">
                {/* Start Point */}
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white border-4 border-background shadow-lg"
                    >
                        <Flag className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xs font-bold mt-2">Start</span>
                    <span className="text-[10px] text-muted-foreground">{goal ? `${goal.startWeight}kg` : `${sortedLogs[0].weightKg}kg`}</span>
                </div>

                {/* Log Points */}
                {recentLogs.map((log, index) => (
                    <div key={log._id} className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-4 h-4 rounded-full bg-secondary-500 border-2 border-background shadow-sm"
                        >
                            <Circle className="w-full h-full fill-current" />
                        </motion.div>
                        <span className="text-[10px] font-medium mt-2">{log.weightKg}kg</span>
                        <span className="text-[8px] text-muted-foreground">{format(new Date(log.date), 'MMM d')}</span>
                    </div>
                ))}

                {/* Target Point */}
                {goal && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center text-white border-4 border-background shadow-xl"
                        >
                            <Target className="w-6 h-6" />
                        </motion.div>
                        <span className="text-xs font-bold mt-2 text-primary-600">Goal</span>
                        <span className="text-[10px] font-bold">{goal.targetWeight}kg</span>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground italic">
                {goal ? (
                    goal.type === 'lose'
                        ? `${Math.max(0, logs[logs.length - 1].weightKg - goal.targetWeight).toFixed(1)}kg to go!`
                        : `${Math.max(0, goal.targetWeight - logs[logs.length - 1].weightKg).toFixed(1)}kg to go!`
                ) : (
                    "Set a goal to visualize your journey!"
                )}
            </div>
        </div>
    );
}
