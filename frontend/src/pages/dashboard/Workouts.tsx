import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, History, BarChart3, Search, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { WorkoutLogForm } from '@/components/workout/WorkoutLogForm';
import { WorkoutHistoryCard } from '@/components/workout/WorkoutHistoryCard';
import { WorkoutStatsChart } from '@/components/workout/WorkoutStatsChart';
import { PersonalRecordsBadge } from '@/components/workout/PersonalRecordsBadge';
import { useWorkoutStore } from '@/lib/stores/workoutStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { getWorkoutTemplates, logWorkout, getWorkoutHistory } from '@/lib/api/workoutApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function Workouts() {
    const { toast } = useToast();
    const { user } = useAuthStore();
    const {
        templates,
        setTemplates,
        templatesLoading,
        setTemplatesLoading,
        selectedTemplate,
        setSelectedTemplate,
        workoutHistory,
        setWorkoutHistory,
        historyLoading,
        setHistoryLoading,
        stats,
        setStats,
        personalRecords,
        setPersonalRecords,
        startWorkout,
        completeWorkout,
        addWorkoutToHistory,
    } = useWorkoutStore();

    const [showLogForm, setShowLogForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Fetch templates on mount
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Fetch history when switching to history tab
    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        try {
            const filters: any = {};
            if (difficultyFilter !== 'all') filters.difficulty = difficultyFilter;
            if (categoryFilter !== 'all') filters.category = categoryFilter;

            const data = await getWorkoutTemplates(filters);
            setTemplates(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load workout templates',
                variant: 'destructive',
            });
        } finally {
            setTemplatesLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!user?.id) return;

        setHistoryLoading(true);
        try {
            const { data, stats: workoutStats } = await getWorkoutHistory(user.id, {
                limit: 20,
            });
            setWorkoutHistory(data);
            setStats(workoutStats);

            // Extract personal records
            const allPRs = data.flatMap(w => w.personalRecords || []);
            setPersonalRecords(allPRs);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load workout history',
                variant: 'destructive',
            });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleStartWorkout = (template: any) => {
        setSelectedTemplate(template);
        startWorkout(template);
        setShowLogForm(true);
    };

    const handleSaveWorkout = async (workoutData: any) => {
        if (!user?.id) return;

        try {
            const savedWorkout = await logWorkout({
                memberId: user.id,
                templateId: selectedTemplate?._id,
                workoutDate: new Date(),
                ...workoutData,
            });

            addWorkoutToHistory(savedWorkout);
            completeWorkout();
            setShowLogForm(false);

            // Refresh stats
            fetchHistory();
        } catch (error) {
            throw error;
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    useEffect(() => {
        fetchTemplates();
    }, [difficultyFilter, categoryFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Premium Workout Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[200px] rounded-[2.5rem] overflow-hidden group shadow-xl shadow-primary-900/5 bg-white border border-primary-50"
            >
                {/* Background Image with Light Overlay */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 opacity-30">
                    <img 
                        src="/assets/images/workout-bg.png" 
                        alt="Workout Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/20" />

                {/* Content Overlay */}
                <div className="relative h-full flex items-center justify-between px-12 z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-headline font-black text-primary-900 leading-tight tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-2xl shadow-sm">
                                <Dumbbell className="w-8 h-8 text-secondary-500" />
                            </div>
                            Workout Tracking
                        </h1>
                        <p className="text-primary-600 text-lg font-medium mt-2 max-w-md">
                            Track your sessions, monitor PRs, and accelerate your performance.
                        </p>
                    </motion.div>

                    <Button
                        variant="gym"
                        size="lg"
                        className="h-14 px-8 rounded-2xl bg-secondary-500 hover:bg-secondary-600 text-white font-bold gap-3 shadow-xl shadow-secondary-500/20 group-hover:scale-105 transition-transform"
                        onClick={() => {
                            setSelectedTemplate(null);
                            startWorkout();
                            setShowLogForm(true);
                        }}
                    >
                        <Plus className="w-6 h-6" />
                        Quick Log Session
                    </Button>
                </div>
            </motion.div>

            {/* Personal Records Banner */}
            {personalRecords.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-primary-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BarChart3 className="w-32 h-32 text-primary-900" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-2 w-12 bg-secondary-500 rounded-full" />
                        <h3 className="text-sm font-bold text-primary-900 uppercase tracking-widest">Performance Milestones</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {personalRecords.slice(0, 3).map((pr, idx) => (
                            <PersonalRecordsBadge key={idx} record={pr} animated={idx === 0} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="templates" className="w-full" onValueChange={(value) => {
                if (value === 'history' && workoutHistory.length === 0) {
                    fetchHistory();
                }
            }}>
                <TabsList className="grid w-full grid-cols-3 bg-card">
                    <TabsTrigger value="templates">
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Stats
                    </TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4 mt-6">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search workouts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card border-border text-foreground"
                            />
                        </div>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border text-foreground">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border text-foreground">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="strength">Strength</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="hiit">HIIT</SelectItem>
                                <SelectItem value="full_body">Full Body</SelectItem>
                                <SelectItem value="upper_body">Upper Body</SelectItem>
                                <SelectItem value="lower_body">Lower Body</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Templates Grid */}
                    {templatesLoading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-[280px] bg-card" />
                            ))}
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredTemplates.map((template) => (
                                <WorkoutTemplateCard
                                    key={template.templateId}
                                    template={template}
                                    onStartWorkout={handleStartWorkout}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">No workout templates found</p>
                            <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4 mt-6">
                    {historyLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[120px] bg-card" />
                            ))}
                        </div>
                    ) : workoutHistory.length > 0 ? (
                        <div className="space-y-4">
                            {workoutHistory.map((workout) => (
                                <WorkoutHistoryCard key={workout.workoutId} workout={workout} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">No workout history yet</p>
                            <p className="text-muted-foreground text-sm mt-2">Start logging workouts to see them here</p>
                            <Button
                                variant="gym"
                                className="mt-4"
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    startWorkout();
                                    setShowLogForm(true);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Log Your First Workout
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" className="mt-6">
                    {stats ? (
                        <WorkoutStatsChart stats={stats} history={workoutHistory} />
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">No statistics available yet</p>
                            <p className="text-muted-foreground text-sm mt-2">Complete workouts to see your progress</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Workout Log Form Dialog */}
            <WorkoutLogForm
                open={showLogForm}
                onClose={() => {
                    setShowLogForm(false);
                    setSelectedTemplate(null);
                }}
                template={selectedTemplate || undefined}
                onSave={handleSaveWorkout}
            />
        </div>
    );
}
