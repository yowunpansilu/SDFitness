import { useState, useEffect } from 'react';
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
                templateId: selectedTemplate?.templateId,
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
            {/* Header */}
            <div className="glass-card border-dark-700 p-6 rounded-lg bg-gradient-to-br from-primary-900/20 via-dark-900 to-secondary-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-headline font-bold text-white mb-2 flex items-center gap-3">
                            <Dumbbell className="w-8 h-8 text-primary-400" />
                            Workout Tracking
                        </h1>
                        <p className="text-gray-400">
                            Track your workouts, monitor progress, and crush your fitness goals
                        </p>
                    </div>
                    <Button
                        variant="gym"
                        size="lg"
                        onClick={() => {
                            setSelectedTemplate(null);
                            startWorkout();
                            setShowLogForm(true);
                        }}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Quick Log
                    </Button>
                </div>
            </div>

            {/* Personal Records Banner */}
            {personalRecords.length > 0 && (
                <div className="glass-card border-dark-700 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Personal Records</h3>
                    <div className="flex flex-wrap gap-3">
                        {personalRecords.slice(0, 3).map((pr, idx) => (
                            <PersonalRecordsBadge key={idx} record={pr} animated={idx === 0} />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="templates" className="w-full" onValueChange={(value) => {
                if (value === 'history' && workoutHistory.length === 0) {
                    fetchHistory();
                }
            }}>
                <TabsList className="grid w-full grid-cols-3 bg-dark-800">
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search workouts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-dark-800 border-dark-600 text-white"
                            />
                        </div>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-dark-800 border-dark-600 text-white">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-800 border-dark-600">
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-dark-800 border-dark-600 text-white">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-800 border-dark-600">
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
                                <Skeleton key={i} className="h-[280px] bg-dark-800" />
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
                            <p className="text-gray-400">No workout templates found</p>
                            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4 mt-6">
                    {historyLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[120px] bg-dark-800" />
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
                            <p className="text-gray-400">No workout history yet</p>
                            <p className="text-gray-500 text-sm mt-2">Start logging workouts to see them here</p>
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
                            <p className="text-gray-400">No statistics available yet</p>
                            <p className="text-gray-500 text-sm mt-2">Complete workouts to see your progress</p>
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
