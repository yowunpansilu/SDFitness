import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Award, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface Trainer {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    specialization: string[];
    experienceYears: number;
    bio: string;
    availability: { day: string; startTime: string; endTime: string }[];
    createdAt: string;
}

const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    inactive: 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
    on_leave: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
};

export function TrainersList() {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('all');

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await api.get('/trainers');
                setTrainers(response.data);
            } catch (err) {
                console.error('Failed to fetch trainers:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    const filteredTrainers = trainers.filter((trainer) => {
        const firstName = trainer.user?.firstName || '';
        const lastName = trainer.user?.lastName || '';
        const email = trainer.user?.email || '';
        const matchesSearch =
            firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialization =
            specializationFilter === 'all' ||
            (trainer.specialization || []).some((s) =>
                s.toLowerCase().includes(specializationFilter.toLowerCase())
            );

        return matchesSearch && matchesSpecialization;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-3 text-gray-500 dark:text-gray-400">Loading trainers...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Trainers
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Manage personal trainers and their assignments
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/trainers/add')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trainer
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{trainers.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {new Set(trainers.flatMap(t => t.specialization || [])).size}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {trainers.length > 0
                                ? (trainers.reduce((sum, t) => sum + (t.experienceYears || 0), 0) / trainers.length).toFixed(1)
                                : 0} yrs
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                                placeholder="Search trainers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-full md:w-[200px] bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Specialization" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700">
                                <SelectItem value="all">All Specializations</SelectItem>
                                <SelectItem value="strength">Strength Training</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="yoga">Yoga</SelectItem>
                                <SelectItem value="crossfit">CrossFit</SelectItem>
                                <SelectItem value="hiit">HIIT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrainers.map((trainer) => (
                    <Card
                        key={trainer._id}
                        onClick={() => navigate(`/trainers/${trainer._id}`)}
                        className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-dark-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 cursor-pointer group"
                    >
                        <CardContent className="p-6">
                            {/* Trainer Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <Avatar className="h-16 w-16 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                                    <AvatarImage src={undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg font-semibold">
                                        {(trainer.user?.firstName || '?')[0]}{(trainer.user?.lastName || '?')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {trainer.user?.firstName} {trainer.user?.lastName}
                                    </h3>
                                    <Badge className={cn('mt-1', statusColors['active'] || statusColors.active)}>
                                        active
                                    </Badge>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{trainer.user?.email}</span>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specializations</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(trainer.specialization || []).slice(0, 2).map((spec) => (
                                        <Badge key={spec} className="bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 text-xs">
                                            {spec}
                                        </Badge>
                                    ))}
                                    {(trainer.specialization || []).length > 2 && (
                                        <Badge className="bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-700 text-xs">
                                            +{trainer.specialization.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
                                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Experience</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{trainer.experienceYears} yrs</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/20">
                                        <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Availability</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(trainer.availability || []).length} days</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTrainers.length === 0 && (
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No trainers found matching your criteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
