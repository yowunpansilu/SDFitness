import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Phone, Award, Users, TrendingUp } from 'lucide-react';
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
import { useEffect } from 'react';
import api from '@/lib/api/axios';

interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specializations: string[];
    certifications: string[];
    assignedMembers: number;
    rating: number;
    photoUrl?: string;
    status: 'active' | 'inactive' | 'on_leave';
    hireDate: string;
}

// Mock data
const mockTrainers: Trainer[] = [
    {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@sdfitness.com',
        phone: '+1 234 567 8901',
        specializations: ['Strength Training', 'Bodybuilding', 'Powerlifting'],
        certifications: ['NASM-CPT', 'CSCS'],
        assignedMembers: 24,
        rating: 4.8,
        photoUrl: undefined,
        status: 'active',
        hireDate: '2023-01-15',
    },
    {
        id: '2',
        firstName: 'Mike',
        lastName: 'Ross',
        email: 'mike.r@sdfitness.com',
        phone: '+1 234 567 8902',
        specializations: ['HIIT', 'Cardio', 'Weight Loss'],
        certifications: ['ACE-CPT', 'ACSM-CPT'],
        assignedMembers: 31,
        rating: 4.9,
        photoUrl: undefined,
        status: 'active',
        hireDate: '2022-08-20',
    },
    {
        id: '3',
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.w@sdfitness.com',
        phone: '+1 234 567 8903',
        specializations: ['Yoga', 'Pilates', 'Flexibility'],
        certifications: ['RYT-500', 'NASM-CPT'],
        assignedMembers: 28,
        rating: 5.0,
        photoUrl: undefined,
        status: 'active',
        hireDate: '2023-03-10',
    },
    {
        id: '4',
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.c@sdfitness.com',
        phone: '+1 234 567 8904',
        specializations: ['CrossFit', 'Functional Training', 'Sports Performance'],
        certifications: ['CrossFit L2', 'NSCA-CSCS'],
        assignedMembers: 19,
        rating: 4.7,
        photoUrl: undefined,
        status: 'on_leave',
        hireDate: '2021-11-05',
    },
];

const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function TrainersList() {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('all');

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await api.get('/auth/users?role=trainer');
                if (response.data.users && response.data.users.length > 0) {
                    setTrainers(response.data.users);
                } else {
                    setTrainers(mockTrainers);
                }
            } catch (error) {
                console.error('Error fetching trainers:', error);
                setTrainers(mockTrainers);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    const filteredTrainers = trainers.filter((trainer) => {
        const firstName = trainer.firstName || '';
        const lastName = trainer.lastName || '';
        const email = trainer.email || '';
        const name = `${firstName} ${lastName}`.toLowerCase();
        
        const matchesSearch =
            name.includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Trainers
                    </h1>
                    <p className="text-gray-400 mt-2">
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
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Trainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{trainers.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {trainers.filter((t) => t.status === 'active' || !t.status).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {trainers.reduce((sum, t) => sum + (t.assignedMembers || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Avg Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {trainers.length > 0 
                                ? (trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length).toFixed(1)
                                : '0.0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search trainers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-full md:w-[200px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Specialization" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Specializations</SelectItem>
                                <SelectItem value="strength">Strength Training</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="yoga">Yoga</SelectItem>
                                <SelectItem value="crossfit">CrossFit</SelectItem>
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
                        className="bg-dark-900/50 border-dark-800 backdrop-blur-sm hover:bg-dark-900/70 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 cursor-pointer group"
                    >
                        <CardContent className="p-6">
                            {/* Trainer Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <Avatar className="h-16 w-16 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                                    <AvatarImage src={trainer.profilePhoto} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg font-semibold">
                                        {trainer.firstName?.[0]}{trainer.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                        {trainer.firstName} {trainer.lastName}
                                    </h3>
                                    <Badge className={cn('mt-1', statusColors[trainer.status as keyof typeof statusColors] || statusColors.active)}>
                                        {(trainer.status || 'active').replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{trainer.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Phone className="h-4 w-4" />
                                    <span>{trainer.phone}</span>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm font-medium text-gray-300">Specializations</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(trainer.specializations || []).slice(0, 2).map((spec: string) => (
                                        <Badge key={spec} className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                            {spec}
                                        </Badge>
                                    ))}
                                    {(trainer.specializations || []).length > 2 && (
                                        <Badge className="bg-dark-800 text-gray-400 border-dark-700 text-xs">
                                            +{(trainer.specializations || []).length - 2}
                                        </Badge>
                                    )}
                                    {(trainer.specializations || []).length === 0 && (
                                        <span className="text-xs text-gray-500 italic">General Training</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                        <Users className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Members</p>
                                        <p className="text-sm font-semibold text-white">{trainer.assignedMembers}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-500/20">
                                        <TrendingUp className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Rating</p>
                                        <p className="text-sm font-semibold text-white">{trainer.rating || '0.0'} / 5.0</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTrainers.length === 0 && (
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-400">No trainers found matching your criteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
